import type { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';

export type CauseSelection = ReturnType<typeof useGivebackCauseSelection>;

// Step keys double as analytics labels and drive the progress dots. Kept tight
// so the funnel only highlights what matters: what it is, how it works, pick
// causes, and the impact, then straight into the campaign.
export const STEP_KEYS = ['intro', 'how', 'causes', 'impact'] as const;
export type StepKey = (typeof STEP_KEYS)[number];
