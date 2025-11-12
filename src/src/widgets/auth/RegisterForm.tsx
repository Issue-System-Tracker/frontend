"use client";

import { useState } from "react";
import { submitRegisterAndLogin } from "@/features/auth";
import TextInput from "@/shared/ui/inputs/TextInput";
import { RegisterFormValues } from "@/entities/user";

export default function RegisterForm() {
  const [values, setValues] = useState<RegisterFormValues>({
    email: "",
    password: "",
    passwordConfirm: "",
    fullName: ""
  });
  const [error, setError] = useState("");

  const handleChange = (field: keyof RegisterFormValues, value: string | number) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await submitRegisterAndLogin(values);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Серверная ошибка, попробуйте позже");
    }
  };

  return (
    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <TextInput 
        type="email" 
        placeholder="Email" 
        value={values.email} 
        onChange={v => handleChange("email", v)} 
        required
      />
      <TextInput 
        type="text" 
        placeholder="Полное имя" 
        value={values.fullName} 
        onChange={v => handleChange("fullName", v)} 
        required
      />
      <TextInput 
        type="password" 
        placeholder="Пароль" 
        value={values.password} 
        onChange={v => handleChange("password", v)} 
        required
        minLength={6}
      />
      <TextInput 
        type="password" 
        placeholder="Повторите пароль" 
        value={values.passwordConfirm} 
        onChange={v => handleChange("passwordConfirm", v)} 
        required
        minLength={6}
      />

      <button type="submit" className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
        Зарегистрироваться
      </button>
    </form>
  );
}
