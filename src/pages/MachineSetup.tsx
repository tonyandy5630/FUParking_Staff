import { Button } from "@components/ui/button";
import { GO_BACK_CHANNEL, OPEN_ERROR_DIALOG_CHANNEL } from "@channels/index";
import { ArrowLeft } from "lucide-react";
import React, { BaseSyntheticEvent, lazy, SyntheticEvent } from "react";
import Container from "@components/Layout/container";
import { useMutation } from "@tanstack/react-query";
import { changeMachineCodeAPI } from "@apis/machine.api";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import MachineSchema from "@utils/schema/machineSchema";
import { MachineCode } from "@my_types/machine";
import { toast } from "react-toastify";
import FormInput from "@components/Form/Input";
import MyButton from "@components/Button";
const MachineUpdateStatus = lazy(
  () => import("@components/MachineUpdateStatus")
);

export default function MachineSetupPage() {
  const handleGoBack = () => {
    window.ipcRenderer.send(GO_BACK_CHANNEL);
  };

  const methods = useForm({ resolver: yupResolver(MachineSchema) });
  const {
    formState: { errors },
    handleSubmit,
    reset,
  } = methods;

  const changeMachineCodeMutation = useMutation({
    mutationKey: ["changeMachineCodeMutation"],
    mutationFn: changeMachineCodeAPI,
  });

  const { isPending } = changeMachineCodeMutation;

  const onSubmitChange = async (data: MachineCode) => {
    try {
      await changeMachineCodeMutation.mutateAsync(data, {
        onSuccess: () => {
          toast.success("Successfully");
          toast.onChange((payload) => {
            if (payload.status === "removed") {
              window.ipcRenderer.send(GO_BACK_CHANNEL);
            }
          });
          reset();
        },
      });
    } catch (error) {
      window.ipcRenderer.send(OPEN_ERROR_DIALOG_CHANNEL);
    }
  };

  return (
    <Container>
      <Button
        onClick={handleGoBack}
        variant='outline'
        className='absolute flex items-center justify-between top-5 left-5 max-h-9'
      >
        <ArrowLeft size={20} /> Quay về
      </Button>
      <h1 className='text-3xl font-bold text-primary'>Nhập mã cổng</h1>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmitChange)}
          className='flex items-baseline justify-center w-3/4 h-10 space-x-2'
        >
          <FormInput
            className='border-primary'
            name='code'
            autoFocus={true}
            placeholder='XXXX-XXXX-XXXX-XXXX'
          />
          <MyButton isLoading={isPending}>Đổi</MyButton>
        </form>
      </FormProvider>
      <MachineUpdateStatus isSuccess={false} />
    </Container>
  );
}
