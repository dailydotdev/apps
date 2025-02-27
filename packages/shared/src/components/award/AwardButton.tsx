import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { MedalBadgeIcon } from '../icons';
import { SimpleTooltip } from '../tooltips';
import { AuthTriggers } from '../../lib/auth';
import { LazyModal } from '../modals/common/types';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import type { AwardTypes } from '../../contexts/GiveAwardModalContext';

type AwardButtonProps = {
  appendTo: 'parent' | Element | ((ref: Element) => Element);
  type: AwardTypes;
  className?: string;
};
export const AwardButton = ({
  appendTo,
  type,
  className,
}: AwardButtonProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { openModal } = useLazyModal();

  const openGiveAwardModal = () => {
    if (!user) {
      return showLogin({ trigger: AuthTriggers.GiveAward });
    }

    return openModal({
      type: LazyModal.GiveAward,
      props: {
        type,
      },
    });
  };

  return (
    <SimpleTooltip content="Award this user" appendTo={appendTo}>
      <Button
        size={ButtonSize.Small}
        icon={<MedalBadgeIcon secondary />}
        className={className}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Bun}
        onClick={openGiveAwardModal}
      />
    </SimpleTooltip>
  );
};
