import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
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
import { MiniCloseIcon, ReadingStreakIcon, StarIcon } from '../icons';
import { IconSize } from '../Icon';

const STAR_INDICES = [0, 1, 2, 3, 4] as const;

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

  const setFlagsForcedOn = (on: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gb = growthbook as any;
    if (on) {
      gb?.setForcedFeatures?.(
        new Map([
          ['referral_growth_loops', true],
          ['extension_store_review_prompt', true],
        ]),
      );
    } else {
      gb?.setForcedFeatures?.(new Map());
    }
    setFlagsForced(on);
  };

  const launchStreakInvite = (currentStreak: number, maxStreak: number) => {
    setFlagsForcedOn(true);
    openModal({
      type: LazyModal.NewStreak,
      props: { currentStreak, maxStreak },
    });
  };

  const openFeedbackModal = () => openModal({ type: LazyModal.Feedback });

  const toggleReview = () => {
    setReviewOpen((prev) => !prev);
    setReviewPositive(false);
  };

  const reviewBanner = reviewOpen ? (
    <div
      className={classNames(
        'fixed inset-x-0 top-0 z-max flex w-full justify-center border-b px-4 py-3 transition-colors duration-300',
        reviewPositive
          ? 'border-accent-cheese-default/30 via-accent-cheese-default/8 bg-gradient-to-r from-surface-float to-surface-float'
          : 'border-border-subtlest-tertiary bg-surface-float',
      )}
    >
      <div className="flex w-full max-w-[44rem] items-center gap-4">
        <div className="hidden shrink-0 items-center gap-0.5 tablet:flex">
          {STAR_INDICES.map((i) => (
            <StarIcon
              key={i}
              secondary={reviewPositive}
              size={IconSize.XSmall}
              className={
                reviewPositive
                  ? 'text-accent-cheese-default'
                  : 'text-accent-cheese-default/50'
              }
            />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-0.5 text-left">
          <Typography bold type={TypographyType.Callout}>
            {reviewPositive
              ? 'Would you leave a quick review?'
              : 'Are you enjoying daily.dev on your new tab?'}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {reviewPositive
              ? 'Honest reviews help other developers discover daily.dev — it takes 30 seconds.'
              : 'Let us know if this is a good moment to ask.'}
          </Typography>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
              Leave a review ↗
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                onClick={() => setReviewPositive(true)}
              >
                Yes, loving it!
              </Button>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                onClick={() => {
                  setReviewOpen(false);
                  openFeedbackModal();
                }}
              >
                Not yet
              </Button>
            </>
          )}
          <button
            type="button"
            aria-label="Dismiss"
            className="ml-1 flex h-7 w-7 items-center justify-center rounded-8 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            onClick={toggleReview}
          >
            <MiniCloseIcon size={IconSize.XSmall} />
          </button>
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
          className="border-accent-bacon-default/40 fixed bottom-4 right-4 z-max flex items-center gap-1.5 rounded-12 border bg-accent-bacon-default px-3 py-2 font-bold text-white shadow-2 typo-footnote"
          onClick={() => setIsCollapsed(false)}
        >
          <ReadingStreakIcon secondary size={IconSize.XSmall} /> Open referral
          QA
        </button>
      </>
    );
  }

  return (
    <>
      {reviewBanner}
      <aside className="fixed bottom-4 right-4 z-max flex max-h-[calc(100dvh-2rem)] w-[24rem] max-w-[calc(100vw-2rem)] flex-col gap-4 overflow-auto rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <Typography bold type={TypographyType.Callout}>
              Referral/review QA
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Real interactions, not mockups. Remove before launch.
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

        {/* HERO: the focus design */}
        <div className="border-accent-bacon-default/30 from-accent-bacon-default/15 to-accent-cheese-default/15 relative overflow-hidden rounded-16 border bg-gradient-to-br via-surface-float p-4">
          <div className="bg-accent-bacon-default/30 pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl" />
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-accent-bacon-default/25 flex h-8 w-8 items-center justify-center rounded-10 text-accent-bacon-default">
                <ReadingStreakIcon secondary size={IconSize.XSmall} />
              </span>
              <div className="flex flex-col">
                <Typography bold type={TypographyType.Callout}>
                  Streak invite — focus design
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  Polished invite moment built for the streak modal
                </Typography>
              </div>
            </div>

            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              One click forces the feature flag and opens the streak modal so
              you can see the new <strong>StreakShareCallout</strong> live —
              chat-bubble preview, pre-written message with your streak count, 5
              channel buttons (WhatsApp, X, Telegram, Email, Copy), tracked
              links per channel.
            </Typography>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                size={ButtonSize.Medium}
                variant={ButtonVariant.Primary}
                className="w-full"
                onClick={() => launchStreakInvite(7, 3)}
              >
                Open 7-day streak invite
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Secondary}
                  className="flex-1"
                  onClick={() => launchStreakInvite(30, 14)}
                >
                  30-day milestone
                </Button>
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Secondary}
                  className="flex-1"
                  onClick={() => launchStreakInvite(100, 100)}
                >
                  100 days 🏆
                </Button>
              </div>
            </div>

            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="border-t border-border-subtlest-tertiary pt-2"
            >
              💡 The invite text adapts to streak length: friendly at 7 days,
              cocky at 30, dominant at 100.
            </Typography>
          </div>
        </div>

        {/* Manual flag toggle */}
        <div className="flex items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
          <div className="flex flex-col gap-0.5">
            <Typography bold type={TypographyType.Caption1}>
              Force flags
            </Typography>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              referral_growth_loops + store_review_prompt
            </Typography>
          </div>
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={
              flagsForced ? ButtonVariant.Primary : ButtonVariant.Secondary
            }
            onClick={() => setFlagsForcedOn(!flagsForced)}
          >
            {flagsForced ? '✓ On' : 'Off'}
          </Button>
        </div>

        {/* Other surfaces (collapsed-style group) */}
        <details className="rounded-12 border border-border-subtlest-tertiary">
          <summary className="cursor-pointer list-none px-3 py-2 text-text-tertiary typo-footnote">
            Other referral surfaces ▾
          </summary>
          <div className="flex flex-col gap-2 border-t border-border-subtlest-tertiary p-3">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={
                reviewOpen ? ButtonVariant.Primary : ButtonVariant.Secondary
              }
              onClick={toggleReview}
            >
              {reviewOpen ? 'Hide review banner' : 'Show review banner'}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                tag="a"
                href={`${settingsUrl}/customization/devcard`}
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
              >
                DevCard
              </Button>
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
                Brief
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
        </details>

        {!user?.id && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.StatusHelp}
          >
            ⚠ Log in to test tracked invite links.
          </Typography>
        )}
      </aside>
    </>
  );
}
