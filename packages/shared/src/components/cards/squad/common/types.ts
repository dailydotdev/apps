import type { Squad } from '../../../../graphql/sources';
import type { SourceCardBorderColor } from '../SquadGrid';

export interface UnFeaturedSquadCardProps {
  source: Squad;
  className?: string;
  campaignId?: string;
  border?: SourceCardBorderColor;
}
