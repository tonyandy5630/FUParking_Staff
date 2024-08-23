import FormInput from "@components/Form/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { User, UserLogin } from "@my_types/auth";
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
import { ChangeEvent, useRef, useState } from "react";
import logo from "../assets/Bai_Logo.png";
import {
  GET_GATE_TYPE_CHANNEL,
  GET_NOT_FIRST_TIME_CHANNEL,
  LOGGED_IN,
  SET_NOT_FIRST_TIME_CHANNEL,
} from "@channels/index";

const IMG_SIZE = 170;
const GATE_IN = "IN";
const GATE_OUT = "OUT";

export default function Login(): JSX.Element {
  const methods = useForm({ resolver: yupResolver(UserSchema) });
  const { handleSubmit, reset } = methods;
  const [gate, setGate] = useState(GATE_IN);
  const navigate = useNavigate();
  const userNameFef = useRef<HTMLInputElement>(null);
  const pwdRef = useRef<HTMLInputElement>(null);

  const handleGateChange = (value: string) => {
    setGate(value);
  };

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
          window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, false);
          toast.onChange(async (payload) => {
            if (payload.status === "removed") {
              const notFirstTime = await window.ipcRenderer.invoke(
                GET_NOT_FIRST_TIME_CHANNEL
              );

              if (notFirstTime) {
                navigate(PAGE.SELECT_GATE_TYPE);
                return;
              }
              const systemGateType = await window.ipcRenderer.invoke(
                GET_GATE_TYPE_CHANNEL
              );
              if (systemGateType === "" || !systemGateType) {
                navigate(PAGE.SELECT_GATE_TYPE);
                return;
              }

              window.ipcRenderer.send(LOGGED_IN, true);
              if (systemGateType === GATE_IN) {
                // window.ipcRenderer.send(TO_CHECK_IN_CHANNEL);
                // navigate(PAGE.CHECK_IN);
                navigate(PAGE.CHECK_IN);
              } else {
                navigate(PAGE.CHECK_OUT);
              }
            }
          });
        },
      });
    } catch (error) {
      reset();
    }
  };

  return (
    <div className='flex flex-col items-center justify-center w-full h-full min-h-full'>
      <main className='flex flex-col items-center justify-between min-w-full gap-10 h-fit '>
        <div className='flex flex-col items-center justify-center'>
          <img src={logo} width={IMG_SIZE} height={IMG_SIZE} />
          <h1 className='text-4xl font-bold'>BAI Parking System</h1>
        </div>
        <div className='absolute top-3 right-5 border-primary h-44'>
          <Select onValueChange={handleGateChange} defaultValue={gate}>
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Chọn cổng' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={GATE_IN}>
                  <div className='flex items-center justify-around gap-x-3'>
                    <EnterIcon />
                    Cổng vào
                  </div>
                </SelectItem>
                <SelectItem value={GATE_OUT}>
                  <div className='flex items-center justify-around gap-x-3'>
                    <ExitIcon />
                    Cổng ra
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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
