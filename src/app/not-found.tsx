import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import DateFooter from "@/widgets/footers/DateFooter";

export default function NotFoundPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-white text-black text-center px-4">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold tracking-tight">4 0 4</h1>

        <div className="flex justify-center gap-3 mt-6">
          <UniversalButton
            href="/"
            variant="primary"
            backgroundColor="#000"
            textColor="#fff"
            hoverBackgroundColor="#374151"
          >
            На главную
          </UniversalButton>
        </div>
      </div>

      <DateFooter />
    </section>
  );
}
