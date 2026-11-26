import type { IntelCompetition } from '../../../../graphql/squadIntel';

export const competitionLabel: Record<IntelCompetition, string> = {
  open: 'Open',
  moderate: 'Moderate',
  crowded: 'Crowded',
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
