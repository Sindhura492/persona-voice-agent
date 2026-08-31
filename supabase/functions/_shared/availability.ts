import {
  PACKAGE_TYPES,
  type PackageType,
} from "./skiTypes.ts";

export type AvailabilityQuery = {
  package_type: PackageType;
  arrival_date: string;
  departure_date: string;
  lift_pass_included: boolean;
  lessons_included: boolean;
};

export type PackageOption = {
  package_type: PackageType;
  name: string;
  nights: number;
  rate_per_night: number;
  currency: "EUR";
  lift_pass_included: boolean;
  lessons_included: boolean;
  lift_pass_surcharge: number;
  lessons_surcharge: number;
  total: number;
  available: boolean;
  notes: string | null;
};

export type AvailabilityResult = {
  available: boolean;
  requested_package_type: PackageType;
  arrival_date: string;
  departure_date: string;
  nights: number;
  packages: PackageOption[];
};

const CATALOG: Record<
  PackageType,
  {
    name: string;
    rate_per_night: number;
    lift: number;
    lessons: number;
    includes: string[];
    best_for: string;
  }
> = {
  alpine_escape: {
    name: "Alpine Escape",
    rate_per_night: 420,
    lift: 85,
    lessons: 120,
    includes: [
      "Boutique mountain lodging",
      "Daily breakfast",
      "Ski locker access",
      "Concierge trip planning",
    ],
    best_for: "Couples and friends wanting a classic Snowveil stay",
  },
  summit_luxury: {
    name: "Summit Luxury Chalet",
    rate_per_night: 890,
    lift: 95,
    lessons: 150,
    includes: [
      "Private chalet lodging",
      "Premium breakfast and evening turn-down",
      "Heated gear atelier priority",
      "Dedicated concierge",
    ],
    best_for: "Guests seeking a private luxury mountain stay",
  },
  family_adventure: {
    name: "Family Adventure",
    rate_per_night: 560,
    lift: 70,
    lessons: 95,
    includes: [
      "Family suite lodging",
      "Kids breakfast options",
      "Family ski locker",
      "Lesson coordination for mixed levels",
    ],
    best_for: "Families with children or mixed ski levels",
  },
  day_pass: {
    name: "Day Pass Package",
    rate_per_night: 180,
    lift: 65,
    lessons: 110,
    includes: [
      "Single-day mountain access package",
      "Day locker",
      "Optional lift pass add-on",
      "Optional lesson add-on",
    ],
    best_for: "Guests wanting one day on the mountain without an overnight stay",
  },
};

export type PlanBrochurePackage = {
  package_type: PackageType;
  name: string;
  rate_per_night: number;
  currency: "EUR";
  lift_pass_per_night: number;
  lessons_per_night: number;
  includes: string[];
  best_for: string;
};

export function buildPlanCatalog(): PlanBrochurePackage[] {
  return (PACKAGE_TYPES as readonly PackageType[]).map((packageType) => {
    const item = CATALOG[packageType];
    return {
      package_type: packageType,
      name: item.name,
      rate_per_night: item.rate_per_night,
      currency: "EUR" as const,
      lift_pass_per_night: item.lift,
      lessons_per_night: item.lessons,
      includes: item.includes,
      best_for: item.best_for,
    };
  });
}

export function nightsBetween(arrival: string, departure: string): number {
  const start = new Date(`${arrival}T00:00:00.000Z`).getTime();
  const end = new Date(`${departure}T00:00:00.000Z`).getTime();
  return Math.round((end - start) / 86_400_000);
}

function isPeakWeekend(arrival: string): boolean {
  const date = new Date(`${arrival}T00:00:00.000Z`);
  const month = date.getUTCMonth();
  const day = date.getUTCDay();
  const isWinter = month === 11 || month <= 2;
  const isWeekend = day === 5 || day === 6 || day === 0;
  return isWinter && isWeekend;
}

function buildOption(
  packageType: PackageType,
  nights: number,
  liftPass: boolean,
  lessons: boolean,
  available: boolean,
  notes: string | null,
): PackageOption {
  const catalog = CATALOG[packageType];
  const liftSurcharge = liftPass ? catalog.lift * nights : 0;
  const lessonsSurcharge = lessons ? catalog.lessons * nights : 0;
  const lodging = catalog.rate_per_night * nights;

  return {
    package_type: packageType,
    name: catalog.name,
    nights,
    rate_per_night: catalog.rate_per_night,
    currency: "EUR",
    lift_pass_included: liftPass,
    lessons_included: lessons,
    lift_pass_surcharge: liftSurcharge,
    lessons_surcharge: lessonsSurcharge,
    total: lodging + liftSurcharge + lessonsSurcharge,
    available,
    notes,
  };
}

export function mockAvailability(query: AvailabilityQuery): AvailabilityResult {
  const nights = nightsBetween(query.arrival_date, query.departure_date);
  const peak = isPeakWeekend(query.arrival_date);
  const primaryAvailable = !peak || query.package_type !== "summit_luxury";

  const primaryNotes = peak && !primaryAvailable
    ? "Summit Luxury is waitlisted for peak weekends; alternatives below."
    : peak
    ? "Peak weekend, limited inventory."
    : null;

  const packages: PackageOption[] = [
    buildOption(
      query.package_type,
      nights,
      query.lift_pass_included,
      query.lessons_included,
      primaryAvailable,
      primaryNotes,
    ),
  ];

  const alternatives = (PACKAGE_TYPES as readonly PackageType[]).filter(
    (type) => type !== query.package_type,
  );

  for (const alt of alternatives.slice(0, 2)) {
    packages.push(
      buildOption(
        alt,
        nights,
        query.lift_pass_included,
        query.lessons_included,
        true,
        alt === "family_adventure"
          ? "Family-friendly alternative with kids' lesson slots."
          : null,
      ),
    );
  }

  return {
    available: packages.some((pkg) => pkg.available),
    requested_package_type: query.package_type,
    arrival_date: query.arrival_date,
    departure_date: query.departure_date,
    nights,
    packages,
  };
}
