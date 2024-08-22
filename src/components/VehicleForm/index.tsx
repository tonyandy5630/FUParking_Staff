import FormItem from "@components/CameraSection/Form/FormItem";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormInput from "@components/Form/Input";
import FormBox from "@components/CameraSection/Form/FormBox";
import { Button } from "@components/ui/button";
import {
  DEFAULT_GUEST,
  GUEST,
  SYSTEM_CUSTOMER,
} from "@constants/customer.const";
import useSelectGate from "../../hooks/useSelectGate";
import { CheckIn, UpdateVehicleTypeInfo } from "@my_types/check-in";
import { GATE_IN } from "@constants/gate.const";
import { GET_GATE_IN_ID_CHANNEL } from "@channels/index";
import { GET_INFORMATION_SUCCESSFULLY } from "@constants/message.const";
import toLocaleDate from "@utils/date";
import { CUSTOMER_NOT_EXIST_ERROR } from "@constants/error-message.const";
import { base64StringToFile } from "@utils/file";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckInSchema from "@utils/schema/checkinSchema";
import { getVehicleTypesAPI } from "@apis/vehicle.api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CustomerCheckInAPI, GuestCheckInAPI } from "@apis/check-in.api";
import { licensePlateAPI } from "@apis/license.api";
import { SuccessResponse } from "@my_types/index";
import { LicenseResponse } from "@my_types/license";
import UpdateVehicleTypeDialog from "@components/UpdateVehicleTypeDialog";
import FormContainer, {
  FormNameRow,
  FormInfoRow,
} from "@components/CameraSection/Form";
import InfoSection, {
  InfoVehicle,
} from "@components/CameraSection/Form/InfoSection";
import { watch } from "original-fs";
import FormSelect, { SelectOptions } from "@components/Form/FormSelect";

const initCheckInInfo = {
  plateImg: "",
  plateText: "",
  cardText: "",
  imageFile: "",
  time: "",
  customerType: DEFAULT_GUEST,
};

type Props = {
  webcamRef: any;
  methods: any;
  onCheckIn: any;
  onVehicleTypeChange: any;
  checkInInfo: any;
  onCardTextChange: any;
  handleClick?: any;
};

export default function VehicleForm({
  onCheckIn,
  onVehicleTypeChange,
  checkInInfo,
  onCardTextChange,
  methods,
  handleClick,
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

  const handleFocusPlateNumber = (e: any) => {
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
            <FormInput
              name='CardId'
              ref={cardRef}
              onChange={onCardTextChange}
            />
          </div>
          <FormInfoRow>
            <InfoSection>
              <InfoVehicle label='Ngày vào'></InfoVehicle>
              <InfoVehicle label='Giờ vào'></InfoVehicle>
              <InfoVehicle label='Biển số xe'></InfoVehicle>
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
              <InfoVehicle label='Khách hàng'></InfoVehicle>
            </InfoSection>
          </FormInfoRow>
          <FormNameRow message={checkInInfo.message} error={false}>
            Làn ra
          </FormNameRow>
          <button type='submit' hidden>
            submit
          </button>
        </FormContainer>
      </FormProvider>
    </>
  );
}
