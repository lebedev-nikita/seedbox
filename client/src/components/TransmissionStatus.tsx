import clsx from "clsx";

type Props = {
  isLoading: boolean;
  running?: boolean;
  message?: string;
  className?: string;
};

export function TransmissionStatus({ isLoading, running, message, ...props }: Props) {
  const label =
    isLoading ? "Проверка Transmission..."
    : running ? "Transmission запущен"
    : "Transmission недоступен";

  return (
    <div
      className={clsx(
        props.className,
        "inline-flex items-center gap-2 rounded-md text-sm text-slate-700",
      )}
      title={!running && message ? message : undefined}
      aria-label={label}
    >
      <span
        className={clsx(
          "h-2.5 w-2.5 rounded-full",
          isLoading ? "bg-slate-300"
          : running ? "bg-teal-600"
          : "bg-rose-600",
        )}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}
