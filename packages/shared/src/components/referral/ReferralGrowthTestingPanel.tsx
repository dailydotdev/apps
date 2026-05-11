import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import {
  chromeWebStoreReviewUrl,
  isTesting,
  settingsUrl,
} from '../../lib/constants';
import { useGrowthBookContext } from '../GrowthBookProvider';

/*
 * TEMPORARY QA PANEL
 * Remove this component and its registration in MainLayout entirely
 * after the referral/review growth experiment has been reviewed and approved.
 */

export function ReferralGrowthTestingPanel(): ReactElement | null {
  const { user } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const { openModal } = useLazyModal();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [flagsForced, setFlagsForced] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewPositive, setReviewPositive] = useState(false);

  if (isTesting) {
    return null;
  }

  const toggleFlags = () => {
    if (flagsForced) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (growthbook as any)?.setForcedFeatures?.(new Map());
      setFlagsForced(false);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (growthbook as any)?.setForcedFeatures?.(
        new Map([
          ['referral_growth_loops', true],
          ['extension_store_review_prompt', true],
        ]),
      );
      setFlagsForced(true);
    }
  };

  const openStreakModal = (currentStreak: number, maxStreak: number) =>
    openModal({ type: LazyModal.NewStreak, props: { currentStreak, maxStreak } });

  const openFeedbackModal = () => openModal({ type: LazyModal.Feedback });

  const toggleReview = () => {
    setReviewOpen((prev) => !prev);
    setReviewPositive(false);
  };

  /*
   * The review banner renders fixed at the top of the viewport — exactly the
   * width and position it occupies in the real extension new-tab layout.
   */
  const reviewBanner = reviewOpen ? (
    <div className="fixed inset-x-0 top-0 z-max flex w-full justify-center border-b border-border-subtlest-tertiary bg-surface-float px-4 py-3">
      <div className="flex w-full max-w-[44rem] flex-col items-center gap-3 text-center tablet:flex-row tablet:text-left">
        <div className="flex flex-1 flex-col gap-1">
          <Typography bold type={TypographyType.Callout}>
            {reviewPositive
              ? 'Would you mind leaving a quick review?'
              : 'Are you enjoying daily.dev on your new tab?'}
          </Typography>
          <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
            {reviewPositive
              ? 'Honest Chrome Web Store reviews help other developers discover daily.dev.'
              : 'Your feedback helps us understand whether this is the right moment to ask.'}
          </Typography>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {reviewPositive ? (
            <Button
              tag="a"
              href={chromeWebStoreReviewUrl}
              target="_blank"
              rel="noopener"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={toggleReview}
            >
              Review on Chrome Web Store
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                onClick={() => setReviewPositive(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Secondary}
                onClick={() => {
                  setReviewOpen(false);
                  openFeedbackModal();
                }}
              >
                Not really
              </Button>
            </>
          )}
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={toggleReview}
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  if (isCollapsed) {
    return (
      <>
        {reviewBanner}
        <button
          type="button"
          className="text-text-inverted fixed bottom-4 right-4 z-max rounded-12 border border-border-subtlest-tertiary bg-accent-cabbage-default px-3 py-2 font-bold typo-footnote"
          onClick={() => setIsCollapsed(false)}
        >
          Open referral QA
        </button>
      </>
    );
  }

  return (
    <>
      {reviewBanner}
      <aside className="fixed bottom-4 right-4 z-max flex max-h-[calc(100dvh-2rem)] w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-4 overflow-auto rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <Typography bold type={TypographyType.Callout}>
              Referral/review QA
            </Typography>
            <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
              Triggers the real interactions — remove before launch.
            </Typography>
          </div>
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            onClick={() => setIsCollapsed(true)}
          >
            Hide
          </Button>
        </div>

        {/* Step 1: force GrowthBook flags so referral sections appear in modals */}
        <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
          <Typography bold type={TypographyType.Footnote}>
            1. Enable flags first
          </Typography>
          <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
            Forces{' '}
            <code className="typo-footnote">referral_growth_loops</code> on so
            the invite sections appear inside the modals below.
          </Typography>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={flagsForced ? ButtonVariant.Primary : ButtonVariant.Secondary}
            onClick={toggleFlags}
          >
            {flagsForced ? '✓ Flags forced on' : 'Force flags on'}
          </Button>
        </div>

        {/* Step 2: streak modals — opens the real modal users see */}
        <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
          <Typography bold type={TypographyType.Footnote}>
            2. Streak milestone modal
          </Typography>
          <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
            Opens the exact modal users see when reaching a streak. Enable flags
            first to see the invite section inside.
          </Typography>
          <div className="flex gap-2">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
              onClick={() => openStreakModal(7, 3)}
            >
              7-day streak
            </Button>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
              onClick={() => openStreakModal(10, 10)}
            >
              New record 🏆
            </Button>
          </div>
        </div>

        {/* Step 3: Chrome Web Store review — real banner, full width, at top of page */}
        <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
          <Typography bold type={TypographyType.Footnote}>
            3. Chrome review banner
          </Typography>
          <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
            Renders the real two-step banner at the top of the page — same width
            and position as extension users see it on their new tab.
          </Typography>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={reviewOpen ? ButtonVariant.Primary : ButtonVariant.Secondary}
            onClick={toggleReview}
          >
            {reviewOpen ? 'Hide banner' : 'Show review banner'}
          </Button>
        </div>

        {/* Step 4: DevCard — navigate to the settings page that embeds the invite */}
        <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
          <Typography bold type={TypographyType.Footnote}>
            4. DevCard invite
          </Typography>
          <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
            Enable flags first — the tracked invite link appears in DevCard
            settings step&nbsp;2.
          </Typography>
          <Button
            tag="a"
            href={`${settingsUrl}/customization/devcard`}
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
          >
            Go to DevCard settings →
          </Button>
        </div>

        {/* More contextual surfaces */}
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Footnote}>
            More flows
          </Typography>
          <div className="grid grid-cols-2 gap-2">
            <Button
              tag="a"
              href={`${settingsUrl}/invite`}
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
            >
              Invite page
            </Button>
            <Button
              tag="a"
              href="/squads/new"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
            >
              New Squad
            </Button>
            <Button
              tag="a"
              href="/briefing"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
            >
              Brief share
            </Button>
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
              onClick={openFeedbackModal}
            >
              Feedback modal
            </Button>
          </div>
        </div>

        {!user?.id && (
          <Typography type={TypographyType.Footnote} color={TypographyColor.Secondary}>
            ⚠ Log in to test tracked invite links.
          </Typography>
        )}
      </aside>
    </>
  );
}
