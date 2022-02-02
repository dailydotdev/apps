import classed from '../../../lib/classed';
import { Rank } from '../../../lib/rank';
import { LoggedUser } from '../../../lib/user';
import { ModalProps } from '../StyledModal';

export interface RanksModalProps extends ModalProps {
  rank: number;
  progress: number;
  hideProgress?: boolean;
  confirmationText?: string;
  reads: number;
  devCardLimit: number;
  onShowAccount?: () => void;
}
export type RanksBadgesProps = Pick<RanksModalProps, 'rank' | 'progress'>;
export interface Tag {
  title: string;
  count: number;
}
export interface RankBadgeItemProps {
  showRank: number;
  itemRank: Rank;
  progress: number;
}
export interface RanksTagsProps {
  tags: Tag[];
}
export interface RankTagProps {
  tag: Tag;
}
type DevCardFooterType = Pick<RanksModalProps, 'rank'>;
export interface DevCardFooterProps extends DevCardFooterType {
  user?: LoggedUser;
}
type IntroSectionType = Pick<RanksModalProps, 'onShowAccount'>;
export interface IntroSectionProps extends IntroSectionType {
  user?: LoggedUser;
}

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
  'grid grid-cols-2 grid-rows-4 grid-flow-col gap-4 mt-6',
);
export const RankTagPill = classed(
  'strong',
  'flex flex-shrink items-center px-3 ml-2 w-auto h-6 truncate bg-theme-float rounded-8 typo-callout text-theme-label-tertiary',
);
export const RankTag = classed('li', 'flex flex-row items-center');
