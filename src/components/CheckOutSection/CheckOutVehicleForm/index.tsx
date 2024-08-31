import { SyntheticEvent, useEffect, useRef, useState } from "react";
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
import { CheckOutSchemaType } from "@utils/schema/checkoutSchema";
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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@utils/store";
import { FOCUS_CARD_INPUT_KEY } from "../../../hotkeys/key";
import Image from "@components/Image";
import { resetCurrentCardInfo } from "../../../redux/checkoutSlice";
import { GATE_OUT } from "@constants/gate.const";

type Props = {
  methods: UseFormReturn<CheckOutSchemaType>;
  onCheckOut: any;
  checkOutInfo: CheckOutInfo;
  isLoading?: boolean;
  isError?: boolean;
  position: LanePosition;
  onMissingCardCheckOut: () => Promise<void>;
  onTriggerGetInfoByPlate: () => void;
  onReset: () => void;
};

export default function CheckOutVehicleForm({
  onCheckOut,
  methods,
  isLoading,
  isError,
  position,
  onMissingCardCheckOut,
  onTriggerGetInfoByPlate,
  onReset,
}: Props) {
  const checkOutInfo = useSelector((state: RootState) => state.checkOutCard);
  const pressPlateCount = useRef<number>(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch();
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
      onReset();
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
    getValues,
  } = methods;

  useHotkeys(
    FOCUS_CARD_INPUT_KEY,
    () => {
      setFocus("CardNumber");
      // reset();
    },
    {
      scopes: [PAGE.CHECK_OUT, position],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  useHotkeys(
    CANCELED_HOTKEY,
    () => {
      reset({ CardNumber: "" });
      dispatch(resetCurrentCardInfo());
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
      //* final press send checkout
      if (pressPlateCount.current === 3) {
        pressPlateCount.current = 0;
        await onMissingCardCheckOut();
      }
      //* second press get info
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
          <FormInfoRow className='grid-cols-[auto_1.5fr_1fr]'>
            <InfoSection className='items-center justify-center !grid-rows-1'>
              <div
                className={`${
                  checkOutInfo.croppedImagePlate !== "" ||
                  checkOutInfo.croppedImagePlate !== undefined
                    ? "max-w-32 max-h-32"
                    : "w-full"
                }  h-full`}
              >
                <Image
                  src={checkOutInfo.croppedImagePlate ?? ""}
                  isLoading={false}
                />
              </div>
            </InfoSection>
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
          </FormInfoRow>
          <FormNameRow
            isLoading={isLoading}
            gateType={GATE_OUT}
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
