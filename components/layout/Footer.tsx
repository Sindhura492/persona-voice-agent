import { RESORT_NAME } from "@/lib/resortBrand";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-snow px-lg py-lg text-center text-caption text-slate">
      © {year} {RESORT_NAME} · Boutique alpine concierge demo
    </footer>
  );
}
