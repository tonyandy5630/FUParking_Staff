import { demoAPI } from "@apis/auth.api";
import FormInput from "@components/Form/Input";
import { Button } from "@components/ui/button";
import { yupResolver } from "@hookform/resolvers/yup";
import UserSchema from "@utils/schema/loginSchema";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

const IMG_SIZE = 150;

export default function Login(): JSX.Element {
  const methods = useForm({ resolver: yupResolver(UserSchema) });
  const {} = methods;
  return (
    <div className='flex flex-col items-center justify-center w-full min-h-full p-5'>
      <div className='flex flex-col items-center h-full min-w-full gap-10 justify-evenly'>
        <img
          src='../../public/Bai_Logo.png'
          width={IMG_SIZE}
          height={IMG_SIZE}
        />
        <h1 className='text-4xl font-bold'>BAI Parking System</h1>
        <FormProvider {...methods}>
          <form className='flex flex-col min-w-64 gap-y-3'>
            <FormInput
              name='email'
              placeholder='Nhập email'
              autofocus={true}
              className='min-w-full'
            />
            <FormInput
              name='password'
              placeholder='Nhập mật khẩu'
              className='min-w-full'
            />
            <Button>Đăng nhập</Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
