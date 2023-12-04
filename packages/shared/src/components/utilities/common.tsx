import React, {
  HTMLAttributes,
  ReactElement,
  ReactHTML,
  ReactNode,
} from 'react';
import classNames from 'classnames';
import classed, { ClassedHTML } from '../../lib/classed';
import styles from './utilities.module.css';
import ArrowIcon from '../icons/Arrow';

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

export const upvoteCommentEventName = (upvoted: boolean): string =>
  upvoted ? 'upvote comment' : 'remove comment upvote';

export const pageBorders =
  'laptop:border-r laptop:border-l border-theme-divider-tertiary';

const pagePaddings = 'px-4 tablet:px-8';
const basePageClassNames = classNames(
  styles.pageContainer,
  'relative flex flex-col w-full z-1',
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

const RawPageWidgets = classed(
  'aside',
  'flex flex-col gap-6 px-4 w-full max-w-full',
);

interface PageWidgetsProps {
  tablet?: boolean;
  laptop?: boolean;
  className?: string;
  children?: ReactNode;
}
export const PageWidgets = ({
  tablet = true,
  laptop = true,
  className,
  children,
}: PageWidgetsProps): ReactElement => (
  <RawPageWidgets
    className={classNames(
      className,
      tablet && 'tablet:w-[18.75rem] tablet:max-w-[18.75rem]',
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

export const FormErrorMessage = classed(
  'div',
  'mt-4 text-theme-status-error typo-caption1',
);

export const ActiveTabIndicator = classed(
  'div',
  'absolute inset-x-0 bottom-0 h-0.5 my-0 mx-auto bg-theme-label-primary',
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

export const customFeedIcon = 'text-2xl text-theme-label-tertiary mr-2';

export const Summary = classed('summary', 'cursor-pointer focus-outline');

export const SummaryArrow = classed(ArrowIcon, 'icon arrow ml-auto text-xl');

export const SummaryContainer = classed(
  'div',
  'text-theme-label-secondary multi-truncate border-l border-theme-status-cabbage pl-4',
);

export const TLDRText = classed(
  'span',
  'pr-1 font-bold text-theme-status-cabbage',
);

export const HotLabel = (): ReactElement => (
  <div className="py-px px-2 font-bold text-white uppercase rounded typo-caption2 bg-theme-status-error">
    Hot
  </div>
);

export const getTextEllipsis = <
  P extends HTMLAttributes<T>,
  T extends HTMLElement,
>(
  type: keyof ReactHTML = 'span',
): ClassedHTML<P, T> =>
  classed<P, T>(type, 'overflow-hidden whitespace-nowrap text-ellipsis');

export const SecondaryCenteredBodyText = classed(
  'p',
  'typo-body text-theme-label-secondary text-center',
);

export type HTMLElementComponent<T = HTMLElement> = React.FC<HTMLAttributes<T>>;

export enum SharedFeedPage {
  MyFeed = 'my-feed',
  Popular = 'popular',
  Search = 'search',
  Upvoted = 'upvoted',
  Discussed = 'discussed',
}

export const FeedHeading = classed(
  'h3',
  'flex flex-row flex-1 items-center typo-body font-bold',
);

export const getShouldRedirect = (
  isOnMyFeed: boolean,
  isLoggedIn: boolean,
): boolean => {
  if (!isOnMyFeed) {
    return false;
  }

  if (!isLoggedIn) {
    return true;
  }

  return false;
};

export const FlexRow = classed('span', 'flex flex-row');
export const FlexCol = classed('div', 'flex flex-col');
export const FlexCentered = classed('div', 'flex justify-center items-center');

interface ContextPosition {
  x: number;
  y: number;
}

export const getContextBottomPosition = (
  e: React.MouseEvent,
): ContextPosition => {
  const { right, bottom } = e.currentTarget.getBoundingClientRect();

  return { x: right, y: bottom + 4 };
};

export interface WithClassNameProps {
  className?: string;
}
