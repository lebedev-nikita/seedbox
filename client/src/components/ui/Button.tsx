import clsx from "clsx";
import type { ComponentProps } from "react";

type ButtonVariant = "default" | "primary" | "danger";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: ButtonVariant;
};

const baseClass =
  "inline-flex cursor-pointer items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-55";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "min-h-9 border-slate-300 bg-white px-3 text-sm text-slate-800 no-underline hover:border-teal-700",
  primary: "min-h-10 border-teal-700 bg-teal-700 px-4 text-white hover:bg-teal-800",
  danger:
    "min-h-8 border-red-200 bg-red-50 px-3 text-sm text-red-700 hover:border-red-500",
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(baseClass, variantClasses[variant], className)}
    />
  );
}

export function ButtonLink({ className, variant = "default", ...props }: ButtonLinkProps) {
  return (
    <a
      {...props}
      className={clsx(baseClass, variantClasses[variant], className)}
    />
  );
}
