import Button from "@/shared/ui/Buttons/button";
import DateFooter from "@/widgets/footers/DateFooter";

export default function NotFoundPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-white text-black text-center px-4">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold tracking-tight">4 0 4</h1>

        <div className="flex justify-center gap-3 mt-6">
          <Button
            text="На главную"
            href="/"
            variant="primary"
            style={{ backgroundColor: "#000", color: "#fff" }}
            className="hover:bg-gray-800"
          />
        </div>
      </div>

      <DateFooter />
    </section>
  );
}
