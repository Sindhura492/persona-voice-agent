import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

type ButtonBaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps & {
  href: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-ice text-white transition-colors duration-300 hover:bg-ice-soft",
  secondary:
    "border border-white/45 bg-white/10 text-white transition-colors duration-300 hover:bg-white/18",
  outline:
    "border border-stone bg-snow text-charcoal transition-colors duration-300 hover:bg-mist",
};

const BASE_CLASS =
  "inline-block px-2xl py-lg text-small font-medium uppercase tracking-[0.16em]";

export function Button(props: ButtonProps) {
  const variant = props.variant ?? "primary";
  const className = `${BASE_CLASS} ${VARIANT_CLASS[variant]} ${props.className ?? ""}`.trim();

  if (props.href !== undefined) {
    return (
      <a href={props.href} className={className}>
        {props.children}
      </a>
    );
  }

  const {
    children,
    variant: ignoredVariant,
    className: ignoredClassName,
    ...rest
  } = props;
  void ignoredVariant;
  void ignoredClassName;

  return (
    <button type={rest.type ?? "button"} className={className} {...rest}>
      {children}
    </button>
  );
}
