type CapabilityIconName = "booking" | "gear" | "loyalty" | "safety";

type CapabilityIconProps = {
  name: CapabilityIconName;
};

const ICON_PATH: Record<CapabilityIconName, string> = {
  booking:
    "M7 4v2H5a2 2 0 0 0-2 2v11h18V8a2 2 0 0 0-2-2h-2V4H7zm2 2h6V4h-6v2z",
  gear: "M12 4l1.2 3h3.3l-2.7 2 1 3.3L12 10.8 9.2 12.3l1-3.3-2.7-2h3.3L12 4z",
  loyalty:
    "M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8L12 3z",
  safety:
    "M12 3l8 4v6c0 5-3.4 7.7-8 9-4.6-1.3-8-4-8-9V7l8-4zm0 2.2L6 7.5V13c0 3.6 2.4 5.6 6 6.7 3.6-1.1 6-3.1 6-6.7V7.5l-6-2.3z",
};

export function CapabilityIcon({ name }: CapabilityIconProps) {
  return (
    <span
      aria-hidden
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone bg-snow"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 fill-charcoal-muted"
        role="presentation"
      >
        <path d={ICON_PATH[name]} />
      </svg>
    </span>
  );
}

export type { CapabilityIconName };
