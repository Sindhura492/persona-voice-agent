import { QaSummary } from "@/features/qa/QaSummary";

export const dynamic = "force-dynamic";

type QaPageProps = {
  searchParams: {
    key?: string;
  };
};

function isAuthorized(key: string | undefined): boolean {
  const expected = process.env.QA_ACCESS_KEY?.trim();
  if (!expected) {
    return false;
  }
  return key === expected;
}

export default function QaPage({ searchParams }: QaPageProps) {
  if (!isAuthorized(searchParams.key)) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-snow px-lg">
        <p className="text-small text-charcoal-muted">Unauthorized</p>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-mist">
      <QaSummary />
    </main>
  );
}
