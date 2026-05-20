import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useAskForReviewVisibility } from '../../hooks/useAskForReviewVisibility';
import { useActions } from '../../hooks/useActions';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { FeedbackCategory } from '../../graphql/feedback';
import { ActionType } from '../../graphql/actions';
import type {
  AskForReviewQAOverride,
  ReviewDestinationId,
} from '../../lib/askForReview';
import {
  clearDismissedAt,
  clearShownThisSession,
  getQAOverride,
  getReviewDestination,
  setDismissedAt,
  setQAOverride,
} from '../../lib/askForReview';
import { isTesting } from '../../lib/constants';
import { ASK_FOR_REVIEW_RESET_EVENT } from './AskForReviewStrip';

const DESTINATION_OPTIONS: { id: ReviewDestinationId; label: string }[] = [
  { id: 'chrome_web_store', label: 'Chrome Web Store' },
  { id: 'edge_addons', label: 'Edge Add-ons' },
  { id: 'firefox_addons', label: 'Firefox Add-ons' },
  { id: 'app_store', label: 'App Store' },
  { id: 'play_store', label: 'Play Store' },
  { id: 'twitter_share', label: 'X share fallback' },
];

const QA_QUERY_KEY = 'ask-for-review-qa';

const useQAEnabled = (): boolean => {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get(QA_QUERY_KEY);
    if (fromUrl === '1') {
      window.localStorage.setItem(`${QA_QUERY_KEY}-enabled`, '1');
    }
    if (fromUrl === '0') {
      window.localStorage.removeItem(`${QA_QUERY_KEY}-enabled`);
    }
    setEnabled(window.localStorage.getItem(`${QA_QUERY_KEY}-enabled`) === '1');
  }, [router?.asPath]);

  return enabled;
};

const StatusRow = ({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}): ReactElement => (
  <div className="flex items-center justify-between gap-2">
    <Typography type={TypographyType.Caption1} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
    <Typography
      type={TypographyType.Caption1}
      bold
      color={good ? TypographyColor.StatusSuccess : TypographyColor.Primary}
    >
      {value}
    </Typography>
  </div>
);

export function AskForReviewQAPanel(): ReactElement | null {
  const enabled = useQAEnabled();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [override, setOverrideState] = useState<AskForReviewQAOverride | null>(
    null,
  );
  const [, forceRefresh] = useState(0);
  const { openModal } = useLazyModal();
  const { completeAction } = useActions();
  const visibility = useAskForReviewVisibility();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setOverrideState(getQAOverride());
  }, [enabled]);

  if (isTesting || !enabled) {
    return null;
  }

  const refresh = () => {
    forceRefresh((value) => value + 1);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(ASK_FOR_REVIEW_RESET_EVENT));
    }
  };

  const applyOverride = (next: AskForReviewQAOverride | null) => {
    setQAOverride(next);
    setOverrideState(next);
    refresh();
  };

  const startQAMode = (destinationId?: ReviewDestinationId) => {
    applyOverride({
      enabled: true,
      destinationId,
      ignoreCompletedAction: true,
      ignoreCooldown: true,
      ignoreSession: true,
      ignoreStreak: true,
    });
    clearShownThisSession();
  };

  const stopQAMode = () => {
    applyOverride(null);
    clearShownThisSession();
    clearDismissedAt();
  };

  const platform = getReviewDestination();

  return (
    <aside
      className="fixed bottom-4 right-4 z-max flex max-h-[calc(100dvh-2rem)] w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-3 overflow-auto rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2"
      data-testid="ask-for-review-qa-panel"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Typography bold type={TypographyType.Callout}>
            Ask for Review QA
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Triggers the real strip + handlers. Remove before launch.
          </Typography>
        </div>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          onClick={() => setIsCollapsed((value) => !value)}
        >
          {isCollapsed ? 'Show' : 'Hide'}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          <div className="flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
            <StatusRow
              label="Detected platform"
              value={platform?.label ?? 'none (unsupported)'}
            />
            <StatusRow
              label="QA mode"
              value={override ? 'ON (bypasses gates)' : 'off'}
              good={!!override}
            />
            <StatusRow
              label="Strip visible"
              value={visibility.visible ? 'YES' : 'no'}
              good={visibility.visible}
            />
            <StatusRow
              label="Active destination"
              value={visibility.destination?.label ?? '-'}
            />
            <StatusRow
              label="Cooldown active"
              value={visibility.isCooldownLive ? 'yes' : 'no'}
            />
            <StatusRow
              label="Shown this session"
              value={visibility.isSessionShown ? 'yes' : 'no'}
            />
            <StatusRow
              label="Completed (server)"
              value={visibility.isCompletedPermanent ? 'YES' : 'no'}
            />
            <StatusRow
              label="Streak"
              value={`${visibility.streakValue} / threshold ${visibility.streakThreshold}`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Typography bold type={TypographyType.Caption1}>
              Trigger the strip
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Bypasses every gate (action, cooldown, session, streak,
              GrowthBook). Then navigate to any post page and the strip renders
              inline.
            </Typography>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={
                  override && !override.destinationId
                    ? ButtonVariant.Primary
                    : ButtonVariant.Secondary
                }
                onClick={() => startQAMode(undefined)}
              >
                Auto (detected)
              </Button>
              {DESTINATION_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  size={ButtonSize.Small}
                  variant={
                    override?.destinationId === option.id
                      ? ButtonVariant.Primary
                      : ButtonVariant.Secondary
                  }
                  onClick={() => startQAMode(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Typography bold type={TypographyType.Caption1}>
              State controls
            </Typography>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                onClick={() => {
                  clearShownThisSession();
                  refresh();
                }}
              >
                Reset session
              </Button>
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                onClick={() => {
                  clearDismissedAt();
                  refresh();
                }}
              >
                Reset cooldown
              </Button>
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                onClick={() => {
                  setDismissedAt(Date.now());
                  refresh();
                }}
              >
                Set cooldown now
              </Button>
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                onClick={stopQAMode}
              >
                Disable QA mode
              </Button>
            </div>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              {`The "Completed (server)" action is permanent and cannot be undone client-side; use a fresh user to retest engaged flows.`}
            </Typography>
          </div>

          <div className="flex flex-col gap-2 border-t border-border-subtlest-tertiary pt-2">
            <Typography bold type={TypographyType.Caption1}>
              Sub-flows (manual triggers)
            </Typography>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                onClick={() =>
                  openModal({
                    type: LazyModal.Feedback,
                    props: { defaultCategory: FeedbackCategory.UxIssue },
                  })
                }
              >
                Open Feedback modal
              </Button>
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                onClick={() =>
                  completeAction(ActionType.AskedForReviewComplete)
                }
              >
                Mark action complete
              </Button>
            </div>
          </div>

          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            className="border-t border-border-subtlest-tertiary pt-2"
          >
            Open this panel via ?ask-for-review-qa=1 on any page. Toggle off
            with ?ask-for-review-qa=0.
          </Typography>
        </>
      )}
    </aside>
  );
}
