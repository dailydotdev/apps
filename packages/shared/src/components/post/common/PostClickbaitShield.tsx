import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ShieldCheckIcon, ShieldIcon } from '../../icons';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { IconSize } from '../../Icon';

import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import type { Post } from '../../../graphql/posts';
import { Tooltip } from '../../tooltip/Tooltip';
import { CleanTitleReveal } from '../../plus/CleanTitlePreview';

export const PostClickbaitShield = ({
  post,
  iconOnly = false,
}: {
  post: Post;
  iconOnly?: boolean;
}): ReactElement | null => {
  const { isPlus } = usePlusSubscription();
  const { fetchSmartTitle, shieldActive } = useSmartTitle(post);

  if (!isPlus) {
    return iconOnly ? null : <CleanTitleReveal post={post} className="mt-3" />;
  }

  const tooltipContent = shieldActive
    ? 'Click to see the original title'
    : 'Click to see the optimized title';

  if (iconOnly) {
    return (
      <Tooltip content={tooltipContent}>
        <Button
          aria-label="Clickbait Shield"
          icon={
            shieldActive ? (
              <ShieldCheckIcon size={IconSize.Small} />
            ) : (
              <ShieldIcon size={IconSize.Small} />
            )
          }
          iconSecondaryOnHover
          onClick={fetchSmartTitle}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Tertiary}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip
      className="max-w-70 text-left !typo-subhead"
      content={tooltipContent}
    >
      <Button
        className="relative mr-2 mt-4 !justify-start text-left font-normal"
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
      >
        {shieldActive ? 'Optimized title' : 'Clickbait Shield disabled'}
      </Button>
    </Tooltip>
  );
};
