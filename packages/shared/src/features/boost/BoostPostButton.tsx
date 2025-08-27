import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import type { ButtonProps } from '../../components/buttons/Button';
import { Button, ButtonColor } from '../../components/buttons/Button';
import { ButtonVariant } from '../../components/buttons/common';
import { BoostIcon } from '../../components/icons/Boost';
import { LazyModal } from '../../components/modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';

export function BoostPostButton({
  post,
  buttonProps = {},
  isActive = false,
}: {
  post: Post;
  buttonProps?: ButtonProps<'button'>;
  isActive?: boolean;
}): ReactElement {
  const { openModal } = useLazyModal();

  return (
    <Button
      variant={ButtonVariant.Primary}
      {...buttonProps}
      className={classNames(
        buttonProps?.className,
        isActive &&
          'border-none bg-action-comment-float font-normal text-surface-focus',
      )}
      icon={!isActive && <BoostIcon secondary />}
      color={ButtonColor.BlueCheese}
      disabled={isActive}
      onClick={() => {
        openModal({ type: LazyModal.BoostPost, props: { post } });
      }}
    >
      {isActive ? 'Boosting' : 'Boost'}
    </Button>
  );
}
