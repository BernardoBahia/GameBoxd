import { PASSWORD_RULES } from "@/utils/password-rules";

interface PasswordChecklistProps {
  password: string;
}

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  if (!password) return null;

  return (
    <ul className="space-y-1 pt-1">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.key}
            className={`flex items-center gap-2 text-xs transition-colors ${
              passed ? "text-emerald-400" : "text-zinc-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3 w-3 shrink-0"
            >
              {passed ? (
                <path
                  fillRule="evenodd"
                  d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                  clipRule="evenodd"
                />
              ) : (
                <circle cx="8" cy="8" r="3" />
              )}
            </svg>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}