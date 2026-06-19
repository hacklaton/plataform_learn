import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// ── Read ──────────────────────────────────────────────────────
router.get('/records',          authenticate, AttendanceController.getAttendanceRecords);
router.get('/logs',             authenticate, AttendanceController.getLiveLogs);
router.get('/monthly',          authenticate, AttendanceController.getMonthlyAttendance);
router.get('/monthly/summary',  authenticate, AttendanceController.getMonthlySummary);
router.get('/user/:userId/summary', authenticate, AttendanceController.getUserSummary);

// ── Write ─────────────────────────────────────────────────────
router.post('/scan-face',       authenticate, AttendanceController.scanFace);
router.post('/manual',          authenticate, AttendanceController.manuallyMarkAttendance);

// ── Biometric face registration ──────────────────────────────
// POST /attendance/register-face   → uses req.user.id (self)
// POST /attendance/register-face/:userId → admin registers face for specific user
router.post('/register-face',            authenticate, AttendanceController.registerFace);
router.post('/register-face/:userId',    authenticate, AttendanceController.registerFace);

// ── CRUD on individual records ────────────────────────────────
router.put('/:id',              authenticate, AttendanceController.updateRecord);
router.delete('/:id',           authenticate, AttendanceController.deleteRecord);

export default router;
