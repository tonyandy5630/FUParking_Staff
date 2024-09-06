import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import FormInput from "@components/Form/Input";
import { GUEST } from "@constants/customer.const";
import { getDayFromString, getHourMinuteFromString } from "@utils/date";
import { CheckInSchemaType } from "@utils/schema/checkinSchema";
import { getVehicleTypesAPI } from "@apis/vehicle.api";
import { useQuery } from "@tanstack/react-query";

import FormContainer, {
  FormNameRow,
  FormInfoRow,
} from "@components/CameraSection/Form";
import InfoSection, {
  InfoVehicle,
} from "@components/CameraSection/Form/InfoSection";
import FormSelect, { SelectOptions } from "@components/Form/FormSelect";
import { CheckInInfo } from "@components/CheckInSection";
import { useHotkeys } from "react-hotkeys-hook";
import PAGE from "../../../../url";
import {
  CANCELED_HOTKEY,
  FIX_PLATE_NUMBER_KEY,
  FOCUS_CARD_INPUT_KEY,
  SUBMIT_LEFT_HOTKEY,
} from "../../../hotkeys/key";
import { GATE_IN } from "@constants/gate.const";
import { ELECTRIC_PLATE_NUMBER_REGEX } from "@constants/regex";
import Image from "@components/Image";
import { formatPlateNumber } from "@utils/plate-number";

type Props = {
  methods: UseFormReturn<CheckInSchemaType>;
  onGetCheckInInfo: any;
  onVehicleTypeChange: any;
  checkInInfo: CheckInInfo;
  isLoading?: boolean;
  onCheckIn: () => Promise<void>;
  onFixPlate: () => void;
  onReset: () => void;
};

export default function CheckInVehicleForm({
  onGetCheckInInfo,
  onVehicleTypeChange,
  checkInInfo,
  methods,
  isLoading,
  onFixPlate,
  onReset,
  onCheckIn,
}: Props) {
  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
    setFocus,
  } = methods;
  const [showInputPlate, setShowInputPlate] = useState(false);
  const isElectric = useRef(false);

  useHotkeys(
    SUBMIT_LEFT_HOTKEY,
    async () => {
      await onCheckIn();
    },
    {
      scopes: [PAGE.CHECK_IN],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );
  useHotkeys(
    FOCUS_CARD_INPUT_KEY,
    () => {
      setShowInputPlate(false);
      setFocus("CardId");
      reset();
    },
    {
      scopes: [PAGE.CHECK_IN],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );
  useHotkeys(
    FIX_PLATE_NUMBER_KEY,
    async () => {
      //* already show plate then set the new plate to form
      if (showInputPlate) {
        onFixPlate();
      }
      setShowInputPlate((prev) => !prev);
    },
    {
      scopes: [PAGE.CHECK_IN],
      enableOnFormTags: ["input", "textarea"],
    }
  );
  useHotkeys(
    CANCELED_HOTKEY,
    () => {
      onReset();
      setShowInputPlate(false);
    },
    {
      scopes: [PAGE.CHECK_IN],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  useEffect(() => {
    if (!showInputPlate) return;
    setFocus("PlateNumber");
    setValue("PlateNumber", checkInInfo.plateText.toUpperCase());
  }, [showInputPlate]);

  const {
    data: vehicleTypesData,
    isLoading: isLoadingVehicleTypes,
    isSuccess: isSuccessVehicleTypes,
    isError: isErrorVehicleTypes,
  } = useQuery({
    queryKey: ["get-vehicle-types"],
    queryFn: getVehicleTypesAPI,
    retry: 2,
    enabled: checkInInfo.customerType === GUEST,
  });

  const vehicleTypesSelects: SelectOptions[] = useMemo(() => {
    const types = vehicleTypesData?.data.data;
    if (isSuccessVehicleTypes && types) {
      return types.map((item) => ({
        name: item.description,
        value: item.id,
      }));
    }
    return [];
  }, [isSuccessVehicleTypes, vehicleTypesData?.data.data]);

  useEffect(() => {
    const plate = checkInInfo.plateText;
    if (ELECTRIC_PLATE_NUMBER_REGEX.test(plate)) {
      isElectric.current = true;
      return;
    }
    isElectric.current = false;
  }, [checkInInfo.plateText]);
  return (
    <>
      <FormProvider {...methods}>
        <FormContainer onSubmit={handleSubmit(onGetCheckInInfo)}>
          <div className='absolute bottom-0 right-0 opacity-1'>
            <FormInput name='CardId' autoFocus={true} />
          </div>
          <FormInfoRow className='grid-cols-[auto_1fr_1fr]'>
            <InfoSection className='items-center justify-center !grid-rows-1'>
              <div
                className={`${
                  checkInInfo.croppedPlateImage !== "" ||
                  checkInInfo.croppedPlateImage !== undefined
                    ? "min-w-40 max-h-40"
                    : "w-full"
                }  h-full`}
              >
                <Image
                  src={checkInInfo.croppedPlateImage ?? ""}
                  isLoading={false}
                />
              </div>
            </InfoSection>
            <InfoSection>
              <InfoVehicle label='Ngày vào'>
                {getDayFromString(checkInInfo.time?.toString())}
              </InfoVehicle>
              <InfoVehicle label='Giờ vào'>
                {getHourMinuteFromString(checkInInfo.time?.toString())}
              </InfoVehicle>
              <InfoVehicle label='Biển số xe'>
                {showInputPlate ? (
                  <FormInput name='PlateNumber' />
                ) : (
                  <span className='text-red-500'>
                    {formatPlateNumber(checkInInfo.plateText)}
                  </span>
                )}
              </InfoVehicle>
            </InfoSection>
            <InfoSection numberOfRow={2}>
              <InfoVehicle label='Loại xe' className='grid-cols-[100px_1fr]'>
                {checkInInfo.customerType === GUEST && (
                  <FormSelect
                    name='vehicleType'
                    onValueChange={onVehicleTypeChange}
                    options={vehicleTypesSelects}
                  />
                )}
              </InfoVehicle>
              <InfoVehicle label='Khách hàng' col={true}>
                <span className='text-red-500'>{checkInInfo.customerType}</span>
              </InfoVehicle>
            </InfoSection>
          </FormInfoRow>
          <FormNameRow
            isLoading={isLoading}
            gateType={GATE_IN}
            message={checkInInfo.message}
            label='Làn vào'
            error={checkInInfo.isError}
          />
          <button type='submit' hidden>
            submit
          </button>
        </FormContainer>
      </FormProvider>
    </>
  );
}
