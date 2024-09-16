import http from "@utils/http";
import { RE_ACTIVATE_CARD_API_URL } from "./url/card";

export const reactivateCardAPI = (cardId: string) =>
  http.put(RE_ACTIVATE_CARD_API_URL(cardId));
