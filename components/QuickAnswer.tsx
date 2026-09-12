// The direct-answer block from the Architecture Plan (Section 14 / 9): one to
// three sentences, visually distinct, at the top of every intent page —
// written to be correct and specific, not to be "extraction bait" for an AI
// system (Phase 2 correction #2).
export function QuickAnswer({ children }: { children: React.ReactNode }) {
  return (
    <p className="quick-answer">
      <span className="quick-answer-label">Quick answer</span>
      {children}
    </p>
  );
}
