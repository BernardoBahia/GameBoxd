export interface PasswordRule {
  key: string;
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { key: "length", label: "Mínimo de 8 caracteres", test: (pw) => pw.length >= 8 },
  { key: "upper", label: "Pelo menos uma letra maiúscula", test: (pw) => /[A-Z]/.test(pw) },
  { key: "lower", label: "Pelo menos uma letra minúscula", test: (pw) => /[a-z]/.test(pw) },
  { key: "digit", label: "Pelo menos um número", test: (pw) => /\d/.test(pw) },
  { key: "special", label: "Pelo menos um caractere especial (!@#$%...)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors = PASSWORD_RULES
    .filter((rule) => !rule.test(password))
    .map((rule) => rule.label);

  return { valid: errors.length === 0, errors };
}