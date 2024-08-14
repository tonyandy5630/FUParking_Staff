import React, { memo, useCallback, useRef, useState } from "react";
import { Props } from "..";
import Lane from "../Lane";
import Frame from "../Frame";
import Webcam from "react-webcam";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckOutSchema from "@utils/schema/checkoutSchema";
import { useMutation } from "@tanstack/react-query";
import { checkOutAPI, checkOutPaymentAPI } from "@apis/check-out.api";
import FormInput from "@components/Form/Input";
import { Button } from "@components/ui/button";
import { CheckOut, CheckOutResponse } from "@my_types/check-out";
import { base64StringToFile } from "@utils/file";
import { ErrorResponse, SuccessResponse } from "@my_types/index";
import {
  NEED_TO_PAY,
  PLATE_NUMBER_NOT_MATCHED,
} from "@constants/error-message.const";
import FormItem from "../Form/FormItem";
import FormBox from "../Form/FormBox";
import toLocaleDate, { getLocalISOString } from "@utils/date";
import { licensePlateAPI } from "@apis/license.api";
import { LicenseResponse } from "@my_types/license";
import { DEFAULT_GUEST } from "@constants/customer.const";
import Image from "@components/Image";

const initCheckOutInfo = {
  plateImg: "",
  imgOut: "",
  plateText: "",
  cashToPay: 0,
  checkOutCardText: "",
  customerType: DEFAULT_GUEST,
  needPay: false,
  timeIn: "",
  timeOut: "",
};

