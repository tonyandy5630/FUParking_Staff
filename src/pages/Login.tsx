import FormInput from "@components/Form/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { UserLogin } from "@my_types/auth";
import UserSchema from "@utils/schema/loginSchema";
import { FormProvider, useForm } from "react-hook-form";
import { loginAPI } from "@apis/auth.api";
import { toast } from "react-toastify";
import MyButton from "@components/Button";
import { EnterIcon, ExitIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import PAGE from "../../url";
import { setTokenToLS } from "@utils/localStorage";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useState } from "react";
import logo from "../assets/Bai_Logo.png";
import {
  GET_GATE_ID_CHANNEL,
  GET_NOT_FIRST_TIME_CHANNEL,
  LOGGED_IN,
} from "@channels/index";
import { AxiosError, HttpStatusCode } from "axios";
import { GATE_IN, GATE_OUT } from "@constants/gate.const";

const IMG_SIZE = 170;

export default function Login(): JSX.Element {
  const methods = useForm({
    resolver: yupResolver(UserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    setFocus,
  } = methods;
  const [gate, setGate] = useState(GATE_IN);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationKey: ["loginMutation"],
    mutationFn: loginAPI,
  });

  const { isPending } = loginMutation;

  const onSubmitLogin = async (data: UserLogin) => {
    try {
      await loginMutation.mutateAsync(data, {
        onSuccess: async (res) => {
          setTokenToLS(res.data.data?.bearerToken ?? "");
          toast.success("Login Successfully", {
            toastId: "LOGIN_TOAST",
          });
          toast.onChange(async (payload) => {
            if (payload.status === "removed") {
              window.ipcRenderer.send(LOGGED_IN, true);
              const notFirstTime = await window.ipcRenderer.invoke(
                GET_NOT_FIRST_TIME_CHANNEL
              );

              if (!notFirstTime) {
                navigate(PAGE.SELECT_GATE_TYPE);
                return;
              }

              //* handle not select gate
              const gate = await window.ipcRenderer.invoke(GET_GATE_ID_CHANNEL);
              if (gate === "" || !gate) {
                navigate(PAGE.SELECT_GATE_TYPE);
                return;
              }

              if (gate) {
                navigate(PAGE.GATE);
              }
            }
          });
        },
      });
    } catch (err: any) {
      const error = err as AxiosError;
      if (error.response?.status === HttpStatusCode.Unauthorized) {
        setError("email", {
          type: "custom",
          message: "Sai mật khẩu hoặc tài khoản",
        });
        setFocus("email");
      }
      reset({}, { keepErrors: true });
    }
  };

  return (
    <div className='flex flex-col items-center justify-center w-full h-full min-h-full'>
      <main className='flex flex-col items-center justify-between min-w-full gap-10 h-fit '>
        <div className='flex flex-col items-center justify-center'>
          <img src={logo} width={IMG_SIZE} height={IMG_SIZE} />
          <h1 className='text-4xl font-bold'>BAI Parking System</h1>
        </div>
        <FormProvider {...methods}>
          <form
            className='flex flex-col min-w-64 gap-y-3'
            onSubmit={handleSubmit(onSubmitLogin)}
          >
            <FormInput
              name='email'
              placeholder='Nhập email'
              autoFocus={true}
              className='h-10 min-w-full'
            />
            <FormInput
              name='password'
              type='password'
              placeholder='Nhập mật khẩu'
              className='h-10 min-w-full'
            />
            <MyButton isLoading={isPending}>Đăng nhập</MyButton>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
