import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  username: z.string().min(3, "Username too short").max(20, "Username too long"),
  email: z.string().email(),
  password: z.string().min(6),
});

export const SubmitFlagSchema = z.object({
  challengeId: z.string().uuid(),
  flag: z.string().min(1, "Flag cannot be empty"),
});

export const CreateChallengeSchema = z.object({
  title: z.string().min(3),
  category: z.string(),
  description: z.string(),
  points: z.coerce.number().positive(), // coerce превращает строку в число
  flag: z.string().min(1),
  author: z.string().optional(),
});