import type { CmsDna, DnaResult } from "@/lib/dna/types";

export function DnaReportView({
  copy,
  result,
}: {
  copy: CmsDna;
  result: DnaResult;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        {copy.resultHeading}
      </p>
      <h1 className="mt-3 font-heading text-[clamp(2rem,6vw,3rem)]">
        {result.overall}
        <span className="text-lg text-[var(--muted)]"> / 100</span>
      </h1>
      <p className="mt-3 text-base leading-[1.7] text-[var(--muted)]">
        {result.summary}
      </p>
      <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
        Assigned: <strong>{result.coach.name}</strong>
        <span className="block text-[var(--muted)]">{result.coach.role}</span>
      </p>
      {result.primaryLeak ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          Primary leak:{" "}
          <strong className="text-[var(--fg)]">
            {result.primaryLeak.label} {result.primaryLeak.score}
          </strong>
        </p>
      ) : null}
      <div className="mt-6 space-y-4">
        {result.categories.map((cat) => (
          <div key={cat.id}>
            <div className="mb-1 flex justify-between text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              <span>{cat.label}</span>
              <span>{cat.score}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full bg-[var(--accent)]"
                style={{ width: `${cat.score}%` }}
              />
            </div>
            {cat.insight ? (
              <p className="mt-1.5 text-sm leading-[1.6] text-[var(--fg-soft)]">
                {cat.insight}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm font-medium text-[var(--fg)]">
        {result.nextStep}
      </p>
    </div>
  );
}
