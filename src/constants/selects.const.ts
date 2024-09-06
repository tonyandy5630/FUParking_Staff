import { SelectOptions } from "@components/Form/FormSelect";
import {
  ALL_STATUS,
  CLOSED_SESSION_STATUS,
  PARKED_SESSION_STATUS,
} from "./session.const";
import {
  ALL_STATUS_MESSAGE,
  CLOSED_SESSION,
  PARKING_SESSION,
} from "./message.const";

export const FILTER_DATE_VALUE = {
  TODAY: {
    string: "today",
    number: "0",
  },
  WEEK: {
    string: "week",
    number: "7",
  },
  MONTH: "month",
  CUSTOM: "CUSTOM",
};

export const SelectDateFilter: SelectOptions[] = [
  {
    name: "Trong ngày",
    value: FILTER_DATE_VALUE.TODAY.string,
  },
  {
    name: "Trong tuần",
    value: FILTER_DATE_VALUE.WEEK.string,
  },
  {
    name: "Trong tháng",
    value: FILTER_DATE_VALUE.MONTH,
  },
];

export const SelectDateWithCustomFilter: SelectOptions[] = [
  {
    name: "Trong ngày",
    value: FILTER_DATE_VALUE.TODAY.number.toString(),
  },
  {
    name: "Hôm qua",
    value: "-1",
  },
];

export const SelectSessionStatusFilter: SelectOptions[] = [
  {
    name: ALL_STATUS_MESSAGE,
    value: ALL_STATUS,
  },
  {
    name: PARKING_SESSION,
    value: PARKED_SESSION_STATUS,
  },
  {
    name: CLOSED_SESSION,
    value: CLOSED_SESSION_STATUS,
  },
];
