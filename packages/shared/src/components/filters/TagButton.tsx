import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import { PlusIcon, BlockIcon } from '../icons';
import {
  AllowedTags,
  Button,
  ButtonIconPosition,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { TagActionArguments } from '../../hooks/useTagAndSource';

interface GenericTagButtonProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'color'> {
  tagItem: string;
  className?: string;
  icon?: ReactElement;
  action: () => unknown;
  variant?: ButtonVariant;
}

export const GenericTagButton = ({
  tagItem,
  className,
  icon,
  action,
  ...props
}: GenericTagButtonProps): ReactElement => (
  <Button
    {...props}
    size={ButtonSize.Small}
    className={classNames('font-bold typo-callout', className)}
    onClick={action}
    icon={action ? icon : undefined}
    iconPosition={action ? ButtonIconPosition.Right : undefined}
  >
    {`#${tagItem}`}
  </Button>
);

const UnblockTagButton = ({
  tagItem,
  className,
  action,
  ...props
}: GenericTagButtonProps) => (
  <GenericTagButton
    {...props}
    className={classNames('btn-tagBlocked', className)}
    icon={<BlockIcon className="ml-2 text-xl transition-transform" />}
    action={action}
    tagItem={tagItem}
  />
);

const UnfollowTagButton = ({
  tagItem,
  className,
  action,
  ...props
}: GenericTagButtonProps) => (
  <GenericTagButton
    {...props}
    className={className}
    variant={ButtonVariant.Primary}
    icon={<PlusIcon className="ml-2 rotate-45 transition-transform" />}
    action={action}
    tagItem={tagItem}
  />
);

const FollowTagButton = ({
  tagItem,
  className,
  action,
  ...props
}: GenericTagButtonProps) => (
  <GenericTagButton
    {...props}
    className={classNames('btn-tag', className)}
    icon={<PlusIcon className="ml-2 rotate-0 transition-transform" />}
    action={action}
    tagItem={tagItem}
  />
);

export interface TagButtonProps {
  tagItem: string;
  followedTags?: Array<string>;
  blockedTags?: Array<string>;
  onFollowTags?: ({ tags, category }: TagActionArguments) => void;
  onUnfollowTags?: ({ tags, category }: TagActionArguments) => void;
  onUnblockTags?: ({ tags }: TagActionArguments) => void;
}

export default function TagButton<Tag extends AllowedTags>({
  tagItem,
  followedTags,
  blockedTags,
  onFollowTags,
  onUnfollowTags,
  onUnblockTags,
  ...props
}: ButtonProps<Tag> & TagButtonProps): ReactElement {
  if (followedTags?.includes(tagItem)) {
    return (
      <UnfollowTagButton
        {...props}
        tagItem={tagItem}
        action={
          onUnfollowTags ? () => onUnfollowTags({ tags: [tagItem] }) : null
        }
      />
    );
  }

  if (blockedTags?.includes(tagItem)) {
    return (
      <UnblockTagButton
        {...props}
        tagItem={tagItem}
        action={() => onUnblockTags({ tags: [tagItem] })}
      />
    );
  }

  if (!onFollowTags) {
    return (
      <span className="flex-1 truncate text-left text-text-tertiary typo-callout">
        {`#${tagItem}`}
      </span>
    );
  }

  return (
    <FollowTagButton
      {...props}
      tagItem={tagItem}
      action={onFollowTags ? () => onFollowTags({ tags: [tagItem] }) : null}
    />
  );
}
