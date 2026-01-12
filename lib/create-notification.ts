import { pool } from './db';

export interface CreateNotificationParams {
  userId: string; // Internal user ID (UUID)
  type: 'badge_earned' | 'belt_upgrade' | 'power_gained' | 'streak_milestone' | 'level_up' | 'coaching_ready';
  title: string;
  message: string;
  metadata?: Record<string, string | number | boolean>;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await pool().query(
      `INSERT INTO user_notifications (user_id, type, title, message, metadata, read, created_at)
       VALUES ($1, $2, $3, $4, $5, FALSE, NOW())`,
      [
        params.userId,
        params.type,
        params.title,
        params.message,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );
  } catch (error) {
    console.error('[createNotification] Failed to create notification:', error);
    // Don't throw - notifications are non-critical
  }
}
