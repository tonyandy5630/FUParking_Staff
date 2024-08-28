import { SelectOptions } from "@components/Form/FormSelect";

export const FITLER_DATE_VALUE = {
  TODAY: "today",
  WEEK: "week",
  MONTH: "month",
};

export const SelectDateFilter: SelectOptions[] = [
  {
    name: "Trong ngày",
    value: FITLER_DATE_VALUE.TODAY,
  },
  {
    name: "Trong tuần",
    value: FITLER_DATE_VALUE.WEEK,
  },
  {
    name: "Trong tháng",
    value: FITLER_DATE_VALUE.MONTH,
  },
];
