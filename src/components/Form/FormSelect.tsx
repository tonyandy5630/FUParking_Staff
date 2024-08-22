import ConnectForm from "@components/Form/ConnectForm";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import React, { SelectHTMLAttributes, useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

export type SelectOptions = {
  name: string;
  value: string;
};

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOptions[];
  placeholder?: string;
  onValueChange: (value: string) => void;
  name: string;
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ options, onValueChange, name, defaultValue = "", ...props }, ref) => {
    const selectOptions = useMemo(() => {
      return options.map((item) => (
        <SelectItem value={item.value}>{item.name}</SelectItem>
      ));
    }, [options.length]);

    return (
      <ConnectForm>
        {({ control }: UseFormReturn) => {
          return (
            <Controller
              name={name}
              control={control}
              render={(fields) => (
                <Select
                  onValueChange={onValueChange}
                  defaultValue={(defaultValue as string) || ""}
                  {...fields}
                >
                  <SelectTrigger className='min-w-full'>
                    <SelectValue placeholder='Chọn loại xe' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>{selectOptions}</SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          );
        }}
      </ConnectForm>
    );
  }
);

FormSelect.displayName = "FormSelect";
export default FormSelect;
