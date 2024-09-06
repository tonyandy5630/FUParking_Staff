import * as React from "react";
import moment from "moment";
import { cn } from "@utils/utils";
import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import MySelect from "@components/MySelect";
import {
  FILTER_DATE_VALUE,
  SelectDateWithCustomFilter,
} from "@constants/selects.const";
import { getDayFromString, getLocalISOString } from "@utils/date";

type Props = {
  onValueChange: (value: string) => void;
};

export function DatePicker({ onValueChange }: Props) {
  const [date, setDate] = React.useState<Date>();
  const [dateFilter, setDateFilter] = React.useState(
    FILTER_DATE_VALUE.TODAY.number
  );

  const handleValueChange = (value: any) => {
    const newDate = moment().add(parseInt(value), "days").toDate();
    setDate(newDate);
    setDateFilter(value);
    onValueChange(getLocalISOString(newDate));
  };

  const handleSetDate = (value: Date | undefined) => {
    setDate(value);
    onValueChange(getLocalISOString(value));
  };

  return (
    <Popover>
      <PopoverTrigger className='p-2 py-1 border' asChild>
        <Button
          variant={"ghost"}
          className={cn(" justify-start text-left font-normal rounded-sm")}
        >
          {date ? getDayFromString(date.toString()) : <span>Hôm nay</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='flex flex-col w-auto p-2 space-y-2'>
        <MySelect
          popover={true}
          onValueChange={handleValueChange}
          placeholder='Chọn ngày'
          value={dateFilter}
          options={SelectDateWithCustomFilter}
        />
        <div className='border rounded-md'>
          <Calendar mode='single' selected={date} onSelect={handleSetDate} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
