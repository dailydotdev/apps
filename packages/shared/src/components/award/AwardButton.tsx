import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonV2Props } from '../buttons/ButtonV2';
import {
  ButtonV2,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/ButtonV2';
import { MedalBadgeIcon } from '../icons';
import { AuthTriggers } from '../../lib/auth';
import { LazyModal } from '../modals/common/types';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import type {
  AwardEntity,
  AwardTypes,
} from '../../contexts/GiveAwardModalContext';
import type { Post } from '../../graphql/posts';
import { Tooltip } from '../tooltip/Tooltip';

type AwardButtonProps = {
  type: AwardTypes;
  className?: string;
  entity: AwardEntity;
  flags?: Record<string, string>;
  post?: Post;
  copy?: string;
} & Pick<ButtonV2Props<'button'>, 'pressed' | 'variant'>;
export const AwardButton = ({
  type,
  className,
  entity,
  pressed,
  variant = ButtonVariant.Tertiary,
  post,
  flags,
  copy,
}: AwardButtonProps): ReactElement | null => {
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
        entity,
        post,
        flags,
      },
    });
  };

  if (user && entity.receiver?.id === user.id) {
    return null;
  }

  return (
    <Tooltip
      content={
        pressed
          ? `You already awarded this ${type.toLowerCase()}!`
          : `Award this ${type.toLowerCase()}`
      }
    >
      <div>
        <ButtonV2
          pressed={pressed}
          size={ButtonSize.Small}
          icon={<MedalBadgeIcon />}
          className={classNames(className, pressed && 'pointer-events-none')}
          variant={variant}
          color={ButtonColor.Cabbage}
          onClick={openGiveAwardModal}
        >
          {copy}
        </ButtonV2>
      </div>
    </Tooltip>
  );
};
