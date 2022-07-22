import { TopTags, Tag } from '../../../hooks/useReadingRank';
import classed from '../../../lib/classed';
import { Rank } from '../../../lib/rank';
import { LoggedUser } from '../../../lib/user';
import { ModalProps } from '../StyledModal';

export interface RanksModalProps extends ModalProps {
  previousRank?: number;
  nextRank?: number;
  rank: number;
  progress: number;
  tags: TopTags;
  hideProgress?: boolean;
  confirmationText?: string;
}
export type RanksBadgesProps = Pick<
  RanksModalProps,
  'rank' | 'progress' | 'previousRank' | 'nextRank'
>;

export interface RankBadgeItemProps {
  showRank: number;
  itemRank: Rank;
  progress: number;
  previousRank?: number;
}
export interface RanksTagsProps {
  tags: Tag[];
  limit?: number;
  isColorPrimary?: boolean;
}
export interface RankTagProps {
  tag?: Tag;
  isColorPrimary?: boolean;
}
type DevCardFooterType = Pick<RanksModalProps, 'rank'>;
export interface DevCardFooterProps extends DevCardFooterType {
  user?: LoggedUser;
  isLocked?: boolean;
}
export type DevCardTextProps = Pick<DevCardFooterProps, 'user' | 'isLocked'>;

/** Rank badge */
export const RanksBadgesList = classed('ul', 'flex flex-nowrap');
export const RanksBadgesSection = classed('section', 'overflow-hidden');
export const RankBadge = classed(
  'li',
  'flex relative flex-col justify-center items-center w-1/4',
);
export const RankBadgeLine = classed(
  'div',
  'absolute w-3/4 h-px  top-[35%] left-[60%]',
);
export const RankBadgeContainer = classed(
  'div',
  'flex justify-center items-center relative bg-theme-bg-tertiary',
);
export const RankBadgeName = classed('strong', 'mt-2');

/** Rank tag */
export const RanksTagsSection = classed(
  'section',
  'p-4 m-4 mb-4 rounded-16 border bg-theme-bg-secondary border-theme-divider-tertiary',
);
export const RanksTagsList = classed(
  'ul',
  'grid grid-flow-col grid-rows-3 gap-4 mt-6',
);
export const RankTagPill = classed(
  'strong',
  'flex items-center px-3 ml-2 h-6 truncate rounded-8 typo-callout text-theme-label-tertiary',
);
export const RankTag = classed('li', 'flex flex-row items-center');
