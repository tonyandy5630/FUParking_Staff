import React, { ChangeEvent, memo, useRef, useState } from "react";
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
import { ErrorResponse } from "@my_types/index";
import { NEED_TO_PAY } from "@constants/error-message.const";
import { toast } from "react-toastify";

function CheckoutSection({ cameraSize = "sm", ...props }: Props) {
  const webcamRef = useRef(null);
  const [plateImg, setPlateImg] = useState<string | undefined>("");
  const [plateText, setPlateText] = useState<string | undefined>("");
  const [size] = useState(getSize(cameraSize));
  const [cashToPay, setCashToPay] = useState<number | undefined>(0);
  const [cardText, setCardText] = useState("");
  const [needPay, setNeedPay] = useState(false);

  const methods = useForm({
    resolver: yupResolver(CheckOutSchema),
    defaultValues: {
      //! HARD CODE FOR TESTING
      GateOutId: "E74F3F1F-BA7B-4989-EC20-08DD7D140E5F",
    },
  });

  const onCardTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCardText(e.target.value);
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

  const { isError: isCheckOutError, isSuccess: isCheckoutSuccess } =
    checkOutMutation;

  const { isError: checkOutError } = checkOutMutation;

  const onCheckOutPayment = async () => {
    try {
      const data = getValues("CardNumber") as string;
      console.log(data);
      await paymentMutation.mutateAsync(data, {
        onSuccess: (res) => {
          reset();
          setNeedPay(false);
          setPlateImg("");
          setPlateText("Xe tiếp theo");
          setCashToPay(0);
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onCheckOut = async (data: CheckOut) => {
    try {
      const checkOutBody = new FormData();
      const imageSrc = (webcamRef.current as any).getScreenshot();
      const file = base64StringToFile(imageSrc, "uploaded_image.png");
      const current = new Date().toLocaleTimeString();

      checkOutBody.append("CardNumber", cardText);
      checkOutBody.append("ImageOut", file);
      checkOutBody.append("TimeOut", current);
      checkOutBody.append("GateOutId", data.GateOutId ?? "");

      await checkOutMutation.mutateAsync(checkOutBody as any, {
        onSuccess: (res: ErrorResponse<CheckOutResponse>) => {
          const isNeedToPay = res.data?.data.message === NEED_TO_PAY;
          setPlateImg(res.data?.data.imageIn);
          setCashToPay(res.data?.data.amount);
          setPlateText(res.data?.data.plateNumber);

          if (isNeedToPay) {
            setNeedPay(true);
          } else {
            reset({ CardNumber: "" });
            toast.success("Xe da thanh toan");
          }
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  console.log(plateImg);
  return (
    <Lane focus={props.deviceId === props.currentDevice}>
      <div className='flex flex-col items-start justify-between'>
        <div className='flex items-center justify-between min-w-full'>
          <p className='text-md'>{props.children}</p>
          {/* <p className='text-lg font-bold w-fit'>
            Giờ vào <span className='text-primary'>13:50</span>
          </p> */}
        </div>
        <Frame size={cameraSize}>
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
          className='flex items-center justify-between min-w-full'
          onSubmit={handleSubmit(onCheckOut)}
        >
          <div className='flex flex-col items-baseline font-bold gap-x-1'>
            <p className='mb-3'>
              <span className='text-sm'>Biển xe ra</span>{" "}
              <span className='text-lg text-primary'>{plateText}</span>
            </p>
            <FormInput
              onChange={onCardTextChange}
              value={cardText}
              disabled={needPay}
              autoFocus={true}
              name='CardNumber'
            />
          </div>
          <div className='flex flex-col items-baseline font-bold gap-x-1'>
            <p className='text-lg font-bold'>
              <span className='font-bold text-primary'>{cashToPay}</span> VND
            </p>
            <Button
              className='h-7 text-primary'
              type='button'
              variant='outline'
              disabled={!needPay}
              onClick={onCheckOutPayment}
            >
              Thanh toán
            </Button>
          </div>
        </form>
      </FormProvider>
      <Frame
        size={cameraSize}
        type={
          needPay || checkOutError
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
    </Lane>
  );
}

export default memo(CheckoutSection);
