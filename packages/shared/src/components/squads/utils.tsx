import classed from '../../lib/classed';
import { BasePageContainer, pageBorders } from '../utilities';

export const SquadTitle = classed(
  'h1',
  'text-center typo-large-title font-bold',
);
export const SquadSubTitle = classed(
  'p',
  'text-center typo-title3 text-text-tertiary',
);
export const SquadTitleColor = classed('span', 'text-brand-default');

export const ManageSquadPageContainer = classed(
  BasePageContainer,
  '!p-0 laptop:min-h-page h-full !max-w-[42.5rem] !w-full',
  pageBorders,
);

export const ManageSquadPageMain = classed('div', 'flex flex-1 flex-col');
