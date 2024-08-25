const localDateOption: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

const hourMinuteOption: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
};

const dayOption: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

export function getLocalISOString(date: Date): string {
  var tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
  var localISOTime = new Date(Date.now() - tzoffset).toISOString();

  return localISOTime;
}

export default function toLocaleDate(date: Date): string {
  const formatDate = new Date(date);
  const finalDate = formatDate.toLocaleDateString("vi-VN", localDateOption);
  return finalDate;
}

export function getHourMinuteFromString(date?: string): string {
  if (!date || date === "") return "";
  const formatDate = new Date(date);
  const finalDate = formatDate.toLocaleTimeString("vi-VN", hourMinuteOption);
  return finalDate;
}

export function getDayFromString(date?: string): string {
  if (!date || date === "") return "";
  const formatDate = new Date(date);
  const finalDate = formatDate.toLocaleDateString("vi-VN", dayOption);
  return finalDate;
}
