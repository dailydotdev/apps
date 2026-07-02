// Lightweight event bus so the QA panel can drive whichever gift entry is
// actually mounted (header on the old layout, rail on the new one) instead of
// carrying its own preview. Window events keep the panel decoupled from the
// entry's dock ref.
export const GIVEBACK_QA_EVENT = 'giveback:qa';

export type GivebackQaAction =
  | { type: 'pulse' }
  | { type: 'prompt'; index: number }
  | { type: 'reset' };

export const emitGivebackQa = (action: GivebackQaAction): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<GivebackQaAction>(GIVEBACK_QA_EVENT, { detail: action }),
  );
};
