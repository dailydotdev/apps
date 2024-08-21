import { ReactNode } from 'react';
import { Squad } from '../../../../graphql/sources';

type SquadCardActionType = 'link' | 'action';
export interface SquadCardAction {
  type: SquadCardActionType;
  text: string;
  href?: string;
  target?: string;
  onClick?: () => void;
}

export interface UnFeaturedSquadCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: SquadCardAction;
  description?: string;
  source?: Squad;
}
