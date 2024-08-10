const options: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

export default function toLocaleDate(date: Date): string {
  const formatDate = new Date(date);
  const finalDate = formatDate.toLocaleDateString("vi-VN", options);
  return finalDate;
}
