import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { capitalize } from '../../lib/strings';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { onboardingGradientClasses } from '../../components/onboarding/common';
import { authGradientBg } from '../../components/marketing/banners/common';
import { BuildFeedAuthOptions } from './BuildFeedAuthOptions';

interface FeedConversionBannerProps {
  tags: string[];
}

const borderGradient: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, var(--theme-accent-cabbage-default), var(--theme-accent-onion-default), var(--theme-accent-water-default), var(--theme-accent-cabbage-default))',
  backgroundSize: '200% 100%',
  animation: 'bf-border-shift 6s linear infinite',
};

/**
 * A bold conversion banner woven into the "Keep reading" feed — animated
 * gradient frame, big headline, and inline one-tap signup, with messaging made
 * relevant by the reader's topics. Converts in the flow of discovery.
 */
export const FeedConversionBanner = ({
  tags,
}: FeedConversionBannerProps): ReactElement => {
  const topicList = tags.slice(0, 3).map(capitalize).join(', ');

  return (
    <div className="rounded-[17px] p-px shadow-2" style={borderGradient}>
      <style>
        {`@keyframes bf-border-shift { to { background-position: 200% center; } }`}
      </style>
      <div
        className={classNames(
          authGradientBg,
          'flex flex-col gap-5 rounded-16 p-6 tablet:flex-row tablet:items-center tablet:gap-8',
        )}
      >
        <div className="flex flex-1 flex-col gap-2">
          <Typography
            bold
            tag={TypographyTag.H2}
            type={TypographyType.Title1}
            className={onboardingGradientClasses}
          >
            Stop scrolling random feeds
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
          >
            {topicList
              ? `Your own stream of ${topicList} and the best dev content — built around what you actually read. Free, forever.`
              : 'Your own stream of the best dev content — built around what you actually read. Free, forever.'}
          </Typography>
        </div>
        <div className="w-full tablet:max-w-[22rem]">
          <BuildFeedAuthOptions tags={tags} origin="feed" />
        </div>
      </div>
    </div>
  );
};
