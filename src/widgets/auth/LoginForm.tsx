"use client";

import { useState } from "react";
import { submitLogin } from "@/features/auth";
import TextInput from "@/shared/ui/inputs/TextInput";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Поля email и пароль обязательны");
      return;
    }

    try {
      await submitLogin({ email, password });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Серверная ошибка, попробуйте позже");
    }
  };

  return (
    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <TextInput type="email" placeholder="Email" value={email} onChange={value => setEmail(value as string)} />
      <TextInput type="password" placeholder="Пароль" value={password} onChange={value => setPassword(value as string)} />

      <button type="submit" className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
        Войти
      </button>
    </form>
  );
}
