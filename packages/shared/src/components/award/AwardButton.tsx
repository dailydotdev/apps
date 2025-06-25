import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../buttons/Button';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
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
import { IconSize } from '../Icon';

type AwardButtonProps = {
  type: AwardTypes;
  className?: string;
  entity: AwardEntity;
  iconSize?: IconSize;
  flags?: Record<string, string>;
  post?: Post;
  copy?: string;
} & Pick<ButtonProps<'button'>, 'pressed' | 'variant'>;
export const AwardButton = ({
  type,
  className,
  entity,
  pressed,
  variant = ButtonVariant.Tertiary,
  iconSize = IconSize.Small,
  post,
  flags,
  copy,
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
        <Button
          pressed={pressed}
          size={ButtonSize.Small}
          icon={<MedalBadgeIcon secondary size={iconSize} />}
          className={classNames(className, pressed && 'pointer-events-none')}
          variant={variant}
          color={ButtonColor.Cabbage}
          onClick={openGiveAwardModal}
        >
          {copy}
        </Button>
      </div>
    </Tooltip>
  );
};
