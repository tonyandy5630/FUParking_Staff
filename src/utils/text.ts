export default function wrapText(text: string, limit: number): string {
  if (text.length > limit) return text.substring(0, limit - 3) + "...";

  return text;
}
