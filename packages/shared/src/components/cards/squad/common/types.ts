import type { Squad } from '../../../../graphql/sources';

type SquadCardActionType = 'link' | 'action';
export interface SquadCardAction {
  type: SquadCardActionType;
  text: string;
  href?: string;
  target?: string;
  onClick?: () => void;
}

export interface UnFeaturedSquadCardProps {
  source: Squad;
  className?: string;
}
