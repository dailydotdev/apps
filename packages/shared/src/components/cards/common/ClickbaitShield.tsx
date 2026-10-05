import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize } from '../../buttons/Button';
import { ShieldCheckIcon, ShieldIcon } from '../../icons';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import type { Post } from '../../../graphql/posts';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { Tooltip } from '../../tooltip/Tooltip';

export const ClickbaitShield = ({
  post,
}: {
  post: Post;
}): ReactElement | null => {
  const { isPlus } = usePlusSubscription();
  const { fetchSmartTitle, shieldActive } = useSmartTitle(post);

  if (!isPlus) {
    return null;
  }

  return (
    <Tooltip
      className="max-w-70 text-left !typo-subhead"
      content={
        shieldActive
          ? 'Click to see the original title'
          : 'Click to see the optimized title'
      }
    >
      <Button
        className="relative mr-2"
        size={ButtonSize.XSmall}
        icon={
          shieldActive ? (
            <ShieldCheckIcon className="text-status-success" />
          ) : (
            <ShieldIcon />
          )
        }
        iconSecondaryOnHover
        onClick={fetchSmartTitle}
      />
    </Tooltip>
  );
};
