export function formatVNCurrency(amount?: number): string {
  if (!amount) return "0";
  return amount.toLocaleString("vi-VN");
}
