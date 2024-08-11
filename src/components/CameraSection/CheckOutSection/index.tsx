import React, { ChangeEvent, memo, useCallback, useRef, useState } from "react";
import { Props } from "..";
import Lane from "../Lane";
import Frame from "../Frame";
import Webcam from "react-webcam";
import { getSize } from "@utils/camera";
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
import { NEED_TO_PAY } from "@constants/error-message.const";
import { toast } from "react-toastify";
import FormItem from "../Form/FormItem";
import FormBox from "../Form/FormBox";
import toLocaleDate from "@utils/date";
import { licensePlateAPI } from "@apis/license.api";
import { LicenseResponse } from "@my_types/license";

function CheckoutSection({ cameraSize = "sm", ...props }: Props) {
  const webcamRef = useRef(null);
  const [plateImg, setPlateImg] = useState<string | undefined>("");
  const [imgOut, setImgOut] = useState<string | undefined>("");
  const [plateText, setPlateText] = useState<string | undefined>("");
  const [cashToPay, setCashToPay] = useState<number | undefined>(0);
  const [checkOutCardText, setCheckOutCardText] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [needPay, setNeedPay] = useState(false);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [message, setMessage] = useState("");
  const cardRef = useRef<HTMLInputElement>(null);

  const methods = useForm({
    resolver: yupResolver(CheckOutSchema),
    defaultValues: {
      //! HARD CODE FOR TESTING
      GateOutId: "E74F3F1F-BA7B-4989-EC20-08DD7D140E5F",
    },
    values: {
      GateOutId: "E74F3F1F-BA7B-4989-EC20-08DD7D140E5F",
    },
  });

  const onCheckOutCardTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckOutCardText(e.target.value);
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

  const {
    isError: isCheckOutError,
    isSuccess: isCheckoutSuccess,
    isPending: isCheckingOut,
  } = checkOutMutation;

  const plateDetectionMutation = useMutation({
    mutationKey: ["plate-detection-check-out"],
    mutationFn: licensePlateAPI,
  });

  const {
    isPending: isReadingPlate,
    isSuccess: isReadPlateSuccess,
    isError: isReadPlateError,
  } = plateDetectionMutation;

  const handleCheckOutPayment = useCallback(async () => {
    try {
      if (needPay) {
        const data = (getValues("CardNumber") as string) ?? checkOutCardText;
        await paymentMutation.mutateAsync(data, {
          onSuccess: (res) => {
            reset({ CardNumber: "" });

            resetInfo();
            setCashToPay(0);
          },
        });
      }
    } catch (error) {
      reset({ CardNumber: "" });
      setMessage("LỖI HỆ THỐNG");
    } finally {
      setNeedPay(false);
    }
  }, [paymentMutation.isPending, needPay, checkOutCardText]);

  const focusCardInput = () => {
    if (cardRef.current) cardRef.current?.focus();
  };

  const onCheckOut = async (checkOutData: CheckOut) => {
    try {
      const plateNumberBody = new FormData();
      const imageSrc = (webcamRef.current as any).getScreenshot();
      const file = base64StringToFile(imageSrc, "uploaded_image.png");

      plateNumberBody.append("upload", file);
      plateNumberBody.append("regions", "vn");
      const current = new Date().toISOString();

      let plateRead = "";

      await plateDetectionMutation.mutateAsync(plateNumberBody, {
        onSuccess: (plateDetectionRes: SuccessResponse<LicenseResponse>) => {
          setImgOut(imageSrc);
          plateRead = plateDetectionRes.data.results[0].plate.toUpperCase();
        },
      });

      const checkOutBody = new FormData();
      checkOutBody.append(
        "CardNumber",
        (cardRef.current?.value as string) ?? checkOutCardText
      );
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
            setPlateImg(imageIn);
            setCashToPay(amount);
            setPlateText(plateNumber);
            setTimeIn(toLocaleDate(new Date(timeIn)));
            setCustomerType(typeOfCustomer);
            setTimeOut(toLocaleDate(new Date()));
            if (plateNumber === plateRead) {
              setMessage("BIỂN SỐ TRÙNG KHỚP");
            } else {
              setMessage("BIỂN SỐ KHÔNG TRÙNG KHỚP");
            }
          }

          if (isNeedToPay) {
            setNeedPay(true);
          } else {
            reset({ CardNumber: "" });
            toast.success("Xe da thanh toan");
          }
        },
      });
    } catch (error) {
      setMessage("LỖI HỆ THỐNG");
    }
  };

  const resetInfo = () => {
    setCheckOutCardText("");
    setPlateText("");
    setImgOut("");
    setPlateImg("");
    setMessage("");
    setTimeIn("");
    setCashToPay(0);
    setCustomerType("");
    focusCardInput();
  };
  const handleFinishCheckOut = useCallback(
    async (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.code === "Space" && needPay) {
        await handleCheckOutPayment();
      } else if (e.code === "Space") {
        resetInfo();
      }
    },
    [isCheckoutSuccess, needPay]
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
          <img
            src={isCheckingOut ? "./loading.svg" : imgOut}
            className={`aspect-video`}
            width='100%'
            height='100%'
          />
        </Frame>
        <Frame size={cameraSize} title='Ảnh xe vào'>
          <img
            src={isCheckingOut ? "./loading.svg" : plateImg}
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
                  ref={cardRef}
                  value={checkOutCardText}
                  onChange={onCheckOutCardTextChange}
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
                <FormBox title='T/G xe vào: '>{timeIn}</FormBox>
              </FormItem>
              <FormItem>
                <FormBox title='Phí giữ xe: '>{cashToPay}</FormBox>
              </FormItem>
              <FormItem>
                <FormBox title='T/G xe ra: '>{timeOut}</FormBox>
              </FormItem>
              <FormItem>
                <FormBox>{message}</FormBox>
              </FormItem>
              <FormItem>
                <FormBox title='Biển số xe: '>{plateText}</FormBox>
              </FormItem>
              <FormItem>
                <Button
                  className='min-w-full'
                  type='button'
                  onClick={handleCheckOutPayment}
                >
                  "Space": Đồng ý mở cổng
                </Button>
              </FormItem>
            </div>
          </form>
        </FormProvider>
        <Frame
          size={cameraSize}
          type={
            needPay || isCheckOutError
              ? "error"
              : isCheckoutSuccess
              ? "success"
              : "loading"
          }
        >
          <img
            src={plateImg}
            className={`aspect-video`}
            width='100%'
            height='100%'
          />
        </Frame>
      </div>
    </Lane>
  );
}

export default memo(CheckoutSection);
