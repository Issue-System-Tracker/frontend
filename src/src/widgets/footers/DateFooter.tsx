export default function DateFooter() {
  return (
    <footer className="absolute bottom-4 text-gray-500 text-xs">
      © {new Date().getFullYear()} Issue Tracking System
    </footer>
  );
}