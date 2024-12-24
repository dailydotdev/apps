import React, { type ReactElement } from 'react';
import { ButtonSize, ButtonVariant, type ButtonProps, Button } from './Button';
import { SimpleTooltip } from '../tooltips';
import { useFeedSettingsEdit } from '../feeds/FeedSettings/useFeedSettingsEdit';
import { TrashIcon } from '../icons';
import { WithClassNameProps } from '../utilities';

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
