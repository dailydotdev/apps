import classed from '../../../../lib/classed';
import { BasePageContainer, pageBorders } from '../../../utilities';

export const WritePageContainer = classed(
  BasePageContainer,
  '!p-0 laptop:min-h-page h-full !max-w-[100vw] laptop:!max-w-[42.5rem]',
  pageBorders,
);

export const WritePageMain = classed('form', 'flex flex-col');
