import dayjs from "dayjs";

export const getCurrentDateISO = (): string => {
  return dayjs().format("YYYY-MM-DD");
};

export const formatDateForDisplay = (dateISO: string): string => {
  return dayjs(dateISO).format("MMM D, YYYY");
};

export const isConsecutiveDay = (date1: string, date2: string): boolean => {
  const day1 = dayjs(date1);
  const day2 = dayjs(date2);

  return Math.abs(day1.diff(day2, "day")) === 1;
};

export const validateDateISO = (dateISO: string): boolean => {
  return dayjs(dateISO, "YYYY-MM-DD", true).isValid();
};
