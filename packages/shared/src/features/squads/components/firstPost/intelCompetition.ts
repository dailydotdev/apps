import type { IntelCompetition } from '../../../../graphql/squadIntel';

/** Fewest competing posts first */
export const intelCompetitions: IntelCompetition[] = [
  'open',
  'moderate',
  'crowded',
];

export const competitionLabel: Record<IntelCompetition, string> = {
  open: 'Open',
  moderate: 'Moderate',
  crowded: 'Crowded',
};

export const competitionHint: Record<IntelCompetition, string> = {
  open: 'Few new posts compete',
  moderate: 'Some new posts compete',
  crowded: 'Many new posts compete',
};

// Green is where to write, red is where a new post gets lost
export const competitionFillClassName: Record<IntelCompetition, string> = {
  open: 'bg-accent-avocado-default',
  moderate: 'bg-accent-cheese-default',
  crowded: 'bg-accent-ketchup-default',
};

export const competitionChipClassName: Record<IntelCompetition, string> = {
  open: 'bg-overlay-float-avocado text-accent-avocado-default',
  moderate: 'bg-overlay-float-cheese text-accent-cheese-default',
  crowded: 'bg-overlay-float-ketchup text-accent-ketchup-default',
};
