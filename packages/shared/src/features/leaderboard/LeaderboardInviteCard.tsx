import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import { CopyIcon } from '../../components/icons/Copy';
import { PlusTitle } from '../../components/plus/PlusTitle';
import { TypographyType } from '../../components/typography/Typography';
import { pluralizeFriend } from '../../components/referral/ReferralLadderRewards';
import { useLogContext } from '../../contexts/LogContext';
import { useReferralCampaign } from '../../hooks/referral/useReferralCampaign';
import { useReferralLadder } from '../../hooks/referral/useReferralLadder';
import { useCopyLink } from '../../hooks/useCopy';
import { link } from '../../lib/links';
import { LogEvent, TargetId } from '../../lib/log';
import {
  formatReferralLadderMonths,
  getReferralInviteMessage,
  getReferralLadderReward,
  REFERRAL_INVITE_COPIED_TOAST,
  ReferralCampaignKey,
} from '../../lib/referral';
import { LeaderboardActionCard } from './LeaderboardActionCard';

/** The Plus referral ladder, as the invite settings page reads it. */
export const LeaderboardInviteCard = (): ReactElement | null => {
  const {
    isEligible,
    isLoading,
    referredCount,
    steps,
    nextStep,
    remainingInvites,
  } = useReferralLadder();
  const { url, isReady } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const [, copyLink] = useCopyLink(() => url || link.referral.defaultUrl);
  const { logEvent } = useLogContext();

  const lastStep = steps[steps.length - 1];

  if (!isLoading && (!isEligible || !lastStep)) {
    return null;
  }

  const onCopy = () => {
    copyLink({
      format: getReferralInviteMessage,
      message: REFERRAL_INVITE_COPIED_TOAST,
    });
    logEvent({
      event_name: LogEvent.CopyReferralLink,
      target_id: TargetId.LeaderboardInviteCard,
    });
  };
  const copyButton = (size: ButtonSize) => (
    <Button
      type="button"
      size={size}
      variant={ButtonVariant.Secondary}
      icon={<CopyIcon />}
      disabled={isLoading || !isReady}
      onClick={onCopy}
    >
      Copy invite link
    </Button>
  );
  const headline = nextStep
    ? `Invite ${remainingInvites} ${pluralizeFriend(
        remainingInvites,
      )}, get ${formatReferralLadderMonths(nextStep.months)}`
    : `You unlocked ${getReferralLadderReward(lastStep.months)}`;

  return (
    <LeaderboardActionCard
      title={
        <div className="flex flex-wrap items-center gap-x-2">
          <PlusTitle type={TypographyType.Callout} bold />
          {isLoading ? (
            <ElementPlaceholder className="h-4 w-40 rounded-4" />
          ) : (
            headline
          )}
        </div>
      }
      detail={
        isLoading ? (
          <ElementPlaceholder className="mt-1 h-3 w-32 rounded-4" />
        ) : (
          `${Math.min(referredCount, lastStep.invites)} of ${
            lastStep.invites
          } friends joined`
        )
      }
      aside={
        // Phones: the same small size as Snapshot.
        <span className="ml-auto flex tablet:hidden">
          {copyButton(ButtonSize.XSmall)}
        </span>
      }
      action={copyButton(ButtonSize.Small)}
      actionClassName="hidden tablet:flex"
    >
      <ol className="grid grid-cols-3 gap-1.5">
        {(isLoading ? Array.from({ length: 3 }, () => undefined) : steps).map(
          (step, index) => {
            const unlocked = !!step?.unlockedAt;

            return (
              <li key={step?.step ?? index} className="flex flex-col gap-1">
                <span
                  className={classNames(
                    'h-1.5 rounded-4',
                    unlocked ? 'bg-action-plus-default' : 'bg-surface-float',
                  )}
                />
                {step ? (
                  <span
                    className={classNames(
                      'typo-caption2',
                      unlocked
                        ? 'text-action-plus-default'
                        : 'text-text-quaternary',
                    )}
                  >
                    {formatReferralLadderMonths(step.months)}
                    {unlocked && <span className="sr-only">, unlocked</span>}
                  </span>
                ) : (
                  <ElementPlaceholder className="h-3 w-12 rounded-4" />
                )}
              </li>
            );
          },
        )}
      </ol>
    </LeaderboardActionCard>
  );
};
