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
import { RootState, useAppSelector } from "@utils/store";
import { FOCUS_CARD_INPUT_KEY } from "../../../hotkeys/key";
import Image from "@components/Image";
import {
  resetCurrentCardInfo,
  setNewCardInfo,
} from "../../../redux/checkoutSlice";
import { GATE_OUT } from "@constants/gate.const";
import { formatPlateNumber, unFormatPlateNumber } from "@utils/plate-number";
import { Input } from "@components/ui/input";
import { updateSessionPlateNumberAPI } from "@apis/session.api";
import { useMutation } from "@tanstack/react-query";

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
  refetchCardInfo: any;
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
  refetchCardInfo,
}: Props) {
  const checkOutInfo = useAppSelector((state) => state.checkOutCard);
  const pressPlateCount = useRef<number>(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch();
  const [showInputPlateOut, setShowInputPlateOut] = useState<boolean>(false);
  const [showInputPlateIn, setShowInputPlateIn] = useState<boolean>(false);
  const [plateNumberIn, setPlateNumberIn] = useState("");
  const plateInputRef = useRef<HTMLInputElement>(null);
  const enableActionKey = useRef(true);
  const {
    mutateAsync: updatePlateAsync,
    isPending: isPendingUpdatePlate,
    isError: isErrorUpdatePlate,
  } = useMutation({
    mutationKey: ["update-plate-numeber-checkout"],
    mutationFn: updateSessionPlateNumberAPI,
  });

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
      enableOnFormTags: ["input", "select"],
      enabled: enableActionKey.current,
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
      enabled: enableActionKey.current,
    }
  );

  useHotkeys(
    CANCELED_HOTKEY,
    () => {
      pressPlateCount.current = 0;
      onReset();
      setShowInputPlateOut(false);
      setShowInputPlateIn(false);
      dispatch(resetCurrentCardInfo());
      enableActionKey.current = true;
    },
    {
      scopes: [PAGE.CHECK_OUT, position],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  const handleChangePlateInputIn = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlateNumberIn(e.target.value);
  };

  useHotkeys(
    FIX_PLATE_NUMBER_KEY,
    async () => {
      pressPlateCount.current++;
      enableActionKey.current = false;
      const cardText = checkOutInfo.checkOutCardText;
      console.log(cardText);
      if (cardText !== "") {
        //* first press set value
        if (pressPlateCount.current === 1) {
          setPlateNumberIn(checkOutInfo.plateTextIn);
        }
        //* second press confirm and submit
        if (pressPlateCount.current === 2) {
          pressPlateCount.current = 0;
          enableActionKey.current = true;
          await handleUpdatePlateNumberIn();
          return;
        }
        setShowInputPlateIn((prev) => !prev);
        return;
      }

      //* final press send checkout
      if (pressPlateCount.current === 3) {
        pressPlateCount.current = 0;
        enableActionKey.current = true;
        await onMissingCardCheckOut();
      }
      //* second press get info
      if (pressPlateCount.current === 2) {
        onTriggerGetInfoByPlate();
        return;
      }

      setShowInputPlateOut((prev) => !prev);
    },
    {
      scopes: [PAGE.CHECK_OUT],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  const handleUpdatePlateNumberIn = async () => {
    try {
      const updatePlateBody = new FormData();
      updatePlateBody.append("PlateNumber", unFormatPlateNumber(plateNumberIn));
      updatePlateBody.append("SessionId", checkOutInfo.id);

      await updatePlateAsync(updatePlateBody as any, {
        onSuccess: () => {
          dispatch(
            setNewCardInfo({
              ...checkOutInfo,
              message: "Thay đổi biển số thành công",
              isError: false,
            })
          );
          refetchCardInfo();
          setShowInputPlateIn((prev) => !prev);
        },
      });
    } catch (err: unknown) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!showInputPlateOut) return;

    setFocus("PlateNumber");
  }, [showInputPlateOut]);

  useEffect(() => {
    if (!showInputPlateIn) return;
    if (plateInputRef.current) plateInputRef.current.focus();
  }, [showInputPlateIn]);

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
                    ? "max-w-40 max-h-40"
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
                {showInputPlateIn ? (
                  <Input
                    ref={plateInputRef}
                    className='w-full border'
                    value={plateNumberIn}
                    onChange={handleChangePlateInputIn}
                  />
                ) : (
                  formatPlateNumber(checkOutInfo.plateTextIn)
                )}
              </InfoVehicle>
              <InfoVehicle
                className='row-span-2'
                label='Biển số xe ra'
                col={true}
              >
                {showInputPlateOut ? (
                  <FormInput name='PlateNumber' />
                ) : (
                  formatPlateNumber(checkOutInfo.plateTextOut)
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
