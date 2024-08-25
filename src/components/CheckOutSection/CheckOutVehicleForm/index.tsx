import React, { SyntheticEvent, useCallback, useMemo, useRef } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import FormInput from "@components/Form/Input";

import { GUEST } from "@constants/customer.const";

import { getDayFromString, getHourMinuteFromString } from "@utils/date";

import { getVehicleTypesAPI } from "@apis/vehicle.api";
import { useQuery } from "@tanstack/react-query";

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
import { SUBMIT_LEFT_HOTKEY, SUBMIT_RIGHT_HOTKEY } from "../../../hotkeys";
import PAGE from "../../../../url";
import { useHotkeys } from "react-hotkeys-hook";
import { CheckOutInfo } from "@my_types/check-out";
import { useSelector } from "react-redux";
import { RootState } from "@utils/store";

type Props = {
  methods: UseFormReturn<CheckOutSchemaType>;
  onCheckOut: any;
  checkOutInfo: CheckOutInfo;
  isLoading?: boolean;
  onCashCheckOut: () => void;
  isError?: boolean;
  position: LanePosition;
};

export default function CheckOutVehicleForm({
  onCheckOut,
  // checkOutInfo,
  methods,
  isLoading,
  onCashCheckOut,
  isError,
  position,
}: Props) {
  const checkOutInfo = useSelector((state: RootState) => state.checkOutCard);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      buttonRef.current.click();
    }
  };
  const ref = useHotkeys(
    position === LANE.LEFT ? SUBMIT_LEFT_HOTKEY : SUBMIT_RIGHT_HOTKEY,
    handleClick,
    {
      scopes: [PAGE.CHECK_OUT, position],
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
    "shift",
    () => {
      setFocus("CardNumber");
      reset();
    },
    {
      scopes: [PAGE.CHECK_OUT, position],
      enableOnFormTags: ["input", "select", "textarea"],
    }
  );

  const handleFocusPlateNumber = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setFocus("CardNumber");
  };

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
                {checkOutInfo.plateTextOut}
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
