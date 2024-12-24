import type { type ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from './Button';
import { ButtonSize, ButtonVariant, Button } from './Button';
import { SimpleTooltip } from '../tooltips';
import { useFeedSettingsEdit } from '../feeds/FeedSettings/useFeedSettingsEdit';
import { TrashIcon } from '../icons';
import type { WithClassNameProps } from '../utilities';

type DeleteCustomFeedProps = {
  feedId: string;
} & WithClassNameProps;
export const DeleteCustomFeed = ({
  feedId,
  className,
}: DeleteCustomFeedProps): ReactElement => {
  const { onDelete } = useFeedSettingsEdit({ feedSlugOrId: feedId });

  const commonIconProps: ButtonProps<'button'> = {
    size: ButtonSize.Medium,
    variant: ButtonVariant.Float,
    iconSecondaryOnHover: true,
    className,
  };

  return (
    <SimpleTooltip
      placement="bottom"
      content="Delete custom feed"
      container={{
        className: 'max-w-64 text-center',
      }}
    >
      <Button {...commonIconProps} icon={<TrashIcon />} onClick={onDelete} />
    </SimpleTooltip>
  );
};
