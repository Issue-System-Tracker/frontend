import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import DateFooter from "@/widgets/footers/DateFooter";

export default function Home() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-white text-black text-center px-4">
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Issue Tracking System
        </h1>

        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Простая и гибкая система управления задачами.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <UniversalButton
            href="/login"
            variant="primary"
            backgroundColor="#000"
            textColor="#fff"
            hoverBackgroundColor="#374151"
            className="w-full sm:w-auto"
          >
            Войти
          </UniversalButton>
          <UniversalButton
            href="/register"
            variant="outline"
            backgroundColor="transparent"
            textColor="#000"
            borderColor="#000"
            hoverBackgroundColor="#00000010"
            className="w-full sm:w-auto"
          >
            Регистрация
          </UniversalButton>
        </div>
      </div>

      <DateFooter />
    </section>
  );
}