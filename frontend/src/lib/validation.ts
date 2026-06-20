// Mirror of backend password policy (BR02): >= 8 chars, letters and digits.
export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Mật khẩu phải gồm chữ và số';
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email không hợp lệ';
  return null;
}

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Tên hiển thị tối thiểu 2 ký tự';
  if (trimmed.length > 50) return 'Tên hiển thị tối đa 50 ký tự';
  return null;
}
