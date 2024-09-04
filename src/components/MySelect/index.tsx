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
import React, { HTMLAttributes, useMemo, useState } from "react";

interface Props extends HTMLAttributes<HTMLSelectElement> {
  options: SelectOptions[];
  value?: string;
  onValueChange: any;
  label?: string;
  placeholder: string;
  col?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  selectClassName?: string;
  popover?: boolean;
}
export default function MySelect({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  col,
  disabled,
  defaultValue,
  selectClassName,
  popover,
  ...props
}: Props) {
  const selectOptions = useMemo(() => {
    return options.map((item) => (
      <SelectItem key={item.value} value={item.value}>
        {item.name}
      </SelectItem>
    ));
  }, [options]);

  return (
    <div
      className={`flex ${
        col
          ? " flex-col gap-2 items-start justify-center"
          : "gap-1 items-center justify-between"
      }    w-full`}
    >
      {label && <Label className='min-w-fit'>{label}</Label>}
      <Select
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={`${selectClassName} border-gray-200 rounded-sm h-9`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position={popover ? "popper" : undefined}>
          <SelectGroup>{selectOptions}</SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
