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
  CANCEL_LEFT_HOTKEY,
  SUBMIT_LEFT_HOTKEY,
  SUBMIT_RIGHT_HOTKEY,
} from "../../../hotkeys/key";
import { GATE_IN } from "@constants/gate.const";
import Image from "@components/Image";
import { formatPlateNumber } from "@utils/plate-number";
import LanePosition from "@my_types/lane";
import LANE from "@constants/lane.const";
import useFixPlateHotKey from "../../../hooks/useFixPlateHotkey";
import useFocusCardHotKey from "../../../hooks/useFocusCardHotKey";
import useCancelHotKey from "../../../hooks/useCancelHotKey";

type Props = {
  methods: UseFormReturn<CheckInSchemaType>;
  onGetCheckInInfo: any;
  onVehicleTypeChange: any;
  checkInInfo: CheckInInfo;
  isLoading?: boolean;
  onCheckIn: () => Promise<void>;
  onFixPlate: () => void;
  onReset: () => void;
  position: LanePosition;
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
  position,
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
  const enableActionKey = useRef(true);
  const enableSubmit = useRef(true);

  useFixPlateHotKey({
    lane: position,
    callback: handleFixPlate,
    options: {
      scopes: [PAGE.CHECK_IN, position],
      enableOnFormTags: ["input", "textarea"],
    },
  });

  useCancelHotKey({
    lane: position,
    callback: handleCancel,
    options: {
      scopes: [PAGE.CHECK_IN, position],
      enableOnFormTags: ["input", "select", "textarea"],
    },
  });

  useFocusCardHotKey({
    lane: position,
    callback: handleFocusCard,
    options: {
      scopes: [PAGE.CHECK_IN, position],
      enableOnFormTags: ["input", "select", "textarea"],
      enabled: enableActionKey.current,
    },
  });

  useHotkeys(
    position === LANE.LEFT ? SUBMIT_LEFT_HOTKEY.key : SUBMIT_RIGHT_HOTKEY.key,
    async () => {
      await onCheckIn();
    },
    {
      scopes: [PAGE.CHECK_IN, position],
      enableOnFormTags: ["input", "select", "textarea"],
      enabled: enableSubmit.current, //* allow cursor to move and not selecting any input
    }
  );

  useEffect(() => {
    if (!showInputPlate) return;
    setFocus("PlateNumber");
    setValue("PlateNumber", checkInInfo.plateText.toUpperCase().trim());
  }, [showInputPlate]);

  function handleFocusCard() {
    setFocus("CardId");
    setShowInputPlate(false);
    reset();
  }

  function handleCancel() {
    onReset();
    setShowInputPlate(false);
    enableSubmit.current = true;
    enableActionKey.current = true;
  }

  function handleFixPlate() {
    if (showInputPlate) {
      enableActionKey.current = true;
      //* allow to move cursor without submitting the form
      enableSubmit.current = true;
      onFixPlate();
      setShowInputPlate((prev) => !prev);
      return;
    }
    enableActionKey.current = true;
    enableSubmit.current = false;
    setShowInputPlate((prev) => !prev);
  }

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

  return (
    <>
      <FormProvider {...methods}>
        <FormContainer onSubmit={handleSubmit(onGetCheckInInfo)}>
          <div
            className={`absolute bottom-0 opacity-0 ${
              position === LANE.LEFT ? "left-0" : "right-0"
            }`}
          >
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
