// Client-side form validation. Each function returns '' when valid, otherwise an error message.
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') ? '' : 'Enter a valid email address.';

export const validatePassword = (pw = '') => {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(pw)) return 'Add at least one uppercase letter.';
  if (!/[0-9]/.test(pw)) return 'Add at least one number.';
  return '';
};

export const validateRequired = (value, label = 'This field') =>
  value && String(value).trim() ? '' : `${label} is required.`;

export const validateUrl = (url) => {
  try { new URL(url); return ''; } catch { return 'Enter a valid URL (include https://).'; }
};

export const validateImage = (file) => {
  if (!file) return '';
  if (!file.type.startsWith('image/')) return 'Please choose an image file.';
  if (file.size > MAX_FILE_SIZE) return 'Image is larger than 2MB. Please choose a smaller file.';
  return '';
};
