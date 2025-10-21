import AuthLayout from "@/shared/ui/layouts/AuthLayout";
import RegisterForm from "./ui/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Регистрация"
      form={<RegisterForm />}
      linkText="Уже есть аккаунт?"
      linkHref="/login"
    />
  );
}