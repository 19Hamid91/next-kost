export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '62' + cleaned.substring(1);
  return cleaned;
}