function CheckoutSection({ cameraSize = "sm", ...props }: Props) {
  const webcamRef = useRef(null);
  const [checkOutInfo, setCheckOutInfo] = useState(initCheckOutInfo);
  const [message, setMessage] = useState("");
  const checkOutCardRef = useRef<HTMLInputElement>(null);
  const plateRef = useRef<HTMLInputElement>(null);
  const methods = useForm({
    resolver: yupResolver(CheckOutSchema),
    defaultValues: {
      //! HARD CODE FOR TESTING
      GateOutId: "E74F3F1F-BA7B-4989-EC20-08DD7D140E5F",
    },
    values: {
      GateOutId: "E74F3F1F-BA7B-4989-EC20-08DD7D140E5F",
      PlateNumber: "29B139393",
    },
  });

  const onCheckOutCardTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckOutInfo((prev) => ({ ...prev, checkOutCardText: e.target.value }));
  };

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    getValues,
  } = methods;

  const checkOutMutation = useMutation({
    mutationKey: ["check-out"],
    mutationFn: checkOutAPI,
  });

  const paymentMutation = useMutation({
    mutationKey: ["payment"],
    mutationFn: checkOutPaymentAPI,
  });

  const handleChangePlateTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCheckOutInfo((prev) => ({ ...prev, plateText: e.target.value }));
  };

  const {
    isError: isCheckOutError,
    isSuccess: isCheckoutSuccess,
    isPending: isCheckingOut,
  } = checkOutMutation;

  const plateDetectionMutation = useMutation({
    mutationKey: ["plate-detection-check-out"],
    mutationFn: licensePlateAPI,
  });

  const handleCheckOutPayment = useCallback(async () => {
    try {
      const { needPay, checkOutCardText } = checkOutInfo;
      if (needPay) {
        const data = (getValues("CardNumber") as string) ?? checkOutCardText;
        await paymentMutation.mutateAsync(data, {
          onSuccess: (res) => {
            reset({ CardNumber: "" });
            resetInfo();
            setCheckOutInfo((prev) => ({ ...prev, cashToPay: 0 }));
          },
        });
      }
    } catch (error) {
      reset({ CardNumber: "" });
      setMessage("LỖI HỆ THỐNG");
    } finally {
      setCheckOutInfo((prev) => ({ ...prev, needPay: false }));
    }
  }, [
    paymentMutation.isPending,
    checkOutInfo.needPay,
    checkOutInfo.checkOutCardText,
  ]);

  const focusCardCheckOutInput = () => {
    if (checkOutCardRef.current) {
      checkOutCardRef.current?.focus();
    }
  };

  const handleFixPlate = async () => {
    try {
      const checkOutBody = new FormData();
      checkOutBody.append(
        "CardNumber",
        (checkOutCardRef.current?.value as string) ??
          checkOutInfo.checkOutCardText
      );
      const imageSrc = checkOutInfo.imgOut;
      const file = base64StringToFile(imageSrc, "uploaded_image.png");

      checkOutBody.append("PlateNumber", checkOutInfo.plateText);
      checkOutBody.append("ImageOut", file);
      checkOutBody.append("TimeOut", getLocalISOString(new Date()));
      checkOutBody.append("GateOutId", "E74F3F1F-BA7B-4989-EC20-08DD7D140E5F");

      await checkOutMutation.mutateAsync(checkOutBody as any, {
        onSuccess: (res) => {
          const isNeedToPay = res.data?.data.message === NEED_TO_PAY;
          if (res.data) {
            const {
              amount,
              imageIn,
              message,
              plateNumber,
              timeIn,
              typeOfCustomer,
            } = res.data.data;
            setCheckOutInfo((prev) => ({
              ...prev,
              plateImg: imageIn,
              cashToPay: amount,
              plateText: plateNumber,
              timeIn: toLocaleDate(new Date(timeIn)),
              customerType: typeOfCustomer,
              timeOut: toLocaleDate(new Date()),
            }));
            if (plateNumber === checkOutInfo.plateText) {
              setMessage("BIỂN SỐ TRÙNG KHỚP");
            } else {
              setMessage("BIỂN SỐ KHÔNG TRÙNG KHỚP");
            }
          }

          if (isNeedToPay) {
            setCheckOutInfo((prev) => ({ ...prev, needPay: true }));
          } else {
            resetInfo();
            reset({ CardNumber: "" });
          }
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onCheckOut = async (checkOutData: CheckOut) => {
    try {
      console.log(checkOutData);
      if (!webcamRef.current as any) {
        setMessage("KHÔNG TÌM THẤY CAMERA");
      }
      const plateNumberBody = new FormData();
      const imageSrc = (webcamRef.current as any).getScreenshot();
      const file = base64StringToFile(imageSrc, "uploaded_image.png");

      plateNumberBody.append("upload", file);
      plateNumberBody.append("regions", "vn");
      const current = getLocalISOString(new Date());

      let plateRead = "";

      await plateDetectionMutation.mutateAsync(plateNumberBody, {
        onSuccess: (plateDetectionRes: SuccessResponse<LicenseResponse>) => {
          setCheckOutInfo((prev) => ({ ...prev, imgOut: imageSrc }));
          plateRead = plateDetectionRes.data.results[0].plate.toUpperCase();
        },
      });

      const checkOutBody = new FormData();
      checkOutBody.append(
        "CardNumber",
        (checkOutCardRef.current?.value as string) ??
          checkOutInfo.checkOutCardText
      );
      checkOutBody.append("PlateNumber", plateRead);
      checkOutBody.append("ImageOut", file);
      checkOutBody.append("TimeOut", current);
      checkOutBody.append("GateOutId", checkOutData.GateOutId ?? "");
      await checkOutMutation.mutateAsync(checkOutBody as any, {
        onSuccess: (res: ErrorResponse<CheckOutResponse>) => {
          const isNeedToPay = res.data?.data.message === NEED_TO_PAY;
          if (res.data) {
            const {
              amount,
              imageIn,
              message,
              plateNumber,
              timeIn,
              typeOfCustomer,
            } = res.data.data;
            setCheckOutInfo((prev) => ({
              ...prev,
              plateImg: imageIn,
              cashToPay: amount,
              plateText: plateNumber,
              timeIn: toLocaleDate(new Date(timeIn)),
              customerType: typeOfCustomer,
              timeOut: toLocaleDate(new Date()),
            }));
            if (plateNumber === plateRead) {
              setMessage("BIỂN SỐ TRÙNG KHỚP");
            } else {
              setMessage("BIỂN SỐ KHÔNG TRÙNG KHỚP");
            }
          }

          if (isNeedToPay) {
            setCheckOutInfo((prev) => ({ ...prev, needPay: true }));
          } else {
            reset({ CardNumber: "" });
          }
        },
        onError: (error: any) => {
          if (error.response.data.message === PLATE_NUMBER_NOT_MATCHED) {
            setCheckOutInfo((prev) => ({
              ...prev,
              plateText: plateRead,
            }));
            if (plateRef.current) plateRef.current.focus();
            setMessage("BIỂN SỐ KHÔNG TRÙNG KHỚP");
          }
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  const resetInfo = () => {
    setMessage("");
    setCheckOutInfo(initCheckOutInfo);
    focusCardCheckOutInput();
  };
  const handleFinishCheckOut = useCallback(
    async (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.code === "Space" && checkOutInfo.needPay) {
        await handleCheckOutPayment();
      } else if (e.code === "Space") {
        resetInfo();
      }
    },
    [isCheckoutSuccess, checkOutInfo.needPay]
  );

  return (
    <Lane focus={props.deviceId === props.currentDevice}>
      <div className='flex items-start justify-between min-w-full'>
        <Frame size={cameraSize} title='Camera'>
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
        <Frame size={cameraSize} title='Ảnh xe ra'>
          <Image
            src={checkOutInfo.imgOut}
            isLoading={isCheckingOut || checkOutMutation.isPending}
          />
        </Frame>
        <Frame size={cameraSize} title='Ảnh xe vào'>
          <Image
            src={checkOutInfo.plateImg}
            isLoading={isCheckingOut || checkOutMutation.isPending}
          />
        </Frame>
      </div>
      <div className='flex items-center justify-between min-w-full'>
        <FormProvider {...methods}>
          <form
            className='flex flex-col items-center border border-solid w-fit gap-x-1 min-h-[400px] h-[375px]'
            onKeyDown={handleFinishCheckOut}
            onSubmit={handleSubmit(onCheckOut)}
          >
            <div className='flex items-center justify-center min-w-full font-bold text-white bg-primary'>
              <h5>THÔNG TIN THẺ</h5>
            </div>
            <div className='grid h-full min-w-full grid-cols-[repeat(2,1fr_400px)]'>
              <FormItem>
                <FormInput
                  autoFocus={true}
                  placeholder='SỔ THẺ'
                  name='CardId'
                  ref={checkOutCardRef}
                  value={checkOutInfo.checkOutCardText}
                  onChange={onCheckOutCardTextChange}
                />
              </FormItem>
              <FormItem>
                <div className='min-w-full border border-black'>
                  <div className='min-w-full text-center bg-green-300'>
                    THÔNG TIN KHÁCH HÀNG
                  </div>
                  <div className='text-center uppercase'>
                    {checkOutInfo.customerType === ""
                      ? "KHÁCH HÀNG TIẾP THEO"
                      : checkOutInfo.customerType}
                  </div>
                </div>
              </FormItem>
              <FormItem>
                <FormBox title='T/G xe vào: '>{checkOutInfo.timeIn}</FormBox>
              </FormItem>
              <FormItem>
                <FormBox title='Phí giữ xe: '>{checkOutInfo.cashToPay}</FormBox>
              </FormItem>
              <FormItem>
                <FormBox title='T/G xe ra: '>{checkOutInfo.timeOut}</FormBox>
              </FormItem>
              <FormItem>
                <FormBox>{message}</FormBox>
              </FormItem>
              <FormItem>
                <FormBox title='Biển số xe: '>{checkOutInfo.plateText}</FormBox>
              </FormItem>
              <FormItem className='grid-cols-2 gap-1'>
                <div className='max-h-[50%] flex items-center'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleFixPlate}
                  >
                    "Enter": Nhập biển
                  </Button>
                </div>
                <FormInput
                  placeholder='BIỂN SỐ XE'
                  value={checkOutInfo.plateText}
                  name='PlateNumber'
                  ref={plateRef}
                  onChange={handleChangePlateTxt}
                />
              </FormItem>
              <FormItem className='col-span-4'>
                <Button
                  className='min-w-full'
                  type='submit'
                  onClick={handleCheckOutPayment}
                >
                  "Space": Đồng ý mở cổng
                </Button>
              </FormItem>
            </div>
          </form>
        </FormProvider>
        <Frame size={cameraSize}>
          <Image src={checkOutInfo.plateImg} isLoading={isCheckingOut} />
        </Frame>
      </div>
    </Lane>
  );
}

export default memo(CheckoutSection);
