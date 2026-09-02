import { prisma } from '@/lib/db/prisma';

export const TokenService = {
  /**
   * Generates and saves a 6-digit OTP code for password reset
   */
  async createPasswordResetOtp(
    identifier: string,
    token: string,
    type: 'EMAIL' | 'PHONE',
    role: 'CUSTOMER' | 'SELLER'
  ) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

    try {
      // Invalidate old unused tokens
      await prisma.$executeRaw`
        UPDATE password_reset_tokens 
        SET used = 1 
        WHERE identifier = ${identifier} AND used = 0
      `;

      // Insert new token record
      await prisma.$executeRaw`
        INSERT INTO password_reset_tokens (identifier, token, type, role, expires_at, used, created_at)
        VALUES (${identifier}, ${token}, ${type}, ${role}, ${expiresAt}, 0, NOW(3))
      `;

      return { token, expiresAt };
    } catch (e) {
      // If table needs creation fallback
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          identifier VARCHAR(191) NOT NULL,
          token VARCHAR(191) NOT NULL,
          type VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
          role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
          expires_at DATETIME(3) NOT NULL,
          used BOOLEAN NOT NULL DEFAULT 0,
          created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          INDEX idx_identifier (identifier),
          INDEX idx_token (token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      // Retry insert
      await prisma.$executeRaw`
        INSERT INTO password_reset_tokens (identifier, token, type, role, expires_at, used, created_at)
        VALUES (${identifier}, ${token}, ${type}, ${role}, ${expiresAt}, 0, NOW(3))
      `;

      return { token, expiresAt };
    }
  },

  /**
   * Verifies if an OTP code is valid and not expired
   */
  async verifyOtp(identifier: string, token: string) {
    try {
      const records = await prisma.$queryRaw<any[]>`
        SELECT * FROM password_reset_tokens 
        WHERE identifier = ${identifier} 
          AND token = ${token} 
          AND used = 0 
          AND expires_at > NOW(3) 
        ORDER BY id DESC 
        LIMIT 1
      `;

      return records && records.length > 0 ? records[0] : null;
    } catch (err) {
      console.error('Verify OTP database error:', err);
      return null;
    }
  },

  /**
   * Marks an OTP code as used
   */
  async markOtpUsed(id: number | bigint | string) {
    try {
      const numericId = typeof id === 'string' ? BigInt(id) : id;
      await prisma.$executeRaw`
        UPDATE password_reset_tokens 
        SET used = 1 
        WHERE id = ${numericId}
      `;
    } catch (err) {
      console.error('Mark OTP used error:', err);
    }
  },
};
