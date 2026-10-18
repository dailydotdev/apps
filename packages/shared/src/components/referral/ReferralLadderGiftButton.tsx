import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { GiftIcon } from '../icons/gift';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import type { ReferralLadderStep } from '../../graphql/users';
import { getReferralLadderReward } from '../../lib/referral';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';

interface ReferralLadderGiftButtonProps {
  nextStep: ReferralLadderStep;
}

const origin = TargetId.ProfileDropdown;

export const ReferralLadderGiftButton = ({
  nextStep,
}: ReferralLadderGiftButtonProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const [shouldShake] = useState(
    () =>
      isActionsFetched &&
      !checkHasCompleted(ActionType.ReferralLadderGiftShake),
  );

  useEffect(() => {
    if (shouldShake) {
      completeAction(ActionType.ReferralLadderGiftShake).catch(() => undefined);
    }
  }, [shouldShake, completeAction]);

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.ReferralLadderGift,
    extra: JSON.stringify({ origin }),
  }));

  // The header can be wrapped in a profile link, so keep the click here.
  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    openModal({ type: LazyModal.ReferralLadder, props: { origin } });
  };

  return (
    <Tooltip
      content={`Invite friends, get ${getReferralLadderReward(
        nextStep.months,
      )}`}
    >
      <button
        type="button"
        aria-label="Invite friends, get Plus"
        onClick={onClick}
        className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-action-plus-float text-action-plus-default hover:bg-action-plus-hover"
      >
        <GiftIcon
          secondary
          size={IconSize.Small}
          className={classNames(shouldShake && 'animate-nudge-shake')}
        />
      </button>
    </Tooltip>
  );
};
