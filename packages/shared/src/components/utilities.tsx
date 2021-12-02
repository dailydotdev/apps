import { LazyImage } from './LazyImage';
import classed from '../lib/classed';
import styles from './utilities.module.css';
import ArrowIcon from '../../icons/arrow.svg';

export const RoundedImage = classed(LazyImage, 'w-10 h-10 rounded-full');

export const SmallRoundedImage = classed(LazyImage, 'w-6 h-6 rounded-full');

export const LegalNotice = classed(
  'div',
  'text-theme-label-quaternary text-center typo-caption1',
  styles.legal,
);

export const PageContainer = classed(
  'main',
  styles.pageContainer,
  'relative flex flex-col w-full items-stretch px-4 z-1 tablet:px-8 tablet:self-center',
);

export const NoPaddingPageContainer = classed(
  'main',
  styles.pageContainer,
  'relative flex flex-col w-full items-stretch z-1 tablet:self-center',
);

export const ResponsivePageContainer = classed(
  PageContainer,
  'py-6 laptop:border-theme-divider-tertiary laptop:border-l laptop:border-r laptop:min-h-screen',
);

export const ResponsiveNoPaddingPageContainer = classed(
  NoPaddingPageContainer,
  'py-6 laptop:border-theme-divider-tertiary laptop:border-l laptop:border-r laptop:min-h-screen',
);

export const FeedPage = classed(
  'main',
  'withNavBar flex flex-col flex-1 items-start pb-3 px-6 laptop:px-16 pt-10',
  styles.feedPage,
);

export const FormErrorMessage = classed(
  'div',
  'mt-4 text-theme-status-error typo-caption1',
);

export const ProfileHeading = classed('h1', 'm-0 self-start typo-title2');

export const ActiveTabIndicator = classed(
  'div',
  'absolute inset-x-0 bottom-0 h-0.5 my-0 mx-auto bg-theme-label-primary',
  styles.activeTabIndicator,
);

export const CustomFeedHeader = classed(
  'div',
  'flex h-11 self-stretch items-center mb-6 text-theme-label-secondary typo-callout',
);

export const customFeedIcon = 'text-2xl text-theme-label-tertiary mr-2';

export const Summary = classed('summary', 'cursor-pointer focus-outline');

export const SummaryArrow = classed(ArrowIcon, 'icon arrow ml-auto text-xl');
