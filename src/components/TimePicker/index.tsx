import { ClockIcon } from "@radix-ui/react-icons";
import { Label } from "@components/ui/label";
import { TimePicker } from "@mui/x-date-pickers";

interface Props {
  onValueChange: (value: any) => void;
  value: any;
  label?: string;
}
export default function MyTimePicker({ onValueChange, value, label }: Props) {
  return (
    <div className='flex flex-col items-start gap-1'>
      {label && <Label>{label}</Label>}
      <TimePicker
        views={["hours", "minutes"]}
        value={value}
        timezone='Asia/Ho_Chi_Minh'
        onChange={onValueChange}
        ampm={false}
        slots={{
          openPickerIcon: () => <ClockIcon className='w-4 h-4' />,
        }}
        slotProps={{
          textField: {
            size: "small",
            sx: {
              ".MuiOutlinedInput-root ": {
                height: "2.3rem",
                width: "7.5rem",
                borderRadius: "4px",
              },
              "& .MuiOutlinedInput-root:hover": {
                border: "none !important",
              },
              ".MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgb(229 231 235 )",
              },
            },
          },
          actionBar: {
            actions: ["clear", "accept"],
          },
        }}
      />
    </div>
  );
}
