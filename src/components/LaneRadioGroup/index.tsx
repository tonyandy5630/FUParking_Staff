import { SelectOptions } from "@components/Form/FormSelect";
import { Label } from "@components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { GATE_IN, GATE_OUT } from "@constants/gate.const";
import { useMemo } from "react";

interface Props {
  value: { left: string; right: string };
  onValueChange: {
    left: (value: string) => void;
    right: (value: string) => void;
  };
  label: { left: string; right: string };
  is2Lane: boolean;
}

const LaneRadioItems: SelectOptions[] = [
  {
    value: GATE_IN,
    name: "Làn vào",
  },
  {
    value: GATE_OUT,
    name: "Làn ra",
  },
];
export default function LaneRadioGroup({
  value,
  onValueChange,
  label,
  is2Lane,
}: Props) {
  const radioItems = useMemo(() => {
    return LaneRadioItems.map((item) => (
      <div className='flex items-center space-x-2' key={item.value}>
        <RadioGroupItem value={item.value} id={item.name} />
        <Label htmlFor={item.name}>{item.name}</Label>
      </div>
    ));
  }, [LaneRadioItems]);

  return (
    <div className='flex gap-4'>
      <div className='flex flex-col items-start justify-center gap-2'>
        <Label>{label.left}</Label>
        <RadioGroup
          defaultValue={GATE_IN}
          value={value.left}
          onValueChange={onValueChange.left}
        >
          {radioItems}
        </RadioGroup>
      </div>
      {is2Lane && (
        <div className='flex flex-col items-start justify-center gap-2'>
          <Label>{label.right}</Label>
          <RadioGroup
            value={value.right}
            defaultValue={GATE_IN}
            onValueChange={onValueChange.right}
          >
            {radioItems}
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
