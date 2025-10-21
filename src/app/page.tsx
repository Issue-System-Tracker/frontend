import Button from "@/shared/ui/Buttons/button";
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
          <Button
            text="Войти"
            href="/login"
            variant="primary"
            style={{ backgroundColor: "#000", color: "#fff" }}
            className="w-full sm:w-auto hover:bg-gray-800"
          />
          <Button
            text="Регистрация"
            href="/register"
            variant="secondary"
            style={{ borderColor: "#000", color: "#000", backgroundColor: "transparent" }}
            className="w-full sm:w-auto hover:bg-black/10"
          />
        </div>
      </div>

      <DateFooter />
    </section>
  );
}