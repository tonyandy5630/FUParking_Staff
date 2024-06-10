import FormInput from "@components/Form/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { UserLogin } from "@my_types/auth";
import UserSchema from "@utils/schema/loginSchema";
import { FormProvider, useForm } from "react-hook-form";
import { loginAPI } from "@apis/auth.api";
import { toast } from "react-toastify";
import MyButton from "@components/Button";
import { TO_CHECK_IN_CHANNEL } from "@channels/index";

const IMG_SIZE = 170;

export default function Login(): JSX.Element {
  const methods = useForm({ resolver: yupResolver(UserSchema) });
  const { handleSubmit, reset } = methods;

  const loginMutation = useMutation({
    mutationKey: ["loginMutation"],
    mutationFn: loginAPI,
  });

  const { isPending } = loginMutation;

  const onSubmitLogin = async (data: UserLogin) => {
    try {
      await loginMutation.mutateAsync(data, {
        onSuccess: () => {
          toast.success("Login Successfully");
          toast.onChange((payload) => {
            if (payload.status === "removed")
              window.ipcRenderer.send(TO_CHECK_IN_CHANNEL);
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
          <img src='/Bai_Logo.png' width={IMG_SIZE} height={IMG_SIZE} />
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
