export interface PasswordStrength {
  score: number; // 0-4
  text: string;
  color: string;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  if (!password) {
    return { score: 0, text: '', color: '' };
  }

  // Award a point for each of these criteria
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 0:
    case 1:
      return { score, text: 'Weak', color: 'var(--strength-weak)' };
    case 2:
      return { score, text: 'Medium', color: 'var(--strength-medium)' };
    case 3:
    case 4:
      return { score, text: 'Strong', color: 'var(--strength-strong)' };
    default:
      return { score: 0, text: '', color: '' };
  }
};
