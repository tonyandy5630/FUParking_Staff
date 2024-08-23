import ConnectForm from "@components/Form/ConnectForm";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import React, { SelectHTMLAttributes, useMemo, useState } from "react";
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
  (
    { options, onValueChange, name, defaultValue = "", onClick, ...props },
    ref
  ) => {
    const [openSelect, setOpenSelect] = useState(true);
    const selectOptions = useMemo(() => {
      return options.map((item) => (
        <SelectItem key={item.value} value={item.value}>
          {item.name}
        </SelectItem>
      ));
    }, [options.length]);

    const handleOpenSelect = () => {
      setOpenSelect((prev) => !prev);
    };

    return (
      <ConnectForm>
        {({ control }: UseFormReturn) => {
          return (
            <Controller
              name={name}
              control={control}
              render={(fields) => (
                <Select
                  open={openSelect}
                  onOpenChange={handleOpenSelect}
                  onValueChange={onValueChange}
                  defaultValue={(defaultValue as string) || ""}
                  {...fields}
                >
                  <SelectTrigger
                    className='min-w-full'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSelect();
                    }}
                  >
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
