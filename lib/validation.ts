import { z } from 'zod';

/**
 * Validation schemas for API endpoints
 */

// Common schemas
export const uuidSchema = z.string().uuid();

// /api/calls/start
export const startCallSchema = z.object({
  personalityId: z.string().uuid().optional(),
});

// /api/calls/save-transcript
export const saveTranscriptSchema = z.object({
  callLogId: z.string().uuid(),
  transcript: z.array(z.object({
    role: z.enum(['agent', 'user']),
    message: z.string(),
    timestamp: z.number().optional(),
  })),
  durationSeconds: z.number().min(0).max(600), // Max 10 minutes
});

// /api/calls/score
export const scoreCallSchema = z.object({
  callLogId: z.string().uuid(),
});

// /api/stripe/checkout
export const checkoutSchema = z.object({
  priceId: z.string().min(1),
  planType: z.enum(['trial', 'paid']),
});

// /api/privacy
export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private']).optional(),
  showStatsPublicly: z.boolean().optional(),
  showOnLeaderboard: z.boolean().optional(),
});

// /api/user/profile
export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
});

/**
 * Helper to validate request body with a schema
 * Returns parsed data or throws with user-friendly error
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json().catch(() => ({}));

  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    throw new ValidationError('Invalid request body', errors);
  }

  return result.data;
}

/**
 * Custom validation error with structured errors
 */
export class ValidationError extends Error {
  public readonly errors: Array<{ path: string; message: string }>;

  constructor(message: string, errors: Array<{ path: string; message: string }>) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
