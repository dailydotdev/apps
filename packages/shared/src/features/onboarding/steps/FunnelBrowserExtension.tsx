import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { FunnelStepBrowserExtension } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { useLogContext } from '../../../contexts/LogContext';
import { useOnboardingExtension } from '../../../components/onboarding/Extension/useOnboardingExtension';
import { BrowserName } from '../../../lib/func';
import { cloudinaryOnboardingExtension } from '../../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { Button } from '../../../components/buttons/Button';
import { downloadBrowserExtension } from '../../../lib/constants';
import { ChromeIcon, EdgeIcon } from '../../../components/icons';
import { LogEvent, TargetType } from '../../../lib/log';
import { anchorDefaultRel } from '../../../lib/strings';
import { ButtonVariant } from '../../../components/buttons/common';
import { FunnelTargetId } from '../types/funnelEvents';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { sanitizeMessage } from '../lib/utils';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import { PlusTrustReviews } from '../../../components/plus/PlusTrustReviews';

const BrowserExtension = ({
  parameters: {
    headline,
    explainer,
    cta,
    skip,
    showReviews: showReviewsParam,
    image,
  },
  onTransition,
}: FunnelStepBrowserExtension): ReactElement => {
  const { logEvent } = useLogContext();
  const { browserName } = useOnboardingExtension();
  const isEdge = browserName === BrowserName.Edge;
  const browserLabel = isEdge ? 'Edge' : 'Chrome';
  const ctaText = cta.replace('{browser}', browserLabel);
  const imageOverride = isEdge ? image?.edge : image?.chrome;
  const imageUrls =
    imageOverride ??
    cloudinaryOnboardingExtension[
      browserName as keyof typeof cloudinaryOnboardingExtension
    ];
  const showReviews = showReviewsParam && !isEdge;

  return (
    <div className="mt-10 flex flex-1 flex-col laptop:justify-between">
      <div className="mb-14 flex flex-col items-center gap-6 justify-self-start text-center">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
          className="!px-0"
          dangerouslySetInnerHTML={{
            __html: sanitizeMessage(headline),
          }}
        />
        <Typography
          className="w-2/3 text-balance text-text-tertiary typo-body"
          color={TypographyColor.Secondary}
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          dangerouslySetInnerHTML={{
            __html: sanitizeMessage(explainer),
          }}
        />
        <Button
          href={downloadBrowserExtension}
          icon={isEdge ? <EdgeIcon aria-hidden /> : <ChromeIcon aria-hidden />}
          data-funnel-track={FunnelTargetId.DownloadExtension}
          onClick={() => {
            logEvent({
              event_name: LogEvent.DownloadExtension,
              target_id: isEdge ? TargetType.Edge : TargetType.Chrome,
            });
            onTransition?.({
              type: FunnelStepTransitionType.Complete,
              details: { browserName },
            });
          }}
          rel={anchorDefaultRel}
          tag="a"
          target="_blank"
          variant={ButtonVariant.Primary}
        >
          <span>{ctaText}</span>
        </Button>
        {showReviews && (
          <div className="flex flex-col items-center gap-1">
            <PlusTrustReviews center />
            <Typography
              color={TypographyColor.Tertiary}
              tag={TypographyTag.P}
              type={TypographyType.Caption1}
            >
              Loved by millions of developers
            </Typography>
          </div>
        )}
        <Typography
          color={TypographyColor.Secondary}
          tag={TypographyTag.P}
          type={TypographyType.Body}
          dangerouslySetInnerHTML={{
            __html: sanitizeMessage(skip),
          }}
        />
      </div>
      <figure className="pointer-events-none mx-auto w-full laptopL:w-2/3">
        <img
          alt="Amazing daily.dev extension screenshot"
          className="w-full"
          loading="lazy"
          role="presentation"
          src={imageUrls.default}
          srcSet={`${imageUrls.default} 820w, ${imageUrls.retina} 1640w`}
        />
      </figure>
    </div>
  );
};

export const FunnelBrowserExtension = withShouldSkipStepGuard(
  withIsActiveGuard(BrowserExtension),
  () => {
    const { shouldShowExtensionOnboarding, isReady } = useOnboardingExtension();
    const router = useRouter();
    const redirectedFromExtension = router?.query?.r === 'extension';
    const shouldSkip =
      (!shouldShowExtensionOnboarding && isReady) || redirectedFromExtension;

    return { shouldSkip };
  },
);
