"use client";

import { useState } from "react";
import { submitRegisterAndLogin } from "@/entities/user";
import TextInput from "@/shared/ui/inputs/TextInput";
import { RegisterFormValues } from "@/entities/user";

export default function RegisterForm() {
  const [values, setValues] = useState<RegisterFormValues>({
    email: "",
    password: "",
    passwordConfirm: "",
    fullName: "",
    position: "",
    location: ""
  });
  const [error, setError] = useState("");

  const handleChange = (field: keyof RegisterFormValues, value: string | number) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const loginRes = await submitRegisterAndLogin(values);
      console.log("Access Token:", loginRes.jwtResponse?.accessToken);
      // Редирект происходит автоматически в submitRegisterAndLogin
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Серверная ошибка, попробуйте позже");
    }
  };

  return (
    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <TextInput type="email" placeholder="Email" value={values.email} onChange={v => handleChange("email", v)} />
      <TextInput type="text" placeholder="Полное имя" value={values.fullName} onChange={v => handleChange("fullName", v)} />
      <TextInput type="text" placeholder="Должность" value={values.position} onChange={v => handleChange("position", v)} />
      <TextInput type="password" placeholder="Пароль" value={values.password} onChange={v => handleChange("password", v)} />
      <TextInput type="password" placeholder="Повторите пароль" value={values.passwordConfirm} onChange={v => handleChange("passwordConfirm", v)} />

      <button type="submit" className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
        Зарегистрироваться
      </button>
    </form>
  );
}
