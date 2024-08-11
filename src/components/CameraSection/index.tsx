import { SizeTypes } from "@my_types/my-camera";
import { getSize } from "@utils/camera";
import Webcam from "react-webcam";
import Lane from "./Lane";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@components/ui/button";
import Frame from "./Frame";
import { useMutation, useQuery } from "@tanstack/react-query";
import { licensePlateAPI } from "@apis/license.api";
import { SuccessResponse } from "@my_types/index";
import { LicenseResponse } from "@my_types/license";
import { toast } from "react-toastify";
import { base64StringToFile } from "@utils/file";
import { CustomerCheckInAPI, GuestCheckInAPI } from "@apis/check-in.api";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckInSchema, {
  CheckInSchemaType as CheckInType,
} from "@utils/schema/checkinSchema";
import { CheckIn, UpdateVehicleTypeInfo } from "@my_types/check-in";
import FormInput from "@components/Form/Input";
import { CUSTOMER_NOT_EXIST_ERROR } from "@constants/error-message.const";
import loading from "../../assets/loading.svg";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import FormItem from "./Form/FormItem";
import FormBox from "./Form/FormBox";
import toLocaleDate from "@utils/date";
import { getVehicleTypesAPI } from "@apis/vehicle.api";
import UpdateVehicleTypeDialog from "@components/UpdateVehicleTypeDialog";
import { GET_INFORMATION_SUCCESSFULLY } from "@constants/message.const";

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
  const [size] = useState(getSize("md"));
  const [cardText, setCardText] = useState("");
  const [time, setTime] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [customerType, setCustomerType] = useState("");
  const cardRef = useRef<HTMLInputElement>(null);
  const plateRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<any>();
  const [message, setMessage] = useState("");
  const [openVehicleTypes, setOpenVehicleTypes] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateVehicleInfo, setUpdateVehicleInfo] = useState<
    UpdateVehicleTypeInfo | undefined
  >(undefined);
  const methods = useForm({
    resolver: yupResolver(CheckInSchema),
    defaultValues: {
      //! HARD CODE FOR TESTING
      GateInId: "E74F3F1F-BA7B-4989-EC20-08DC7D140E4F",
    },
  });

  const {
    data: vehicleTypesData,
    isLoading: isLoadingVehicleTypes,
    isSuccess: isSuccessVehicleTypes,
    isError: isErrorVehicleTypes,
  } = useQuery({
    queryKey: ["get-vehicle-types"],
    queryFn: getVehicleTypesAPI,
    retry: 2,
  });

  const vehicleTypesSelects = useMemo(() => {
    const types = vehicleTypesData?.data.data;
    if (isSuccessVehicleTypes && types) {
      return types.map((item) => (
        <SelectItem key={item.id} value={item.id}>
          <div className='flex items-center justify-around gap-x-3'>
            {item.name}
          </div>
        </SelectItem>
      ));
    }
  }, [isSuccessVehicleTypes]);

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

  const onCardTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardText(e.target.value);
  };

  const focusPlateInput = () => {
    if (plateRef.current) plateRef.current?.focus();
  };

  const focusCardInput = () => {
    if (cardRef.current) cardRef.current?.focus();
  };

  const handleOpenDialogChange = () => {
    setOpenDialog((prev) => !prev);
  };

  const handleVehicleTypeChange = useCallback(
    async (e: string) => {
      try {
        const checkInBody = new FormData();
        const file = base64StringToFile(imageFile, "uploaded_image.png");
        checkInBody.append("GateInId", "E74F3F1F-BA7B-4989-EC20-08DC7D140E5F");
        checkInBody.append("PlateNumber", plateText);
        checkInBody.append(
          "CardNumber",
          (cardRef.current?.value as string) ?? cardText
        );
        checkInBody.append("ImageIn", file);
        checkInBody.append("VehicleTypeId", e);
        setOpenVehicleTypes(false);

        await guestCheckInMutation.mutateAsync(checkInBody as any, {
          onSuccess: (res) => {
            setPlateImg(imageFile);
            setIsGuest(false);
            setMessage("KHÁCH CÓ THỂ VÀO");
            setTime(toLocaleDate(new Date()));
          },
        });
      } catch (error) {
        reset();
        focusCardInput();
      }
    },
    [plateText, imageFile, cardText]
  );
  const onCheckIn = async (checkInData: CheckIn) => {
    try {
      if (webcamRef.current) {
        const plateNumberBody = new FormData();
        const imageSrc = (webcamRef.current as any).getScreenshot();
        setImageFile(imageSrc);
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
            checkInBody.append(
              "CardNumber",
              (cardRef.current?.value as string) ?? cardText
            );
            checkInBody.append("ImageIn", file);
            //! HARD CODE FOR TESTING
            checkInBody.append(
              "GateInId",
              "E74F3F1F-BA7B-4989-EC20-08DC7D140E5F"
            );

            setPlateText(plateDetectionRes.data.results[0].plate.toUpperCase());
            setValue("PlateNumber", checkInData.PlateNumber);
            setPlateImg(imageSrc);
            await customerCheckInMutation.mutateAsync(checkInBody as any, {
              onSuccess: (res) => {
                if (res.data.message === GET_INFORMATION_SUCCESSFULLY) {
                  if (res.data.data) {
                    setUpdateVehicleInfo(res.data.data);
                    setOpenDialog(true);
                  }
                }
                setPlateImg(imageSrc);
                setCustomerType("KHÁCH HÀNG SỬ DỤNG APP");
                setMessage("KHÁCH CÓ THỂ VÀO");
                focusPlateInput();
                setTime(toLocaleDate(new Date()));
              },
              onError: async (error: any) => {
                if (error.response.data.message === CUSTOMER_NOT_EXIST_ERROR) {
                  setIsGuest(true);
                  setOpenVehicleTypes(true);
                  setMessage("Chọn loại xe");
                  setCustomerType("KHÁCH VÃNG LAI");
                }
              },
            });
          },
          onError: (error) => {
            toast.error("Không nhận diện được biển số");
            focusCardInput();
            setMessage("Lỗi");
            reset();
          },
        });
      }
    } catch (error) {
      reset();
      focusCardInput();
      setMessage("Lỗi");
    }
  };

  const handleOpenGate = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.code === "Space") {
      reset();
      focusCardInput();
      setIsGuest(false);
      setCustomerType("");
      setTime("");
      setCardText("");
      setPlateText("");
      setPlateImg("");
      setMessage("");
    }
  };

  return (
    <Lane focus={props.deviceId === props.currentDevice}>
      <UpdateVehicleTypeDialog
        open={openDialog}
        info={updateVehicleInfo}
        onOpenChange={handleOpenDialogChange}
      />
      <div className='flex items-start justify-between min-w-full'>
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
      </div>
      <div className='flex items-center justify-between min-w-full'>
        <FormProvider {...methods}>
          <form
            className='flex flex-col items-center border border-solid w-fit gap-x-1 min-h-[400px] h-[375px]'
            onKeyDown={handleOpenGate}
            onSubmit={handleSubmit(onCheckIn)}
          >
            <div className='flex items-center justify-center min-w-full font-bold text-white bg-primary'>
              <h5>THÔNG TIN THẺ</h5>
            </div>
            <div className='grid h-full min-w-full grid-cols-4 '>
              <FormItem>
                <FormInput
                  autoFocus={true}
                  placeholder='SỔ THẺ'
                  name='CardId'
                  ref={cardRef}
                  value={cardText}
                  onChange={onCardTextChange}
                />
              </FormItem>
              <FormItem>
                <div className='min-w-full border border-black'>
                  <div className='min-w-full text-center bg-green-300'>
                    THÔNG TIN KHÁCH HÀNG
                  </div>
                  <div className='text-center uppercase'>
                    {customerType === ""
                      ? "KHÁCH HÀNG TIẾP THEO"
                      : customerType}
                  </div>
                </div>
              </FormItem>
              <FormItem>
                <FormBox title='T/G xe vào: '>{time}</FormBox>
              </FormItem>
              <FormItem>
                <Select
                  disabled={!isGuest}
                  open={openVehicleTypes}
                  onValueChange={handleVehicleTypeChange}
                >
                  <SelectTrigger className='min-w-full '>
                    <SelectValue placeholder='Chọn loại xe' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>{vehicleTypesSelects}</SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
              <FormItem>
                <FormBox title='Biển số xe: '>{plateText}</FormBox>
              </FormItem>
              <FormItem>
                <FormBox>{message}</FormBox>
              </FormItem>
              <FormItem className='grid-cols-2 gap-1'>
                <div className='max-h-[50%]'>
                  <Button type='button'>"Enter":nhập biển</Button>
                </div>
                <FormInput
                  placeholder='BIỂN SỐ XE'
                  value={plateText}
                  ref={plateRef}
                  name='PlateNumber'
                  onChange={handleChangePlateTxt}
                />
              </FormItem>
              <FormItem>
                <Button className='min-w-full' type='submit'>
                  "Space": Đồng ý mở cổng
                </Button>
              </FormItem>
            </div>
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
          {}
          <img
            src={isCustomerCheckingIn || isGuestCheckingIn ? loading : plateImg}
            className={`aspect-video`}
            width='100%'
            height='100%'
          />
        </Frame>
      </div>
    </Lane>
  );
}

export default memo(CameraSection);
