import React, { ReactElement } from 'react';
import classNames from 'classnames';
import PlusIcon from '../icons/Plus';
import BlockIcon from '../icons/Block';
import { AllowedTags, Button, ButtonProps } from '../buttons/Button';
import { TagActionArguments } from '../../hooks/useTagAndSource';

const GenericTagButton = ({
  tag,
  className,
  icon,
  action,
  ...props
}: {
  tag: string;
  className?: string;
  icon?: ReactElement;
  action: () => unknown;
}) => (
  <Button
    {...props}
    className={classNames('font-bold typo-callout', className)}
    onClick={action}
    rightIcon={action ? icon : null}
  >
    {`#${tag}`}
  </Button>
);

const UnblockTagButton = ({
  tag,
  className,
  action,
  ...props
}: {
  tag: string;
  className?: string;
  action: () => unknown;
}) => (
  <GenericTagButton
    {...props}
    className={classNames('btn-tagBlocked', className)}
    icon={<BlockIcon className="ml-2 text-xl transition-transform" />}
    action={action}
    tag={tag}
  />
);

const UnfollowTagButton = ({
  tag,
  className,
  action,
  ...props
}: {
  tag: string;
  className?: string;
  action: () => unknown;
}) => (
  <GenericTagButton
    {...props}
    className={classNames('btn-primary', className)}
    icon={<PlusIcon className="ml-2 transition-transform rotate-45" />}
    action={action}
    tag={tag}
  />
);

const FollowTagButton = ({
  tag,
  className,
  action,
  ...props
}: {
  tag: string;
  className?: string;
  action: () => unknown;
}) => (
  <GenericTagButton
    {...props}
    className={classNames('btn-tag', className)}
    icon={<PlusIcon className="ml-2 transition-transform rotate-0" />}
    action={action}
    tag={tag}
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
        tag={tagItem}
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
        tag={tagItem}
        action={() => onUnblockTags({ tags: [tagItem] })}
      />
    );
  }

  if (!onFollowTags) {
    return (
      <span className="flex-1 text-left truncate typo-callout text-theme-label-tertiary">
        {`#${tagItem}`}
      </span>
    );
  }

  return (
    <FollowTagButton
      {...props}
      tag={tagItem}
      action={onFollowTags ? () => onFollowTags({ tags: [tagItem] }) : null}
    />
  );
}
