import classed from '../../../../lib/classed';
import { BasePageContainer, pageBorders } from '../../../utilities';

export const WritePageContainer = classed(
  BasePageContainer,
  '!p-0 laptop:min-h-page h-full',
  pageBorders,
);

export const WritePageMain = classed('main', 'flex flex-col py-6 px-4');
