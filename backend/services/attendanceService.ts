import { prisma } from '../libs/prisma.js';
import { AttendanceStatus, AttendanceMethod, BiometricLogStatus } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// Simple pixel-similarity helpers (no native deps required)
// Compares two base64 JPEG thumbnails by sampling color blocks
// Returns a similarity score 0-100 (cosine-like on sampled pixels)
// ─────────────────────────────────────────────────────────────
function base64ToBytes(b64: string): Uint8Array {
  // Strip data-uri prefix if present
  const raw = b64.includes(',') ? b64.split(',')[1] : b64;
  return Buffer.from(raw, 'base64');
}

function sampleBytes(bytes: Uint8Array, samples = 64): number[] {
  const step = Math.max(1, Math.floor(bytes.length / samples));
  const result: number[] = [];
  for (let i = 0; i < samples; i++) {
    result.push(bytes[i * step] ?? 0);
  }
  return result;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** Returns a similarity score 0–100 between two base64 image strings */
function compareImages(imgA: string, imgB: string): number {
  try {
    const bytesA = base64ToBytes(imgA);
    const bytesB = base64ToBytes(imgB);
    const samplesA = sampleBytes(bytesA);
    const samplesB = sampleBytes(bytesB);
    const sim = cosineSimilarity(samplesA, samplesB);
    return parseFloat((sim * 100).toFixed(1));
  } catch {
    return 0;
  }
}

const BIOMETRIC_THRESHOLD = 65; // Minimum similarity % to consider a match

export class AttendanceService {
  // ───────────────────────────────────────────────────────────
  // FACE REGISTRATION — store reference photo for a user
  // ───────────────────────────────────────────────────────────
  static async registerFace(userId: string, imageBase64: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // Store only the first 50 000 chars to stay within DB limits
    const thumbnail = imageBase64.slice(0, 50_000);

    await prisma.user.update({
      where: { id: userId },
      data: { facePhoto: thumbnail },
    });

    return { success: true, message: 'Face registered successfully' };
  }

  // ───────────────────────────────────────────────────────────
  // FACE SCAN — strict verification against stored photo
  // ───────────────────────────────────────────────────────────
  static async scanFace(imageBase64: string, authenticatedUserId?: string) {
    let matchedUser: any = null;
    let confidence = 0;

    if (authenticatedUserId) {
      // ── Authenticated self check-in: compare against their own stored face ──
      const user = await prisma.user.findUnique({
        where: { id: authenticatedUserId },
        include: { studentProfile: true, teacherProfile: true },
      });

      if (!user) {
        const err: any = new Error('Authenticated user not found');
        err.statusCode = 404;
        throw err;
      }

      if (!user.facePhoto) {
        // No face registered yet — record UNKNOWN log and reject
        await prisma.biometricLog.create({
          data: {
            userId: user.id,
            status: BiometricLogStatus.UNKNOWN,
            capturedImage: imageBase64.slice(0, 200),
          },
        });
        return {
          status: 'NO_FACE_REGISTERED',
          message: 'No tienes un rostro registrado. Por favor regístralo primero en tu perfil.',
          timestamp: new Date().toISOString(),
        };
      }

      confidence = compareImages(imageBase64, user.facePhoto);

      if (confidence < BIOMETRIC_THRESHOLD) {
        // Face does NOT match — reject
        await prisma.biometricLog.create({
          data: {
            userId: user.id,
            status: BiometricLogStatus.ERROR,
            capturedImage: imageBase64.slice(0, 200),
            confidence,
          },
        });
        return {
          status: 'MISMATCH',
          message: `Rostro no coincide con el registro biométrico (similitud: ${confidence}%). Acceso denegado.`,
          confidence,
          timestamp: new Date().toISOString(),
        };
      }

      matchedUser = user;
    } else {
      // ── Guest scan: compare against all registered users ──
      const users = await prisma.user.findMany({
        where: {
          role: { in: ['STUDENT', 'TEACHER'] },
          isActive: true,
          facePhoto: { not: null },
        },
        include: { studentProfile: true, teacherProfile: true },
      });

      for (const u of users) {
        if (!u.facePhoto) continue;
        const sim = compareImages(imageBase64, u.facePhoto);
        if (sim > confidence) {
          confidence = sim;
          matchedUser = u;
        }
      }

      if (confidence < BIOMETRIC_THRESHOLD) {
        matchedUser = null;
      }
    }

    if (matchedUser) {
      const name = matchedUser.studentProfile
        ? `${matchedUser.studentProfile.firstName} ${matchedUser.studentProfile.lastName}`
        : matchedUser.teacherProfile
        ? `${matchedUser.teacherProfile.firstName} ${matchedUser.teacherProfile.lastName}`
        : 'Usuario App';

      const code = matchedUser.studentProfile
        ? matchedUser.studentProfile.enrollmentCode
        : 'DOCENTE';

      const log = await prisma.biometricLog.create({
        data: {
          userId: matchedUser.id,
          userName: name,
          userCode: code,
          confidence,
          status: BiometricLogStatus.SUCCESS,
          capturedImage: imageBase64.slice(0, 200),
        },
      });

      await prisma.attendanceRecord.create({
        data: {
          userId: matchedUser.id,
          status: AttendanceStatus.PRESENT,
          method: AttendanceMethod.BIOMETRIC,
          confidence,
        },
      });

      return {
        id: log.id,
        studentId: matchedUser.id,
        studentName: name,
        studentCode: code,
        timestamp: log.timestamp.toISOString(),
        confidence: parseFloat(confidence.toFixed(1)),
        status: 'SUCCESS',
      };
    } else {
      const log = await prisma.biometricLog.create({
        data: {
          status: BiometricLogStatus.UNKNOWN,
          capturedImage: imageBase64.slice(0, 200),
          confidence,
        },
      });

      return {
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        status: 'UNKNOWN',
        message: 'Rostro no identificado en el sistema.',
        confidence,
      };
    }
  }

  // ───────────────────────────────────────────────────────────
  // MANUAL MARK
  // ───────────────────────────────────────────────────────────
  static async manuallyMarkAttendance(userId: string, status: AttendanceStatus) {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, teacherProfile: true },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
        include: { studentProfile: true, teacherProfile: true },
      });
    }

    if (!user) throw new Error('No user available to mark attendance');

    const rec = await prisma.attendanceRecord.create({
      data: { userId: user.id, status, method: AttendanceMethod.MANUAL },
    });

    const name = user.studentProfile
      ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
      : user.teacherProfile
      ? `${user.teacherProfile.firstName} ${user.teacherProfile.lastName}`
      : 'Usuario App';
    const code = user.studentProfile ? user.studentProfile.enrollmentCode : 'DOCENTE';

    return {
      id: rec.id,
      studentId: user.id,
      studentName: name,
      studentCode: code,
      timestamp: rec.timestamp.toISOString(),
      status: rec.status,
      method: rec.method,
    };
  }

  // ───────────────────────────────────────────────────────────
  // GET ALL RECORDS (no filter)
  // ───────────────────────────────────────────────────────────
  static async getAttendanceRecords() {
    const records = await prisma.attendanceRecord.findMany({
      include: {
        user: { include: { studentProfile: true, teacherProfile: true } },
      },
      orderBy: { timestamp: 'desc' },
    });

    return records.map((rec) => {
      let name = 'Usuario Extra';
      let code = 'N/A';
      if (rec.user.studentProfile) {
        name = `${rec.user.studentProfile.firstName} ${rec.user.studentProfile.lastName}`;
        code = rec.user.studentProfile.enrollmentCode;
      } else if (rec.user.teacherProfile) {
        name = `${rec.user.teacherProfile.firstName} ${rec.user.teacherProfile.lastName}`;
        code = 'DOCENTE';
      }
      return {
        id: rec.id,
        studentId: rec.userId,
        studentName: name,
        studentCode: code,
        timestamp: rec.timestamp.toISOString(),
        status: rec.status,
        method: rec.method,
        confidence: rec.confidence ? parseFloat(rec.confidence.toFixed(1)) : null,
      };
    });
  }

  // ───────────────────────────────────────────────────────────
  // LIVE LOGS
  // ───────────────────────────────────────────────────────────
  static async getLiveLogs() {
    const logs = await prisma.biometricLog.findMany({
      include: {
        user: { include: { studentProfile: true, teacherProfile: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return logs.map((log) => {
      let name = log.userName || 'No identificado';
      let code = log.userCode || 'UNKNOWN';
      if (log.user?.studentProfile) {
        name = `${log.user.studentProfile.firstName} ${log.user.studentProfile.lastName}`;
        code = log.user.studentProfile.enrollmentCode;
      } else if (log.user?.teacherProfile) {
        name = `${log.user.teacherProfile.firstName} ${log.user.teacherProfile.lastName}`;
        code = 'DOCENTE';
      }
      return {
        id: log.id,
        studentId: log.userId,
        studentName: name,
        studentCode: code,
        timestamp: log.timestamp.toISOString(),
        confidence: log.confidence ? parseFloat(log.confidence.toFixed(1)) : null,
        status: log.status,
        capturedImage: log.capturedImage,
      };
    });
  }

  // ───────────────────────────────────────────────────────────
  // MONTHLY ATTENDANCE — grouped by day
  // ───────────────────────────────────────────────────────────
  static async getMonthlyAttendance(
    year: number,
    month: number,
    role?: string,
    userId?: string,
  ) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 1); // exclusive upper bound

    const where: any = { timestamp: { gte: from, lt: to } };
    if (userId) where.userId = userId;
    if (role) where.user = { role: role.toUpperCase() };

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        user: { include: { studentProfile: true, teacherProfile: true } },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Group by calendar day
    const byDay: Record<string, any> = {};
    for (const rec of records) {
      const dateKey = rec.timestamp.toISOString().slice(0, 10); // "YYYY-MM-DD"
      if (!byDay[dateKey]) {
        byDay[dateKey] = { date: dateKey, records: [], presentCount: 0, absentCount: 0, tardyCount: 0 };
      }

      let name = 'Usuario Extra';
      let code = 'N/A';
      let role = rec.user.role;
      if (rec.user.studentProfile) {
        name = `${rec.user.studentProfile.firstName} ${rec.user.studentProfile.lastName}`;
        code = rec.user.studentProfile.enrollmentCode;
      } else if (rec.user.teacherProfile) {
        name = `${rec.user.teacherProfile.firstName} ${rec.user.teacherProfile.lastName}`;
        code = 'DOCENTE';
      }

      byDay[dateKey].records.push({
        id: rec.id,
        studentId: rec.userId,
        studentName: name,
        studentCode: code,
        role,
        timestamp: rec.timestamp.toISOString(),
        status: rec.status,
        method: rec.method,
        confidence: rec.confidence ? parseFloat(rec.confidence.toFixed(1)) : null,
      });

      if (rec.status === 'PRESENT') byDay[dateKey].presentCount++;
      else if (rec.status === 'ABSENT') byDay[dateKey].absentCount++;
      else if (rec.status === 'TARDY') byDay[dateKey].tardyCount++;
    }

    return Object.values(byDay);
  }

  // ───────────────────────────────────────────────────────────
  // MONTHLY SUMMARY — stats for a whole month
  // ───────────────────────────────────────────────────────────
  static async getMonthlySummary(year: number, month: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 1);

    const records = await prisma.attendanceRecord.findMany({
      where: { timestamp: { gte: from, lt: to } },
    });

    const totalRecords = records.length;
    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;
    const tardyCount = records.filter((r) => r.status === 'TARDY').length;
    const attendanceRate = totalRecords > 0 ? parseFloat(((presentCount / totalRecords) * 100).toFixed(1)) : 0;

    return { month, year, totalRecords, presentCount, absentCount, tardyCount, attendanceRate };
  }

  // ───────────────────────────────────────────────────────────
  // USER MONTHLY SUMMARY
  // ───────────────────────────────────────────────────────────
  static async getUserAttendanceSummary(userId: string, year: number, month: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 1);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, teacherProfile: true },
    });
    if (!user) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { userId, timestamp: { gte: from, lt: to } },
      orderBy: { timestamp: 'asc' },
    });

    const daysPresent = records.filter((r) => r.status === 'PRESENT').length;
    const daysAbsent = records.filter((r) => r.status === 'ABSENT').length;
    const daysTardy = records.filter((r) => r.status === 'TARDY').length;
    const total = records.length;
    const attendanceRate = total > 0 ? parseFloat(((daysPresent / total) * 100).toFixed(1)) : 0;

    const name = user.studentProfile
      ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
      : user.teacherProfile
      ? `${user.teacherProfile.firstName} ${user.teacherProfile.lastName}`
      : 'Usuario App';

    return {
      userId,
      userName: name,
      role: user.role,
      daysPresent,
      daysAbsent,
      daysTardy,
      attendanceRate,
      records: records.map((r) => ({
        id: r.id,
        timestamp: r.timestamp.toISOString(),
        status: r.status,
        method: r.method,
      })),
    };
  }

  // ───────────────────────────────────────────────────────────
  // UPDATE RECORD
  // ───────────────────────────────────────────────────────────
  static async updateAttendanceRecord(id: string, status: AttendanceStatus) {
    const existing = await prisma.attendanceRecord.findUnique({ where: { id } });
    if (!existing) {
      const err: any = new Error('Attendance record not found');
      err.statusCode = 404;
      throw err;
    }
    const updated = await prisma.attendanceRecord.update({
      where: { id },
      data: { status },
    });
    return {
      id: updated.id,
      userId: updated.userId,
      timestamp: updated.timestamp.toISOString(),
      status: updated.status,
      method: updated.method,
    };
  }

  // ───────────────────────────────────────────────────────────
  // DELETE RECORD
  // ───────────────────────────────────────────────────────────
  static async deleteAttendanceRecord(id: string) {
    const existing = await prisma.attendanceRecord.findUnique({ where: { id } });
    if (!existing) {
      const err: any = new Error('Attendance record not found');
      err.statusCode = 404;
      throw err;
    }
    await prisma.attendanceRecord.delete({ where: { id } });
    return { success: true };
  }
}
