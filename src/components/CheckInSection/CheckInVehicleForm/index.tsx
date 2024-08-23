import React, { useMemo, useRef } from "react";
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

type Props = {
  methods: UseFormReturn<CheckInSchemaType>;
  onCheckIn: any;
  onVehicleTypeChange: any;
  checkInInfo: CheckInInfo;
  isLoading?: boolean;
};

export default function CheckInVehicleForm({
  onCheckIn,
  onVehicleTypeChange,
  checkInInfo,
  methods,
  isLoading,
}: Props) {
  const cardRef = useRef<HTMLInputElement>(null);
  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
    setFocus,
  } = methods;

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
  const handleFocusPlateNumber = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setFocus("CardId");
  };

  return (
    <>
      <FormProvider {...methods}>
        <FormContainer
          onSubmit={handleSubmit(onCheckIn)}
          onClick={handleFocusPlateNumber}
        >
          <div className='absolute bottom-0 right-0 opacity-0'>
            <FormInput name='CardId' />
          </div>
          <FormInfoRow>
            <InfoSection>
              <InfoVehicle label='Ngày vào'>
                {getDayFromString(checkInInfo.time)}
              </InfoVehicle>
              <InfoVehicle label='Giờ vào'>
                {getHourMinuteFromString(checkInInfo.time)}
              </InfoVehicle>
              <InfoVehicle label='Biển số xe'>
                {checkInInfo.plateText}
              </InfoVehicle>
            </InfoSection>
            <InfoSection numberOfRow={2}>
              <InfoVehicle label='Loại xe'>
                {checkInInfo.customerType === GUEST && (
                  <FormSelect
                    name='vehicleType'
                    onValueChange={onVehicleTypeChange}
                    options={vehicleTypesSelects}
                  />
                )}
              </InfoVehicle>
              <InfoVehicle label='Khách hàng'>
                {checkInInfo.customerType}
              </InfoVehicle>
            </InfoSection>
          </FormInfoRow>
          <FormNameRow isLoading={isLoading} label='Làn vào' error={false}>
            {checkInInfo.message}
          </FormNameRow>
          <button type='submit' hidden>
            submit
          </button>
        </FormContainer>
      </FormProvider>
    </>
  );
}
