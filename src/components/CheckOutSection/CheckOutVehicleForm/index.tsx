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
import { CheckOutSchemaType } from "@utils/schema/checkoutSchema";
import { CheckOutInfo } from "@components/CheckOutSection";
import { Button } from "@components/ui/button";

type Props = {
  methods: UseFormReturn<CheckOutSchemaType>;
  onCheckOut: any;
  checkOutInfo: CheckOutInfo;
  isLoading?: boolean;
  onCashCheckOut: () => void;
  isError?: boolean;
};

export default function CheckOutVehicleForm({
  onCheckOut,
  checkOutInfo,
  methods,
  isLoading,
  onCashCheckOut,
  isError,
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
    enabled: checkOutInfo.customerType === GUEST,
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
    setFocus("CardNumber");
  };
  return (
    <>
      <FormProvider {...methods}>
        <FormContainer
          onSubmit={handleSubmit(onCheckOut)}
          onClick={handleFocusPlateNumber}
        >
          <div className='absolute bottom-0 right-0 opacity-1'>
            <FormInput name='CardNumber' />
          </div>
          <FormInfoRow>
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
                label='Biển số xe ra'
                col={true}
              >
                {checkOutInfo.plateTextOut}
              </InfoVehicle>
              <InfoVehicle
                className='row-span-2'
                label='Biển số xe vào'
                col={true}
              >
                {checkOutInfo.plateTextIn}
              </InfoVehicle>
            </InfoSection>
            <InfoSection numberOfRow={2}>
              <InfoVehicle label='Giá vé' col={true}>
                {checkOutInfo.cashToPay} VND
              </InfoVehicle>
              <InfoVehicle label='Loại vé' col={true}>
                {checkOutInfo.customerType}
              </InfoVehicle>
            </InfoSection>
          </FormInfoRow>
          <FormNameRow isLoading={isLoading} label='Làn ra' error={isError}>
            {checkOutInfo.needPay ? (
              <Button variant='default' type='button' onClick={onCashCheckOut}>
                Thanh toán tiền mặt
              </Button>
            ) : (
              checkOutInfo.message
            )}
          </FormNameRow>
          <button type='submit' hidden>
            submit
          </button>
        </FormContainer>
      </FormProvider>
    </>
  );
}
