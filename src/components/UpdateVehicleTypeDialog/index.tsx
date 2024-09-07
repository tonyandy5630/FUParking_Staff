import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import React, { useMemo, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Button } from "@components/ui/button";

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
import { FormInfoRow } from "@components/CameraSection/Form";
import InfoSection, {
  InfoVehicle,
} from "@components/CameraSection/Form/InfoSection";
import Message from "@components/Message";
import { useHotkeys } from "react-hotkeys-hook";
import { CANCELED_HOTKEY } from "../../hotkeys/key";
import PAGE from "../../../url";
import { Label } from "@components/ui/label";
import { PENDING_VEHICLE } from "@constants/vehicle.const";
import { WAITING_APPROVAL } from "@constants/message.const";
import ConfirmDialog from "../../ConfirmDialog";

const initialInfo: UpdateVehicleTypeInfo = {
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

function UpdateVehicleTypeDialog({
  open = false,
  info = initialInfo,
  onOpenChange,
}: Props) {
  const [message, setMessage] = useState("");
  const rejectButtonRef = useRef<HTMLButtonElement>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const {
    plateImage: plateImg,
    plateNumber: plateText,
    statusVehicle: status,
    createDate: timeRegister,
    vehicleType,
  } = info;
  useHotkeys(
    CANCELED_HOTKEY.key,
    () => {
      onOpenChange();
    },
    {
      enableOnFormTags: ["INPUT", "SELECT"],
      scopes: [PAGE.VERIFY_VEHICLE],
    }
  );

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

  const handleOpenConfirmDialogChange = () => {
    setOpenConfirmDialog((prev) => !prev);
  };

  const handleVehicleTypeChange = (e: string) => {
    setValue("vehicleType", e);
  };

  const handleRejectVehicle = () => {
    setValue("isAccept", false);
    if (rejectButtonRef.current) {
      rejectButtonRef.current.click();
    }
  };

  const vehicleTypesSelects = useMemo(() => {
    const types = vehicleTypesData?.data.data;
    if (isSuccessVehicleTypes && types) {
      return types.map((item) => (
        <SelectItem key={item.id} value={item.id}>
          <div className='flex items-center justify-around gap-x-3'>
            {item.description}
          </div>
        </SelectItem>
      ));
    }
  }, [isSuccessVehicleTypes]);

  const handleUpdateVehicle = async (data: UpdateVehicleSchemaType) => {
    try {
      data.plateNumber = plateText;
      await updateVehicleTypeMutation.mutateAsync(data, {
        onSuccess: (res) => {
          setMessage("THAY ĐỔI THÀNH CÔNG");
          onOpenChange(); //* close the dialog
        },
      });
    } catch (error) {
      setMessage("THAY ĐỔI THẤT BẠI");
      console.log(error);
    }
  };

  return (
    <>
      {openConfirmDialog && (
        <ConfirmDialog
          onConfirmSubmit={handleRejectVehicle}
          open={openConfirmDialog}
          onOpenChange={handleOpenConfirmDialogChange}
          title='Từ chối xe khách hàng'
          text='Bấm xác nhận sẽ từ chối xe khách hàng'
        />
      )}
      <Dialog open={open} onOpenChange={handleOpenConfirmDialogChange}>
        <DialogContent className='min-w-fit'>
          <DialogHeader>
            <DialogTitle>Xác nhận xe khách hàng</DialogTitle>
          </DialogHeader>
          <div className='flex justify-center gap-4 py-4'>
            <FormProvider {...methods}>
              <form
                className='grid items-center justify-center gap-2'
                onSubmit={handleSubmit(handleUpdateVehicle)}
              >
                <FormInfoRow>
                  <InfoSection numberOfRow={5}>
                    <InfoVehicle label='Thời gian đăng kí'>
                      {toLocaleDate(timeRegister)}
                    </InfoVehicle>
                    <InfoVehicle label='Loại xe'>
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
                    </InfoVehicle>
                    <InfoVehicle label='Trạng thái'>
                      {status === PENDING_VEHICLE
                        ? WAITING_APPROVAL
                        : "Không hợp lệ"}
                    </InfoVehicle>
                    <div className='grid items-center justify-center border border-solid border-gray-50000'>
                      <DialogFooter className='flex justify-center w-full'>
                        <Message
                          error={updateVehicleTypeMutation.isError}
                          success={updateVehicleTypeMutation.isSuccess}
                          pending={updateVehicleTypeMutation.isPending}
                        >
                          {updateVehicleTypeMutation.isPending
                            ? "Đang xác nhận"
                            : message}
                        </Message>
                      </DialogFooter>
                    </div>
                    <Button
                      type='submit'
                      onClick={(e) => setValue("isAccept", true)}
                    >
                      Đồng ý
                    </Button>
                    <button
                      type='submit'
                      onClick={(e) => setValue("isAccept", false)}
                      ref={rejectButtonRef}
                    />
                  </InfoSection>
                  <div>
                    <Label>Hình ảnh xe đăng kí trên ứng dụng</Label>
                    <img src={plateImg} className={`aspect-video`} />
                  </div>
                </FormInfoRow>
              </form>
            </FormProvider>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default React.memo(UpdateVehicleTypeDialog);
