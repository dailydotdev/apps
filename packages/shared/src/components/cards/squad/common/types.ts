import type { Squad } from '../../../../graphql/sources';
import type { SourceCardBorderColor } from '../SquadGrid';
import type { Ad } from '../../../../graphql/posts';

export interface UnFeaturedSquadCardProps {
  source: Squad;
  className?: string;
  border?: SourceCardBorderColor;
  ad?: Ad;
}
