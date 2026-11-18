import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../../components/Icon';
import { BoostIcon } from '../../components/icons/Boost';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import CloseButton from '../../components/CloseButton';
import { useActions } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { ActionType } from '../../graphql/actions';
import type { Post } from '../../graphql/posts';
import { LazyModal } from '../../components/modals/common/types';
import { Origin } from '../../lib/log';
import type { WithClassNameProps } from '../../components/utilities';

interface BoostNewPostStripProps extends WithClassNameProps {
  post: Post;
}

export function BoostNewPostStrip({
  post,
  className,
}: BoostNewPostStripProps): ReactElement {
  const { completeAction } = useActions();
  const { openModal } = useLazyModal();

  return (
    <div
      className={classNames(
        'flex w-full flex-wrap items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-2 pl-3 tablet:flex-nowrap',
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-accent-blueCheese-flat text-accent-blueCheese-default">
        <BoostIcon size={IconSize.Small} />
      </span>
      <span className="min-w-0 flex-1 typo-callout tablet:truncate">
        Boost to reach <strong>more developers</strong> now!
      </span>
      <Button
        className="order-last w-full shrink-0 tablet:order-none tablet:w-auto"
        variant={ButtonVariant.Primary}
        color={ButtonColor.BlueCheese}
        size={ButtonSize.Small}
        onClick={() =>
          openModal({
            type: LazyModal.BoostPost,
            props: { post, origin: Origin.NewPostBoostStrip },
          })
        }
      >
        Boost
      </Button>
      <CloseButton
        size={ButtonSize.Small}
        aria-label="Dismiss"
        onClick={() => completeAction(ActionType.ClosedNewPostBoostBanner)}
      />
    </div>
  );
}
