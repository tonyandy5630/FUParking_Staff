import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(tz);
dayjs.extend(utc);

const localDateOption: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "numeric",
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

const hourMinuteOption: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "numeric",
  second: "numeric",
};

const dayOption: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

export function getLocalISOString(date: Date): string {
  // Create a formatter for the specified time zone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: dayjs.tz.guess(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Get the date parts in the specified time zone
  const parts = formatter.formatToParts(date);
  const dateParts: { [key: string]: string } = {};
  parts.forEach((part) => {
    if (part.type !== "literal") {
      dateParts[part.type] = part.value;
    }
  });

  // Format the ISO string manually
  const isoString = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${
    dateParts.hour
  }:${dateParts.minute}:${dateParts.second}.${
    dateParts.fractionalSecond || "000"
  }Z`;

  return isoString;
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

export function getStartAndEndDatesOfWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

  // Calculate the start date (Monday) of the current week
  const startDate = new Date(today);
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If today is Sunday, go back 6 days, otherwise (dayOfWeek - 1)
  startDate.setDate(today.getDate() - daysToMonday);
  startDate.setHours(0, 0, 0, 0); // Set to the start of the day

  // Calculate the end date (Sunday) of the current week
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999); // Set to the end of the day

  return {
    startDate: getLocalISOString(startDate),
    endDate: getLocalISOString(endDate),
  };
}

export function getStartAndEndDatesOfMonth() {
  const today = new Date();

  // Calculate the start date of the current month
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  startDate.setHours(0, 0, 0, 0); // Set to the start of the day

  // Calculate the end date of the current month
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999); // Set to the end of the day

  return {
    startDate: getLocalISOString(startDate),
    endDate: getLocalISOString(endDate),
  };
}
