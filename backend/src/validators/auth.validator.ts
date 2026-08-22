import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).max(100),
  email: z.string().email({ message: 'Invalid email address' }).toLowerCase().trim(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).toLowerCase().trim(),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).max(100).optional(),
  avatar: z.string().url({ message: 'Avatar must be a valid URL' }).optional().nullable(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
