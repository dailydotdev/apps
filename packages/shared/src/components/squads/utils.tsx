import classed from '../../lib/classed';
import { BasePageContainer, pageBorders } from '../utilities';

export const SquadTitle = classed(
  'h3',
  'text-center typo-large-title font-bold',
);
export const SquadSubTitle = classed(
  'p',
  'text-center typo-title3 text-theme-label-tertiary',
);
export const SquadTitleColor = classed('span', 'text-brand-default');

export const ManageSquadPageContainer = classed(
  BasePageContainer,
  '!p-0 laptop:min-h-page h-full !max-w-[42.5rem] !w-full',
  pageBorders,
);

export const ManageSquadPageMain = classed('div', 'flex flex-1 flex-col');

export const ManageSquadPageFooter = classed(
  'footer',
  'flex sticky flex-row gap-3 items-center py-4 px-6 h-16 border-t border-theme-divider-tertiary',
);

export const ManageSquadPageHeader = classed(
  'header',
  'flex sticky flex-row gap-3 items-center py-4 px-6 h-16 border-b border-theme-divider-tertiary',
);
