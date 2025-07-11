import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { ButtonProps } from '../../components/buttons/Button';
import { Button } from '../../components/buttons/Button';
import { ButtonVariant } from '../../components/buttons/common';
import { BoostIcon } from '../../components/icons/Boost';
import { LazyModal } from '../../components/modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';

export function BoostPostButton({
  post,
  buttonProps = {},
}: {
  post: Post;
  buttonProps?: ButtonProps<'button'>;
}): ReactElement {
  const { openModal } = useLazyModal();

  return (
    <Button
      variant={ButtonVariant.Primary}
      {...buttonProps}
      icon={<BoostIcon secondary />}
      style={{
        background:
          'radial-gradient(1030.79% 132.35% at 50.01% 56.13%, var(--Colors-Accent-Blue-Cheese-subtlest, #6FF1F6) 0%, var(--theme-accent-cabbage-default) 100%)',
      }}
      onClick={() => {
        openModal({ type: LazyModal.BoostPost, props: { post } });
      }}
    >
      Boost
    </Button>
  );
}
