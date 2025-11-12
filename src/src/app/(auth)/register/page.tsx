import { RegisterForm } from "@/widgets/auth";
import AuthLayout from "@/shared/ui/layouts/AuthLayout";

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