import { CARD_NOT_INFO } from "@constants/message.const";

export default function wrapText(limit: number, text?: string): string {
  if (!text) return CARD_NOT_INFO;
  if (text.length > limit) return text.substring(0, limit - 3) + "...";

  return text;
}
