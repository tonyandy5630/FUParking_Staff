import baseAPI_URL from ".";

export const RE_ACTIVATE_CARD_API_URL = (cardId: string) =>
  `${baseAPI_URL}/cards/status/${cardId}/true`;
