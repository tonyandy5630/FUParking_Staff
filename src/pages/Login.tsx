import FormInput from "@components/Form/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { UserLogin } from "@my_types/auth";
import UserSchema from "@utils/schema/loginSchema";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { loginAPI } from "@apis/auth.api";
import { toast } from "react-toastify";
import MyButton from "@components/Button";
import Container from "@components/Layout/container";

const IMG_SIZE = 170;

export default function Login(): JSX.Element {
  const methods = useForm({ resolver: yupResolver(UserSchema) });
  const {
    formState: { errors },
    handleSubmit,
    reset,
  } = methods;

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
        },
      });
    } catch (error) {
      reset();
    }
  };
  return (
    <Container>
      <img src='/Bai_Logo.png' width={IMG_SIZE} height={IMG_SIZE} />
      <h1 className='text-4xl font-bold'>BAI Parking System</h1>
      <FormProvider {...methods}>
        <form
          className='flex flex-col min-w-64 gap-y-3'
          onSubmit={handleSubmit(onSubmitLogin)}
        >
          <FormInput
            name='email'
            placeholder='Nhập email'
            autoFocus={true}
            className='min-w-full'
          />
          <FormInput
            name='password'
            type='password'
            placeholder='Nhập mật khẩu'
            className='min-w-full'
          />
          <MyButton isLoading={isPending}>Đăng nhập</MyButton>
        </form>
      </FormProvider>
    </Container>
  );
}
