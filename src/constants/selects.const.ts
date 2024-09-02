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
  TODAY: "today",
  WEEK: "week",
  MONTH: "month",
};

export const SelectDateFilter: SelectOptions[] = [
  {
    name: "Trong ngày",
    value: FILTER_DATE_VALUE.TODAY,
  },
  {
    name: "Trong tuần",
    value: FILTER_DATE_VALUE.WEEK,
  },
  {
    name: "Trong tháng",
    value: FILTER_DATE_VALUE.MONTH,
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
