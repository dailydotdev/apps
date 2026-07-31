import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { FunnelStepBrowserExtension } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { useLogContext } from '../../../contexts/LogContext';
import { useOnboardingExtension } from '../../../components/onboarding/Extension/useOnboardingExtension';
import { BrowserName } from '../../../lib/func';
import { cloudinaryOnboardingExtensionVideo } from '../../../lib/image';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { Button } from '../../../components/buttons/Button';
import { ButtonVariant } from '../../../components/buttons/common';
import { downloadBrowserExtension } from '../../../lib/constants';
import { ChromeIcon, EdgeIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { LogEvent, TargetType } from '../../../lib/log';
import { anchorDefaultRel } from '../../../lib/strings';
import { FunnelTargetId } from '../types/funnelEvents';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { sanitizeMessage } from '../lib/utils';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import { PlusTrustReviews } from '../../../components/plus/PlusTrustReviews';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '../../../components/onboarding/common';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';

const BROWSER_EXTENSION_DEFAULTS = {
  headline: 'Transform every new tab into a learning powerhouse',
  explainer:
    'Unlock the power of every new tab with daily.dev extension. Personalized feed, developer communities, AI search and more!',
  // The paid funnel's original copy; the onboarding funnel shortens it below.
  cta: 'Get it for {browser}',
  skip: 'Dare to skip? <strong>You might miss out</strong>.',
  showReviews: false,
};

const BrowserExtension = ({
  parameters: {
    headline = BROWSER_EXTENSION_DEFAULTS.headline,
    explainer = BROWSER_EXTENSION_DEFAULTS.explainer,
    cta = BROWSER_EXTENSION_DEFAULTS.cta,
    skip = BROWSER_EXTENSION_DEFAULTS.skip,
    showReviews: showReviewsParam = BROWSER_EXTENSION_DEFAULTS.showReviews,
    video = cloudinaryOnboardingExtensionVideo,
  },
  onTransition,
}: FunnelStepBrowserExtension): ReactElement => {
  const { logEvent } = useLogContext();
  const { browserName } = useOnboardingExtension();
  const { applyThemeMode } = useSettingsContext();
  const isEdge = browserName === BrowserName.Edge;
  const browserLabel = isEdge ? 'Edge' : 'Chrome';
  const isOnboarding = useIsOnboardingFunnel();
  // Only swap the default; a Freyja-provided cta always wins.
  const ctaTemplate =
    isOnboarding && cta === BROWSER_EXTENSION_DEFAULTS.cta
      ? 'Add to {browser}'
      : cta;
  const ctaText = ctaTemplate.replace('{browser}', browserLabel);
  const showReviews = showReviewsParam && !isEdge;

  // The step is designed for a dark surface (dark background, dark footage).
  // FunnelStepBackground tries to force that with an `invert` class,
  // but Tailwind's invert core plugin is disabled repo-wide, so in light mode
  // the copy kept its light-theme colors and turned unreadable. Apply the dark
  // theme for as long as the step is mounted, like the hero step does.
  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);

    return () => applyThemeMode();
  }, [applyThemeMode]);

  const onDownload = () => {
    logEvent({
      event_name: LogEvent.DownloadExtension,
      target_id: isEdge ? TargetType.Edge : TargetType.Chrome,
    });
    onTransition?.({
      type: FunnelStepTransitionType.Complete,
      details: { browserName },
    });
  };

  const reviews = showReviews && (
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
  );

  // 40rem in the funnel, where the footage otherwise dominates the step and
  // pushes the copy off the fold; the paid funnel keeps main's 48rem.
  const footage = (
    <figure
      className={classNames(
        'pointer-events-none mx-auto mb-10 w-full px-4 laptop:px-6',
        isOnboarding ? 'max-w-[40rem]' : 'max-w-[48rem]',
      )}
    >
      <video
        aria-label="daily.dev feed running in a new tab on a laptop"
        autoPlay
        className="aspect-video w-full rounded-16 border border-border-subtlest-quaternary bg-background-subtle object-cover shadow-2"
        controls={false}
        disablePictureInPicture
        loop
        muted
        playsInline
        src={video}
      />
    </figure>
  );

  // The paid funnel keeps its own inline CTA and takes its skip from the
  // stepper header — this step is in `stepsWithOnlySkipHeader`. Docking the CTA
  // here regardless would give `/helloworld` a second Skip button under a moved
  // download button, so this branch is main's markup unchanged.
  if (!isOnboarding) {
    return (
      <div className="mt-10 flex flex-1 flex-col laptop:justify-center">
        <div className="mb-10 flex flex-col items-center gap-6 justify-self-start text-center">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
            className="!px-0"
            dangerouslySetInnerHTML={{ __html: sanitizeMessage(headline) }}
          />
          <Typography
            className="w-2/3 text-balance text-text-tertiary typo-body"
            color={TypographyColor.Secondary}
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            dangerouslySetInnerHTML={{ __html: sanitizeMessage(explainer) }}
          />
          <Button
            href={downloadBrowserExtension}
            icon={
              isEdge ? <EdgeIcon aria-hidden /> : <ChromeIcon aria-hidden />
            }
            data-funnel-track={FunnelTargetId.DownloadExtension}
            onClick={onDownload}
            rel={anchorDefaultRel}
            tag="a"
            target="_blank"
            variant={ButtonVariant.Primary}
          >
            <span>{ctaText}</span>
          </Button>
          {reviews}
          <Typography
            color={TypographyColor.Secondary}
            tag={TypographyTag.P}
            type={TypographyType.Body}
            dangerouslySetInnerHTML={{ __html: sanitizeMessage(skip) }}
          />
        </div>
        {footage}
      </div>
    );
  }

  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: ctaText }}
      data-funnel-track={FunnelTargetId.DownloadExtension}
      href={downloadBrowserExtension}
      icon={
        // The browser mark is a credential next to the label, not a feature of
        // it — one step down from the button's default icon size.
        isEdge ? (
          <EdgeIcon aria-hidden size={IconSize.Small} />
        ) : (
          <ChromeIcon aria-hidden size={IconSize.Small} />
        )
      }
      onClick={onDownload}
      rel={anchorDefaultRel}
      skip={{
        cta: 'Skip',
        onClick: () => onTransition?.({ type: FunnelStepTransitionType.Skip }),
      }}
      tag="a"
      target="_blank"
      containerClassName="flex flex-col"
    >
      <div
        className={classNames(
          funnelStepRail,
          'mb-6 flex flex-col items-center gap-6 py-6 pt-3 text-center',
        )}
      >
        <OnboardingHeadline
          dangerouslySetInnerHTML={{
            __html: sanitizeMessage(headline),
          }}
        />
        <OnboardingSubheadline
          dangerouslySetInnerHTML={{
            __html: sanitizeMessage(explainer),
          }}
        />
        {reviews}
        {/* An aside under the subtitle, so a step quieter than it. */}
        <Typography
          color={TypographyColor.Tertiary}
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          dangerouslySetInnerHTML={{
            __html: sanitizeMessage(skip),
          }}
        />
      </div>
      {footage}
    </FunnelStepCtaWrapper>
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
