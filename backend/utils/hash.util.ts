import bcrypt from 'bcryptjs';

export class HashUtil {
  static async hashPassword(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(plain, salt);
  }

  static async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
