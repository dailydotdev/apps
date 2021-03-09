import React, { HTMLAttributes, ReactElement } from 'react';
import LazyImage from './LazyImage';
import classNames from 'classnames';
import classed from '../lib/classed';
import styles from '../styles/utilities.module.css';

export const RoundedImage = classed(LazyImage, 'w-10 h-10 rounded-full');

export const SmallRoundedImage = classed(LazyImage, 'w-6 h-6 rounded-full');

export const LegalNotice = classed(
  'div',
  'text-theme-label-quaternary text-center typo-caption1',
  styles.legal,
);

export const PageContainer = classed(
  'main',
  'relative flex flex-col w-full items-stretch pt-6 pb-16 px-4 z-1 mobileL:pb-6 tablet:px-8 tablet:self-center laptop:border-theme-divider-tertiary laptop:border-l laptop:border-r laptop:min-h-screen',
  styles.pageContainer,
);

export const FeedPage = classed(
  'main',
  'withNavBar flex flex-col items-start pb-3 px-6 laptop:px-16',
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

export const ElementPlaceholder = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement => (
  <div
    className={classNames(
      className,
      'element-placeholder relative overflow-hidden bg-theme-bg-secondary',
    )}
    {...props}
  >
    <div className="absolute top-0 left-0 w-full h-full" />
  </div>
);

export const CustomFeedHeader = classed(
  'div',
  'flex h-9 self-stretch items-center mb-3 text-theme-label-secondary typo-callout',
);

export const customFeedIcon = 'text-2xl text-theme-label-tertiary mr-2';
