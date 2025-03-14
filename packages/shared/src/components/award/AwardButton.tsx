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
import { SimpleTooltip } from '../tooltips';
import { AuthTriggers } from '../../lib/auth';
import { LazyModal } from '../modals/common/types';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import type {
  AwardEntity,
  AwardTypes,
} from '../../contexts/GiveAwardModalContext';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { getCompanionWrapper } from '../../lib/extension';
import type { Post } from '../../graphql/posts';

type AwardButtonProps = {
  appendTo?: 'parent' | Element | ((ref: Element) => Element);
  type: AwardTypes;
  className?: string;
  entity: AwardEntity;
  post?: Post;
} & Pick<ButtonProps<'button'>, 'pressed' | 'variant'>;
export const AwardButton = ({
  appendTo: appendToProps,
  type,
  className,
  entity,
  pressed,
  variant = ButtonVariant.Tertiary,
  post,
}: AwardButtonProps): ReactElement => {
  const { isCompanion } = useRequestProtocol();
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
      },
    });
  };

  if (user && entity.receiver?.id === user.id) {
    return null;
  }

  const defaultAppendTo = isCompanion ? getCompanionWrapper : 'parent';
  const appendTo = appendToProps || defaultAppendTo;

  return (
    <SimpleTooltip
      content={
        pressed
          ? `You already awarded this ${type.toLowerCase()}!`
          : 'Award this user'
      }
      appendTo={appendTo}
    >
      <div>
        <Button
          pressed={pressed}
          size={ButtonSize.Small}
          icon={<MedalBadgeIcon secondary />}
          className={classNames(className, pressed && 'pointer-events-none')}
          variant={variant}
          color={ButtonColor.Cabbage}
          onClick={openGiveAwardModal}
        />
      </div>
    </SimpleTooltip>
  );
};
