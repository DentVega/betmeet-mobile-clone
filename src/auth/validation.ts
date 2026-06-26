/**
 * zod schemas — the canonical, pure validators for the auth forms (ADR-005).
 * Messages are i18n message-keys (resolved with i18n `tr()` in the component),
 * not literal copy. Mirrors the web zod rules (FR-A1, FR-REFINE-15.12).
 */
import { z } from 'zod';

const emailField = z
  .string()
  .trim()
  .min(1, { message: 'auth.errors.emailRequired' })
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'auth.errors.emailInvalid',
  });

const passwordField = z
  .string()
  .min(8, { message: 'auth.errors.passwordTooShort' });

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, { message: 'auth.errors.passwordRequired' }),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirm: z.string().min(1, { message: 'auth.errors.confirmRequired' }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'auth.errors.confirmMismatch',
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotSchema = z.object({ email: emailField });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirm: z.string().min(1, { message: 'auth.errors.confirmRequired' }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'auth.errors.confirmMismatch',
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
