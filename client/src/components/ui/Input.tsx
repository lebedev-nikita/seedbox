import clsx from "clsx";
import type { ComponentProps } from "react";

export function Input(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={clsx(
        props.className,
        "min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-800 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 disabled:cursor-not-allowed disabled:opacity-55",
      )}
    />
  );
}

export function Select(props: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={clsx(
        props.className,
        "min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-800 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 disabled:cursor-not-allowed disabled:opacity-55",
      )}
    />
  );
}
