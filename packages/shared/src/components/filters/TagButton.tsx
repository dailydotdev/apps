import React, { ReactElement } from 'react';
import classNames from 'classnames';
import PlusIcon from '../../../icons/plus.svg';
import useTag from '../../hooks/useTag';
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
}

export default function TagButton<Tag extends keyof JSX.IntrinsicElements>({
  tagItem,
  followedTags,
  ...props
}: ButtonProps<Tag> & TagButtonProps): ReactElement {
  const { onFollow, onUnfollow } = useTag();

  if (followedTags?.includes(tagItem)) {
    return (
      <UnfollowTagButton
        {...props}
        tag={tagItem}
        action={
          followedTags?.length ? () => onUnfollow({ tags: [tagItem] }) : null
        }
      />
    );
  }

  return (
    <FollowTagButton
      {...props}
      tag={tagItem}
      action={followedTags?.length ? () => onFollow({ tags: [tagItem] }) : null}
    />
  );
}
