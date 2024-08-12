const options: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
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
  const finalDate = formatDate.toLocaleDateString("vi-VN", options);
  return finalDate;
}
