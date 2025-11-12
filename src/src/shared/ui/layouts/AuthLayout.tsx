import React, { ReactNode } from "react";
import AuthRiveAnimations from "@/shared/ui/rive/AuthRiveAnimations";

interface AuthLayoutProps {
  title: string;
  form: ReactNode;
  linkText: string;
  linkHref: string;
}

export default function AuthLayout({
  title,
  form,
  linkText,
  linkHref,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex-4 md:flex relative items-center justify-center bg-black overflow-hidden">
        <div className="relative z-10 w-[700px] h-[700px]">
          <AuthRiveAnimations width={700} height={700} />
        </div>
      </div>

      <div className="flex-3 flex flex-col justify-center items-center bg-white text-black px-8 w-full">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>

        {form}

        <p className="mt-4 text-gray-500 text-sm">
          {linkText}{" "}
          <a
            href={linkHref}
            className="text-black underline hover:text-gray-700 transition-colors"
          >
            {linkHref.includes("register") ? "Зарегистрироваться" : "Войти"}
          </a>
        </p>
      </div>
    </div>
  );
}
