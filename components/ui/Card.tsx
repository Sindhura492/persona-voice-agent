import type { ElementType, HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "aside";
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

export function Card({
  children,
  className = "",
  as: Tag = "div",
  ...rest
}: CardProps) {
  const Component = Tag as ElementType;

  return (
    <Component
      className={`border border-stone bg-mist px-xl py-xl transition-colors duration-300 ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
}
