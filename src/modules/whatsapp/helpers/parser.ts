export function normalizeNumber(number: string) {
  const cleanedNumber = number.replace(/\D/g, '');

  if (number.startsWith('+')) {
    return cleanedNumber;
  }

  if (cleanedNumber.length === 9 && !cleanedNumber.startsWith('34')) {
    return `34${cleanedNumber}`;
  }

  return cleanedNumber;
}

export function formatChatId(number: string) {
  const normalizedNumber = normalizeNumber(number);
  return `${normalizedNumber}@c.us`;
}

export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
