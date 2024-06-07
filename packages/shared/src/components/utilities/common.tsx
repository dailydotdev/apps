import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import styles from './utilities.module.css';
import { ArrowIcon } from '../icons';

export enum Theme {
  Avocado = 'avocado',
  Bacon = 'bacon',
  BlueCheese = 'blue-cheese',
  Bun = 'bun',
  Burger = 'burger',
  Cabbage = 'cabbage',
  Cheese = 'cheese',
  Ketchup = 'ketchup',
  Lettuce = 'lettuce',
}

export enum Justify {
  End = 'justify-end',
  Center = 'justify-center',
  Between = 'justify-between',
  Start = 'justify-start',
}

export const pageBorders =
  'laptop:border-r laptop:border-l border-border-subtlest-tertiary';

const pagePaddings = 'px-4 tablet:px-8';
const basePageClassNames = classNames(
  styles.pageContainer,
  'relative z-1 flex w-full flex-col',
);

export const BasePageContainer = classed(
  'main',
  pagePaddings,
  basePageClassNames,
);

export const pageContainerClassNames = classNames(
  basePageClassNames,
  'items-stretch tablet:self-center laptop:min-h-page',
);

export const PageContainerCentered = classed(
  BasePageContainer,
  'min-h-page justify-center items-center',
);

export const PageContainer = classed(
  BasePageContainer,
  pagePaddings,
  pageContainerClassNames,
);

export const truncateTextClassNames = 'max-w-full shrink truncate';
export const TruncateText = classed('span', truncateTextClassNames);

const RawPageWidgets = classed(
  'aside',
  'flex flex-col gap-6 px-4 w-full max-w-full',
);

interface PageWidgetsProps {
  laptop?: boolean;
  className?: string;
  children?: ReactNode;
}
export const PageWidgets = ({
  laptop = true,
  className,
  children,
}: PageWidgetsProps): ReactElement => (
  <RawPageWidgets
    className={classNames(
      className,
      laptop && 'laptop:w-[21.25rem] laptop:max-w-[21.25rem]',
    )}
  >
    {children}
  </RawPageWidgets>
);

export const ResponsivePageContainer = classed(
  PageContainer,
  pageBorders,
  'py-6 laptop:min-h-screen',
);

export const BaseFeedPage = classed(
  'main',
  'flex flex-col flex-1 items-start max-w-full pb-16',
  styles.feedPage,
);

export const FeedPage = classed(
  BaseFeedPage,
  'pt-10 px-6 laptop:px-16',
  styles.feedPage,
);
export const FeedPageLayoutList = classed(
  BasePageContainer,
  pageContainerClassNames,
  'pt-10 !ml-auto !px-0 tablet:!max-w-full laptop:!w-full laptop:!max-w-[42.5rem]',
  styles.feedPage,
);

export const FeedPageLayoutMobile = classed(
  FeedPageLayoutList,
  'laptop:!max-w-full',
);

export const CommentFeedPage = classed(BasePageContainer, '!px-0 !mx-auto');

export const FormErrorMessage = classed(
  'div',
  'mt-4 text-status-error typo-caption1',
);

export const ActiveTabIndicator = classed(
  'div',
  'absolute inset-x-0 bottom-0 h-0.5 my-0 mx-auto bg-text-primary',
  styles.activeTabIndicator,
);

export const CustomFeedHeader = classed(
  'div',
  'flex h-11 self-stretch items-center mb-6 typo-callout',
);

export const FeedPageHeader = classed(
  'header',
  'overflow-x-auto self-stretch mb-6 no-scrollbar hidden laptop:flex',
);

export const Summary = classed('summary', 'cursor-pointer focus-outline');

export const SummaryArrow = classed(ArrowIcon, 'icon arrow ml-auto text-xl');

export const SummaryContainer = classed(
  'div',
  'text-text-secondary multi-truncate border-l border-accent-cabbage-default pl-4',
);

export const TLDRText = classed(
  'span',
  'pr-1 font-bold text-accent-cabbage-default',
);

export const HotLabel = (): ReactElement => (
  <div className="rounded-4 bg-status-error px-2 py-px font-bold uppercase text-white typo-caption2">
    Hot
  </div>
);

export const SecondaryCenteredBodyText = classed(
  'p',
  'typo-body text-text-secondary text-center',
);

export type HTMLElementComponent<T = HTMLElement> = React.FC<HTMLAttributes<T>>;

export enum SharedFeedPage {
  MyFeed = 'my-feed',
  Popular = 'popular',
  Search = 'search',
  Upvoted = 'upvoted',
  Discussed = 'discussed',
  Custom = 'custom',
  CustomForm = 'custom-form',
}

export const getShouldRedirect = (
  isOnMyFeed: boolean,
  isLoggedIn: boolean,
): boolean => {
  if (!isOnMyFeed) {
    return false;
  }

  return !isLoggedIn;
};

export const FlexRow = classed('span', 'flex flex-row');
export const FlexCol = classed('div', 'flex flex-col');
export const FlexCentered = classed('div', 'flex justify-center items-center');

export interface WithClassNameProps {
  className?: string;
}

export const formatReadTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0
    ? `${hours.toString()}h ${remainingMinutes.toString()}m`
    : `${remainingMinutes.toString()}m`;
};

export const lazyCommentThreshold = 5;

export const PageInfoHeader = classed(
  'div',
  'mb-10 flex w-full flex-col gap-5 rounded-16 border border-border-subtlest-tertiary p-4',
);
