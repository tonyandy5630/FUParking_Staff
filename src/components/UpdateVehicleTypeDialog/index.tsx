import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import React, { useMemo, useState } from "react";
import FormInput from "@components/Form/Input";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Button } from "@components/ui/button";
import FormItem from "@components/CameraSection/Form/FormItem";
import FormBox from "@components/CameraSection/Form/FormBox";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getVehicleTypesAPI, updateVehicleTypeAPI } from "@apis/vehicle.api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { UpdateVehicleTypeInfo } from "@my_types/check-in";
import toLocaleDate from "@utils/date";
import { yupResolver } from "@hookform/resolvers/yup";
import UpdateVehicleSchema, {
  UpdateVehicleSchemaType,
} from "@utils/schema/updateVehicleSchema";
import { toast } from "react-toastify";

const initalInfo: UpdateVehicleTypeInfo = {
  vehicleType: "",
  createDate: "",
  plateImage: "",
  plateNumber: "",
  statusVehicle: "",
};

type Props = {
  open: boolean;
  info?: UpdateVehicleTypeInfo;
  onOpenChange?: any;
};

export default function UpdateVehicleTypeDialog({
  open = false,
  info = initalInfo,
  onOpenChange,
}: Props) {
  const [message, setMessage] = useState("");
  const {
    plateImage: plateImg,
    plateNumber: plateText,
    statusVehicle: status,
    createDate: timeRegister,
    vehicleType,
  } = info;

  const methods = useForm({
    resolver: yupResolver(UpdateVehicleSchema),
    defaultValues: {
      plateNumber: plateText,
      vehicleType,
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
  } = methods;

  const updateVehicleTypeMutation = useMutation({
    mutationKey: ["update-vehicle-types"],
    mutationFn: updateVehicleTypeAPI,
  });

  const {
    data: vehicleTypesData,
    isLoading: isLoadingVehicleTypes,
    isSuccess: isSuccessVehicleTypes,
    isError: isErrorVehicleTypes,
  } = useQuery({
    queryKey: ["update-get-vehicle-type"],
    queryFn: getVehicleTypesAPI,
  });

  const handleVehicleTypeChange = (e: string) => {
    setValue("vehicleType", e);
  };

  const handleOpenChange = () => {
    onOpenChange();
  };

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

  console.log(errors);
  const handleUpdateVehicle = async (data: UpdateVehicleSchemaType) => {
    try {
      data.plateNumber = plateText;
      await updateVehicleTypeMutation.mutateAsync(data, {
        onSuccess: (res) => {
          setMessage("THAY ĐỔI THÀNH CÔNG");
          toast.success("THAY ĐỔI THÀNH CÔNG");
        },
      });
    } catch (error) {
      setMessage("THAY ĐỔI THÂT BẠI");
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='min-w-fit'>
        <DialogHeader>
          <DialogTitle>Xác nhận xe khách hàng</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <FormProvider {...methods}>
            <form
              className='grid items-center grid-cols-[repeat(2,1fr_400px)] gap-2'
              onSubmit={handleSubmit(handleUpdateVehicle)}
            >
              <FormItem>
                <FormBox title='Thời gian đăng kí'>
                  {toLocaleDate(new Date(timeRegister))}
                </FormBox>
              </FormItem>
              <FormItem className='row-span-4'>
                <img src={plateImg} className={`aspect-video`} />
              </FormItem>
              <FormItem>
                <Controller
                  name='vehicleType'
                  control={control}
                  render={(fields) => (
                    <Select
                      onValueChange={handleVehicleTypeChange}
                      defaultValue={vehicleType}
                      {...fields}
                    >
                      <SelectTrigger className='min-w-full'>
                        <SelectValue placeholder='Chọn loại xe' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>{vehicleTypesSelects}</SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormItem>
              <FormItem>
                <FormBox title='Trạng thái'>{status}</FormBox>
              </FormItem>
              <FormItem className='grid-cols-2 gap-4'>
                <Button
                  type='submit'
                  variant='destructive'
                  onClick={(e) => setValue("isAccept", false)}
                >
                  Từ chối
                </Button>
                <Button
                  type='submit'
                  onClick={(e) => setValue("isAccept", true)}
                >
                  Đồng ý
                </Button>
              </FormItem>
              <FormItem>
                <DialogFooter>
                  <p>
                    {updateVehicleTypeMutation.isPending
                      ? "Đang xác nhận"
                      : message}
                  </p>
                </DialogFooter>
              </FormItem>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
