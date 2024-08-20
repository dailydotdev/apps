import { ReactNode } from 'react';
import { Squad } from '../../graphql/sources';

type SourceCardActionType = 'link' | 'action';
export interface SourceCardAction {
  type: SourceCardActionType;
  text: string;
  href?: string;
  target?: string;
  onClick?: () => void;
}

export interface UnFeaturedSourceCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: SourceCardAction;
  description?: string;
  source?: Squad;
}
