import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import { GiftIcon } from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useReferralLadder } from '../../hooks/referral/useReferralLadder';

export const ReferralLadderGiftButton = (): ReactElement | null => {
  const { openModal } = useLazyModal();
  const { isCompleted, nextStep } = useReferralLadder();

  if (isCompleted) {
    return null;
  }

  // The header can be wrapped in a profile link, so keep the click here.
  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    openModal({ type: LazyModal.ReferralLadder });
  };

  return (
    <Tooltip content={`Invite friends, get ${nextStep?.reward}`}>
      <button
        type="button"
        aria-label="Invite friends, get Plus"
        onClick={onClick}
        className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-action-plus-float text-action-plus-default hover:bg-action-plus-default hover:text-white"
      >
        <GiftIcon
          secondary
          size={IconSize.Small}
          className="animate-nudge-shake"
        />
      </button>
    </Tooltip>
  );
};
