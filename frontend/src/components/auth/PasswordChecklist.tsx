interface PasswordChecklistProps {
  password: string;
}

const rules = [
  { label: 'Ít nhất 8 ký tự', test: (p: string) => p.length >= 8 },
  { label: 'Chứa chữ cái', test: (p: string) => /[A-Za-z]/.test(p) },
  { label: 'Chứa chữ số', test: (p: string) => /\d/.test(p) },
];

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  return (
    <ul className="space-y-1 text-body-sm font-body-sm">
      {rules.map((rule) => {
        const pass = password.length > 0 && rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 ${pass ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {pass ? 'check_circle' : 'cancel'}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
