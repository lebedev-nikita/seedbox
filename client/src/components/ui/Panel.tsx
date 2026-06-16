import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  className?: string;
  children?: ReactNode;
};

export default function Panel(props: Props) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-slate-200 bg-white shadow-[0_10px_24px_rgba(31,41,51,0.08)]",
        props.className,
      )}
    >
      {props.children}
    </section>
  );
}
