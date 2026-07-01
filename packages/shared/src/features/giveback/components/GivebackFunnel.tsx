import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import CloseButton from '../../../components/CloseButton';
import { RootPortal } from '../../../components/tooltips/Portal';
import { MoveToIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useViewSize, ViewSize } from '../../../hooks';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { GivebackBackground } from './GivebackBackground';
import { GivebackFunnelStep } from './GivebackFunnelSteps';
import { GivebackFunnelVideo } from './GivebackFunnelVideo';
import type { CauseSelection, StepKey } from './givebackFunnelTypes';
import { STEP_KEYS } from './givebackFunnelTypes';

interface GivebackFunnelProps {
  selection: CauseSelection;
  // Replay (opened from "How it works") can be dismissed; the forced first-run
  // cannot, so the user always reaches the campaign with the context they need.
  canClose?: boolean;
  onClose?: () => void;
  onComplete: () => void;
}

export const GivebackFunnel = ({
  selection,
  canClose = false,
  onClose,
  onComplete,
}: GivebackFunnelProps): ReactElement => {
  const { logEvent } = useLogContext();
  const [stepIndex, setStepIndex] = useState(0);
  const stepKey = STEP_KEYS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEP_KEYS.length - 1;

  // The explainer plays inline on step 1, then floats in the corner; one mounted
  // instance keeps it playing across the move.
  const videoSlotRef = useRef<HTMLDivElement>(null);
  const [videoClosed, setVideoClosed] = useState(false);
  // A floating corner video overlaps the content/footer on small screens, so on
  // mobile the explainer only shows inline on step 1 and is dropped afterwards.
  const isMobile = !useViewSize(ViewSize.Tablet);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.StartGivebackFunnel,
      extra: JSON.stringify({ mode: canClose ? 'replay' : 'forced' }),
    });
    // Only on mount - a fresh funnel run is one "start".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.ViewGivebackFunnelStep,
      extra: JSON.stringify({ step: stepKey, index: stepIndex }),
    });
  }, [logEvent, stepKey, stepIndex]);

  // Never trap the user on the causes step: only require a pick when there are
  // causes to pick from.
  const causesBlock =
    stepKey === 'causes' &&
    selection.causes.length > 0 &&
    selection.selectedCount === 0;

  const goNext = () => {
    if (isLast) {
      logEvent({ event_name: LogEvent.CompleteGivebackFunnel });
      onComplete();
      return;
    }
    setStepIndex((index) => index + 1);
  };

  const goBack = () => setStepIndex((index) => Math.max(0, index - 1));

  const ctaLabel = useMemo<Record<StepKey, string>>(
    () => ({
      intro: 'Got it',
      how: 'Sounds good',
      causes: 'Continue',
      impact: "Let's start",
    }),
    [],
  );

  return (
    <RootPortal>
      <div
        role="dialog"
        aria-modal
        aria-label="How daily.dev Giveback works"
        className="fixed inset-0 z-modal bg-background-default"
      >
        {/* Background lives outside the scroll container, so it stays fixed and the
          page behind is never revealed no matter how far the content scrolls. */}
        <GivebackBackground />

        <div className="relative flex h-full flex-col overflow-y-auto overscroll-contain">
          {/* Just a close affordance on replay - the heavy progress bar is gone. */}
          <header className="relative flex h-12 items-center justify-end px-4">
            {canClose && (
              <CloseButton
                type="button"
                size={ButtonSize.Small}
                onClick={onClose}
              />
            )}
          </header>

          <main
            className={classNames(
              'relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-4 tablet:px-6',
              // The cause picker changes height as you filter; top-anchor it so the
              // title + filters stay put and only the list below reflows (no
              // re-centering jump). Shorter steps stay vertically centered.
              stepKey === 'causes' ? 'justify-start' : 'justify-center',
            )}
          >
            {/* Lightweight carousel dots sit above the step content as a quick "where
            am I" cue, just over each step's title. */}
            <FlexRow className="mb-8 justify-center gap-2" aria-hidden>
              {STEP_KEYS.map((key, index) => (
                <span
                  key={key}
                  className={classNames(
                    'h-2 rounded-4 transition-all duration-300',
                    index === stepIndex
                      ? 'w-5 bg-accent-cabbage-default'
                      : 'w-2 bg-border-subtlest-tertiary',
                  )}
                />
              ))}
            </FlexRow>

            {/* Keyed by step so the choreographed enter replays on every advance. */}
            <div key={stepKey} className="flex w-full flex-col">
              <GivebackFunnelStep
                stepKey={stepKey}
                selection={selection}
                videoSlotRef={videoSlotRef}
              />
            </div>
          </main>

          {/* A small floating control bar of a fixed width: a glass pill that hovers
          above the page (shadow for depth), centered. The buttons flex to fill
          it - so a lone CTA spans the whole bar, and Back + Next split it evenly,
          keeping the bar the same width on every step. */}
          {/* Nested-radius rule: the bar's corner = the inner button radius
          (Large = rounded-14) + the bar's padding (p-2 = 8px) => rounded-22, so
          the inner and outer curves stay concentric. */}
          <footer className="pointer-events-none sticky bottom-0 z-3 flex justify-center px-4 pb-5 pt-2">
            <FlexRow className="bg-background-default/95 pointer-events-auto w-full max-w-md items-center gap-2 rounded-22 border border-border-subtlest-secondary p-2 shadow-2 backdrop-blur-xl">
              {!isFirst && (
                <Button
                  type="button"
                  size={ButtonSize.Large}
                  variant={ButtonVariant.Float}
                  className="flex-1"
                  onClick={goBack}
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                size={ButtonSize.Large}
                variant={ButtonVariant.Primary}
                className="flex-1"
                disabled={
                  causesBlock || (stepKey === 'causes' && selection.isSaving)
                }
                onClick={goNext}
              >
                {ctaLabel[stepKey]}
                {/* On the final step a forward "move to" icon on the right reads as
                "go take action next", not a "you're done" checkmark. */}
                {isLast && (
                  <MoveToIcon
                    aria-hidden
                    size={IconSize.XSmall}
                    className="ml-1"
                  />
                )}
              </Button>
            </FlexRow>
          </footer>
        </div>

        {!videoClosed && !(isMobile && stepIndex > 0) && (
          <GivebackFunnelVideo
            slotRef={videoSlotRef}
            docked={stepIndex > 0}
            onClose={() => setVideoClosed(true)}
          />
        )}
      </div>
    </RootPortal>
  );
};
