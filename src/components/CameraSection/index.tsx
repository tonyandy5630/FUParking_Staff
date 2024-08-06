import { SizeTypes } from "@my_types/my-camera";
import { getSize } from "@utils/camera";
import Webcam from "react-webcam";
import Lane from "./Lane";
import { ChangeEvent, memo, useCallback, useRef, useState } from "react";
import { Button } from "@components/ui/button";
import Frame from "./Frame";
import { Input } from "@components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { licensePlateAPI } from "@apis/license.api";
import { ErrorResponse, SuccessResponse } from "@my_types/index";
import { LicenseResponse } from "@my_types/license";
import { toast } from "react-toastify";
import { base64StringToFile } from "@utils/file";
import { CustomerCheckInAPI, GuestCheckInAPI } from "@apis/check-in.api";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckInSchema from "@utils/schema/checkinSchema";
import { CheckIn } from "@my_types/check-in";
import FormInput from "@components/Form/Input";
import { CUSTOMER_NOT_EXIST_ERROR } from "@constants/error-message.const";

export type Props = {
  deviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  children: any;
  currentDevice: ConstrainDOMString | undefined;
};

function CameraSection({ cameraSize = "sm", ...props }: Props) {
  const webcamRef = useRef(null);
  const [plateImg, setPlateImg] = useState("");
  const [plateText, setPlateText] = useState("");
  const [size] = useState(getSize(cameraSize));
  const [cardText, setCardText] = useState("");
  const methods = useForm({
    resolver: yupResolver(CheckInSchema),
    defaultValues: {
      //! HARD CODE FOR TESTING
      GateInId: "E74F3F1F-BA7B-4989-EC20-08DC7D140E4F",
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    getValues,
  } = methods;

  const plateDetectionMutation = useMutation({
    mutationKey: ["plate-detection"],
    mutationFn: licensePlateAPI,
  });

  const {
    isPending: isReadingPlate,
    isSuccess: isReadPlateSuccess,
    isError: isReadPlateError,
  } = plateDetectionMutation;

  const focus = props.currentDevice === props.deviceId;

  const customerCheckInMutation = useMutation({
    mutationKey: ["customer-check-in"],
    mutationFn: CustomerCheckInAPI,
  });

  const guestCheckInMutation = useMutation({
    mutationKey: ["guest-check-in"],
    mutationFn: GuestCheckInAPI,
  });

  const {
    isSuccess: isCustomerCheckInSuccess,
    isPending: isCustomerCheckingIn,
    isError: isCustomerCheckInError,
  } = customerCheckInMutation;

  const {
    isSuccess: isGuestCheckInSuccess,
    isPending: isGuestCheckingIn,
    isError: isGuestCheckInError,
  } = guestCheckInMutation;

  const handleChangePlateTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setPlateText(e.target.value);
  };

  const onCardTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCardText(e.target.value);
  };

  const onCheckIn = useCallback(
    async (checkInData: CheckIn) => {
      try {
        if (webcamRef.current) {
          const plateNumberBody = new FormData();
          const imageSrc = (webcamRef.current as any).getScreenshot();
          const file = base64StringToFile(imageSrc, "uploaded_image.png");
          plateNumberBody.append("upload", file);
          plateNumberBody.append("regions", "vn");

          await plateDetectionMutation.mutateAsync(plateNumberBody, {
            onSuccess: async (
              plateDetectionRes: SuccessResponse<LicenseResponse>
            ) => {
              checkInData.PlateNumber =
                plateDetectionRes.data.results[0].plate.toUpperCase();
              checkInData.ImageIn = imageSrc;

              const checkInBody = new FormData();
              checkInBody.append(
                "PlateNumber",
                plateDetectionRes.data.results[0].plate.toUpperCase()
              );
              console.log(checkInData);
              checkInBody.append("CardNumber", checkInData.CardNumber ?? "");
              checkInBody.append("ImageIn", file);
              //! HARD CODE FOR TESTING
              checkInBody.append(
                "GateInId",
                "E74F3F1F-BA7B-4989-EC20-08DC7D140E5F"
              );

              setPlateText(checkInData.PlateNumber);
              setValue("PlateNumber", checkInData.PlateNumber);

              await customerCheckInMutation.mutateAsync(checkInBody as any, {
                onSuccess: (res) => {
                  reset();
                  setPlateImg(imageSrc);
                },
                onError: async (error: any) => {
                  if (
                    error.response.data.message === CUSTOMER_NOT_EXIST_ERROR
                  ) {
                    checkInBody.append(
                      "VehicleTypeId",
                      "F5AE3A7E-EAF1-4A38-542F-08DC711EAFF7"
                    );
                    await guestCheckInMutation.mutateAsync(checkInBody as any, {
                      onSuccess: (res) => {
                        reset();
                        setPlateImg(imageSrc);
                      },
                      onError: (error) => {
                        reset();
                        console.error(error);
                      },
                    });
                  }
                },
              });
            },
            onError: (error) => {
              toast.error("Không nhận diện được biển số");
              reset();
            },
          });
        }
      } catch (error) {
        reset();
        console.log(error);
      }
    },
    [webcamRef, plateImg, cardText]
  );

  return (
    <Lane focus={props.deviceId === props.currentDevice}>
      <div className='flex flex-col items-start justify-between'>
        <p className='text-md'>{props.children}</p>
        <Frame>
          <Webcam
            audio={false}
            ref={webcamRef}
            className='w-full h-full'
            videoConstraints={{
              deviceId: props.deviceId,
            }}
            style={{ objectFit: "cover" }}
          />
        </Frame>
      </div>
      <FormProvider {...methods}>
        <form
          className='flex items-center justify-end w-full gap-x-1 h-fit'
          onSubmit={handleSubmit(onCheckIn)}
        >
          <FormInput
            className='w-2/5 h-7 border-primary'
            placeholder='Biển số xe'
            name='PlateNumber'
            value={plateText}
            onChange={handleChangePlateTxt}
          />
          <FormInput
            // type='hidden'
            autoFocus={focus}
            value={cardText}
            name='CardNumber'
            onChange={onCardTextChange}
          />
          <Button type='submit' className='h-6 text-primary' variant='ghost'>
            Sửa
          </Button>
        </form>
      </FormProvider>
      <Frame
        type={
          isCustomerCheckingIn || isGuestCheckingIn
            ? "loading"
            : isCustomerCheckInError && isGuestCheckInError
            ? "error"
            : "success"
        }
      >
        <img
          src={plateImg}
          onDoubleClick={() => setPlateImg("")}
          className={`aspect-video`}
          width='100%'
          height='100%'
        />
      </Frame>
    </Lane>
  );
}

export default memo(CameraSection);
