import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
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

const BrowserExtension = ({
  parameters: { headline, explainer },
  onTransition,
}: FunnelStepBrowserExtension): ReactElement => {
  const { logEvent } = useLogContext();
  const { browserName, shouldShowExtensionOnboarding } =
    useOnboardingExtension();
  const isEdge = browserName === BrowserName.Edge;
  const imageUrls = cloudinaryOnboardingExtension[browserName];

  useEffect(() => {
    if (!shouldShowExtensionOnboarding) {
      onTransition({
        type: FunnelStepTransitionType.Skip,
        details: { browserName },
      });
    }
  }, [browserName, onTransition, shouldShowExtensionOnboarding]);

  if (!shouldShowExtensionOnboarding) {
    return null;
  }

  return (
    <div className="mt-10 flex flex-1 flex-col laptop:justify-between">
      <div className="mb-14 flex flex-col items-center gap-6 justify-self-start text-center">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
          className="!px-0"
        >
          {headline || 'Transform every new tab into a learning powerhouse'}
        </Typography>
        <Typography
          className="w-2/3 text-balance text-text-tertiary typo-body"
          color={TypographyColor.Secondary}
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
        >
          {explainer ||
            'Unlock the power of every new tab with daily.dev extension. Personalized feed, developer communities, AI search and more!'}
        </Typography>
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
          <span>Get it for {isEdge ? 'Edge' : 'Chrome'}</span>
        </Button>
        <Typography
          color={TypographyColor.Secondary}
          tag={TypographyTag.P}
          type={TypographyType.Body}
        >
          Dare to skip? <strong>You might miss out</strong>.
        </Typography>
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

export const FunnelBrowserExtension = withIsActiveGuard(BrowserExtension);
