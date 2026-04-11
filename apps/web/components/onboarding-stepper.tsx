const STEPS = [
  { slug: "team", label: "Team" },
  { slug: "profile", label: "Profile" },
  { slug: "wallet", label: "Payout wallet" },
  { slug: "invite", label: "Invite team" },
] as const;

export function OnboardingStepper({ active }: { active: string }) {
  const activeIdx = STEPS.findIndex((s) => s.slug === active);
  return (
    <ol className="flex items-center gap-3 text-xs font-mono tracking-wide">
      {STEPS.map((s, i) => {
        const state =
          i < activeIdx ? "done" : i === activeIdx ? "active" : "todo";
        return (
          <li key={s.slug} className="flex items-center gap-2">
            <span
              aria-current={state === "active" ? "step" : undefined}
              className={
                state === "active"
                  ? "h-2 w-2 rounded-full bg-[#06d6a0]"
                  : state === "done"
                    ? "h-2 w-2 rounded-full bg-[#06d6a0]/50"
                    : "h-2 w-2 rounded-full bg-slate-700"
              }
            />
            <span
              className={
                state === "active"
                  ? "text-slate-100"
                  : state === "done"
                    ? "text-slate-400"
                    : "text-slate-600"
              }
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span className="text-slate-700">—</span>}
          </li>
        );
      })}
    </ol>
  );
}
