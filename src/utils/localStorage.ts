const TOKEN = "token";

export const getTokenFromLS = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN);
  }
  return "";
};

export const setTokenToLS = (value: string) => {
  if (typeof window !== "undefined") {
    return localStorage.setItem(TOKEN, value);
  }
  return "";
};

export const removeTokenFromLS = () => {
  if (typeof window !== "undefined") {
    return localStorage.removeItem(TOKEN);
  }
  return "";
};
