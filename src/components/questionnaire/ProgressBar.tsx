type Props = {
  current: number;
  total: number;
  label?: string;
};

export function ProgressBar({ current, total, label }: Props) {
  const pct = Math.round((current / total) * 100);
  const text =
    label ?? `Question ${current} of ${total}`;

  return (
    <div className="w-full" aria-label={text}>
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{text}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
