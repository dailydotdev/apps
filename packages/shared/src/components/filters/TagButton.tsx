import React, { ReactElement } from 'react';
import classNames from 'classnames';
import PlusIcon from '../../../icons/plus.svg';
import { Button, ButtonProps } from '../buttons/Button';

const GenericTagButton = ({
  tag,
  className,
  iconClass,
  action,
  ...props
}: {
  tag: string;
  className?: string;
  iconClass: string;
  action: () => unknown;
}) => (
  <Button
    {...props}
    className={classNames('font-bold typo-callout', className)}
    onClick={action}
    rightIcon={
      action ? (
        <PlusIcon
          className={`ml-2 transition-transform text-xl transform icon ${iconClass}`}
        />
      ) : null
    }
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
    className={classNames('btn-secondary', className)}
    iconClass="rotate-45"
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
    iconClass="rotate-45"
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
    iconClass="rotate-0"
    action={action}
    tag={tag}
  />
);

export interface TagButtonProps {
  tagItem: string;
  followedTags?: Array<string>;
  blockedTags?: Array<string>;
  onFollowTags?: (tags, category?) => void;
  onUnfollowTags?: (tags, category?) => void;
  onUnblockTags?: (tags) => void;
}

export default function TagButton<Tag extends keyof JSX.IntrinsicElements>({
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
        action={() => onUnblockTags({ tags: tagItem })}
      />
    );
  }

  if (!onFollowTags) {
    return (
      <div className="flex items-center px-4 h-8 font-bold bg-theme-float rounded-xl typo-callout text-theme-label-tertiary">
        <span>#{tagItem}</span>
      </div>
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
