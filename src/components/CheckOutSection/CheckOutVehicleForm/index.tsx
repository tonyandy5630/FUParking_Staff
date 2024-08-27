import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import FormInput from "@components/Form/Input";
import { getDayFromString, getHourMinuteFromString } from "@utils/date";
import FormContainer, {
  FormNameRow,
  FormInfoRow,
} from "@components/CameraSection/Form";
import InfoSection, {
  InfoVehicle,
} from "@components/CameraSection/Form/InfoSection";
import { SelectOptions } from "@components/Form/FormSelect";
import { CheckOutSchemaType } from "@utils/schema/checkoutSchema";
import { Button } from "@components/ui/button";
import { getCardCheckOutAPI } from "@apis/check-out.api";
import LanePosition from "@my_types/lane";
import LANE from "@constants/lane.const";
import {
  CANCELED_HOTKEY,
  FIX_PLATE_NUMBER_KEY,
  SUBMIT_LEFT_HOTKEY,
  SUBMIT_RIGHT_HOTKEY,
} from "../../../hotkeys/key";
import PAGE from "../../../../url";
import { useHotkeys } from "react-hotkeys-hook";
import { CheckOutInfo } from "@my_types/check-out";
import { useSelector } from "react-redux";
import { RootState } from "@utils/store";
import { FOCUS_CARD_INPUT_KEY } from "../../../hotkeys/key";
import Image from "@components/Image";

type Props = {
  methods: UseFormReturn<CheckOutSchemaType>;
  onCheckOut: any;
  checkOutInfo: CheckOutInfo;
  isLoading?: boolean;
  onCashCheckOut: () => void;
  isError?: boolean;
  position: LanePosition;
  onMissingCardCheckOut: () => Promise<void>;
  onTriggerGetInfoByPlate: () => void;
};

export default function CheckOutVehicleForm({
  onCheckOut,
  // checkOutInfo,
  methods,
  isLoading,
  onCashCheckOut,
  isError,
  position,
  onMissingCardCheckOut,
  onTriggerGetInfoByPlate,
}: Props) {
  const checkOutInfo = useSelector((state: RootState) => state.checkOutCard);
  const pressPlateCount = useRef<number>(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showInputPlate, setShowInputPlate] = useState<boolean>(false);
  //* submit form
  const handleSubmitCheckOut = () => {
    if (buttonRef.current) {
      pressPlateCount.current = 0;
      buttonRef.current.click();
    }
  };
  useHotkeys(
    position === LANE.LEFT ? SUBMIT_LEFT_HOTKEY : SUBMIT_RIGHT_HOTKEY,
    handleSubmitCheckOut,
    {
      scopes: [PAGE.CHECK_OUT, position],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  useHotkeys(
    CANCELED_HOTKEY,
    () => {
      pressPlateCount.current = 0;
      setShowInputPlate(false);
    },
    {
      scopes: [PAGE.CHECK_OUT],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
    setFocus,
  } = methods;

  useHotkeys(
    FOCUS_CARD_INPUT_KEY,
    () => {
      setFocus("CardNumber");
      reset();
    },
    {
      scopes: [PAGE.CHECK_OUT, position],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  useHotkeys(
    FIX_PLATE_NUMBER_KEY,
    async () => {
      pressPlateCount.current++;
      if (pressPlateCount.current === 3) {
        pressPlateCount.current = 0;
        setShowInputPlate((prev) => !prev);
        await onMissingCardCheckOut();
        return;
      }

      if (pressPlateCount.current === 2) {
        onTriggerGetInfoByPlate();
        return;
      }
      setShowInputPlate((prev) => !prev);
    },
    {
      scopes: [PAGE.CHECK_OUT],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  useEffect(() => {
    if (!showInputPlate) return;

    setFocus("PlateNumber");
  }, [showInputPlate]);

  const handlePreventSubmit = (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e.preventDefault();
    handleSubmit(onCheckOut);
  };
  return (
    <>
      <FormProvider {...methods}>
        <FormContainer onSubmit={handlePreventSubmit}>
          <div className='absolute bottom-0 right-0 opacity-0'>
            <FormInput name='CardNumber' autoFocus={true} />
          </div>
          <FormInfoRow className='grid-cols-2'>
            <InfoSection className='grid-cols-2 grid-rows-[repeat(4,30px)]'>
              <InfoVehicle label='Ngày vào'>
                {getDayFromString(checkOutInfo.timeIn)}
              </InfoVehicle>
              <InfoVehicle label='Ngày ra'>
                {getDayFromString(checkOutInfo.timeOut)}
              </InfoVehicle>
              <InfoVehicle label='Giờ vào'>
                {getHourMinuteFromString(checkOutInfo.timeIn)}
              </InfoVehicle>

              <InfoVehicle label='Giờ ra'>
                {getHourMinuteFromString(checkOutInfo.timeOut)}
              </InfoVehicle>

              <InfoVehicle
                className='row-span-2'
                label='Biển số xe vào'
                col={true}
              >
                {checkOutInfo.plateTextIn}
              </InfoVehicle>
              <InfoVehicle
                className='row-span-2'
                label='Biển số xe ra'
                col={true}
              >
                {showInputPlate ? (
                  <FormInput name='PlateNumber' />
                ) : (
                  checkOutInfo.plateTextOut
                )}
              </InfoVehicle>
            </InfoSection>
            <InfoSection numberOfRow={2}>
              <InfoVehicle label='Giá vé' col={true}>
                <span className='text-red-500'>{checkOutInfo.cashToPay} </span>
                VND
              </InfoVehicle>
              <InfoVehicle label='Loại vé' col={true}>
                <span className='text-red-500 uppercase'>
                  {checkOutInfo.customerType}
                </span>
              </InfoVehicle>
            </InfoSection>
            {/* <InfoSection className='items-center justify-center grid-rows-1'>
              <div className=' w-[100px] h-full'>
                <Image src='' isLoading={false} />
              </div>
            </InfoSection> */}
          </FormInfoRow>
          <FormNameRow
            isLoading={isLoading}
            label='Làn ra'
            error={isError}
            message={checkOutInfo.message}
          >
            {checkOutInfo.bodyImgOut !== "" &&
              checkOutInfo.plateImgOut !== "" && (
                <button
                  // variant='default'
                  type='button'
                  ref={buttonRef}
                  onClick={handleSubmit(onCheckOut)}
                  hidden
                >
                  Cho xe ra
                </button>
              )}
          </FormNameRow>
        </FormContainer>
      </FormProvider>
    </>
  );
}
