import {
  signInSchema,
  signUpSchema,
  forgotSchema,
  resetPasswordSchema,
} from '../validation';

const hasIssue = (r: { success: boolean; error?: { issues: { message: string }[] } }, key: string) =>
  !r.success && !!r.error?.issues.some((i) => i.message === key);

describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    expect(signInSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });
  it('rejects invalid email', () => {
    expect(hasIssue(signInSchema.safeParse({ email: 'nope', password: 'x' }), 'auth.errors.emailInvalid')).toBe(true);
  });
  it('requires a password', () => {
    expect(hasIssue(signInSchema.safeParse({ email: 'a@b.com', password: '' }), 'auth.errors.passwordRequired')).toBe(true);
  });
});

describe('signUpSchema', () => {
  it('accepts a valid signup', () => {
    expect(signUpSchema.safeParse({ email: 'a@b.com', password: '12345678', confirm: '12345678' }).success).toBe(true);
  });
  it('rejects a short password', () => {
    expect(hasIssue(signUpSchema.safeParse({ email: 'a@b.com', password: '123', confirm: '123' }), 'auth.errors.passwordTooShort')).toBe(true);
  });
  it('rejects mismatched confirmation', () => {
    expect(hasIssue(signUpSchema.safeParse({ email: 'a@b.com', password: '12345678', confirm: '87654321' }), 'auth.errors.confirmMismatch')).toBe(true);
  });
});

describe('resetPasswordSchema', () => {
  it('rejects mismatched confirmation', () => {
    expect(hasIssue(resetPasswordSchema.safeParse({ password: '12345678', confirm: 'x' }), 'auth.errors.confirmMismatch')).toBe(true);
  });
});

describe('forgotSchema', () => {
  it('requires an email', () => {
    expect(hasIssue(forgotSchema.safeParse({ email: '' }), 'auth.errors.emailRequired')).toBe(true);
  });
});
