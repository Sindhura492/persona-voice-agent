import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { IntroProvider } from "@/features/shared/IntroProvider";
import { LocaleProvider } from "@/features/locale/LocaleProvider";

export default function Home() {
  return (
    <LocaleProvider>
      <IntroProvider>
        <Header />
        <main className="flex min-h-[100svh] flex-col">
          <Hero />
        </main>
        <Footer />
      </IntroProvider>
    </LocaleProvider>
  );
}
