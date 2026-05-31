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

/**
 * A polished conversion banner woven into the "Keep reading" feed — the
 * proven side-by-side headline + inline signup, with messaging made relevant
 * by the reader's topics. Converts in the flow of content instead of as an
 * interruptive bottom strip.
 */
export const FeedConversionBanner = ({
  tags,
}: FeedConversionBannerProps): ReactElement => {
  const topicList = tags.slice(0, 3).map(capitalize).join(', ');

  return (
    <div
      className={classNames(
        authGradientBg,
        'relative my-2 flex flex-col gap-5 overflow-hidden rounded-16 border border-accent-cabbage-default p-6 shadow-2 tablet:flex-row tablet:items-center tablet:gap-8',
      )}
    >
      <div className="flex flex-1 flex-col gap-2">
        <Typography
          bold
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          className={onboardingGradientClasses}
        >
          Stop scrolling random feeds
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          {topicList
            ? `Get a personalized stream of ${topicList} and the best dev content — built around what you actually read.`
            : 'Get a personalized stream of the best dev content — built around what you actually read.'}
        </Typography>
      </div>
      <div className="w-full tablet:max-w-[22rem]">
        <BuildFeedAuthOptions tags={tags} origin="feed" />
      </div>
    </div>
  );
};
