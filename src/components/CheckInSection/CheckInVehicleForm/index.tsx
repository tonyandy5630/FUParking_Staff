import React, { useEffect, useMemo, useState } from "react";
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
  FIX_PLATE_NUMBER_KEY,
  FOCUS_CARD_INPUT_KEY,
} from "../../../hotkeys/key";

type Props = {
  methods: UseFormReturn<CheckInSchemaType>;
  onCheckIn: any;
  onVehicleTypeChange: any;
  checkInInfo: CheckInInfo;
  isLoading?: boolean;
  onFixPlate: () => Promise<void>;
};

export default function CheckInVehicleForm({
  onCheckIn,
  onVehicleTypeChange,
  checkInInfo,
  methods,
  isLoading,
  onFixPlate,
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
  useHotkeys(
    FOCUS_CARD_INPUT_KEY,
    () => {
      setFocus("CardId");
    },
    {
      scopes: [PAGE.CHECK_IN],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );
  useHotkeys(
    FIX_PLATE_NUMBER_KEY,
    async () => {
      if (showInputPlate) {
        await onFixPlate();
      }
      setShowInputPlate((prev) => !prev);
    },
    {
      scopes: [PAGE.CHECK_IN],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  useEffect(() => {
    if (!showInputPlate) return;

    setFocus("PlateNumber");
    setValue("PlateNumber", checkInInfo.plateText);
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
        name: item.name,
        value: item.id,
      }));
    }
    return [];
  }, [isSuccessVehicleTypes, vehicleTypesData?.data.data]);

  return (
    <>
      <FormProvider {...methods}>
        <FormContainer onSubmit={handleSubmit(onCheckIn)}>
          <div className='absolute bottom-0 right-0 opacity-0'>
            <FormInput name='CardId' />
          </div>
          <FormInfoRow className='grid-cols-2'>
            <InfoSection>
              <InfoVehicle label='Ngày vào'>
                {getDayFromString(checkInInfo.time.toString())}
              </InfoVehicle>
              <InfoVehicle label='Giờ vào'>
                {getHourMinuteFromString(checkInInfo.time.toString())}
              </InfoVehicle>
              <InfoVehicle label='Biển số xe'>
                {showInputPlate ? (
                  <FormInput name='PlateNumber' />
                ) : (
                  <span className='text-red-500'>{checkInInfo.plateText}</span>
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
            {/* <InfoSection className='items-center justify-center grid-rows-1'>
              <div className=' w-[100px] h-full'>
                <Image src='' isLoading={false} />
              </div>
            </InfoSection> */}
          </FormInfoRow>
          <FormNameRow
            isLoading={isLoading}
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
