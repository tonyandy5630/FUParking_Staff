import { SelectOptions } from "@components/Form/FormSelect";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import React, { HTMLAttributes, useMemo } from "react";

interface Props extends HTMLAttributes<HTMLSelectElement> {
  options: SelectOptions[];
  value?: string;
  onValueChange: any;
  label?: string;
  placeholder: string;
  col?: boolean;
}
export default function MySelect({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  col,
  ...props
}: Props) {
  const selectOptions = useMemo(() => {
    return options.map((item) => (
      <SelectItem key={item.value} value={item.value}>
        {item.name}
      </SelectItem>
    ));
  }, [options.length]);

  return (
    <div
      className={`flex ${
        col
          ? " flex-col gap-2 items-start justify-center"
          : "items-center justify-between"
      }    w-full`}
    >
      {label && <Label className='min-w-16'>{label}</Label>}
      <Select defaultValue={value} onValueChange={onValueChange}>
        <SelectTrigger className='border-gray-600 rounded-sm'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>{selectOptions}</SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
