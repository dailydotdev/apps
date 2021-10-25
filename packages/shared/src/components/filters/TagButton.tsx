import React, { ReactElement } from 'react';
import PlusIcon from '../../../icons/plus.svg';
import useTag from '../../hooks/useTag';
import { Button } from '../buttons/Button';

const GenericTagButton = ({
  tag,
  className,
  iconClass,
  action,
}: {
  tag: string;
  className: string;
  iconClass: string;
  action: () => unknown;
}) => (
  <Button
    className={`mb-3 mr-3 font-bold ${className} typo-callout`}
    onClick={action}
    rightIcon={
      <PlusIcon
        className={`ml-2 transition-transform text-xl transform icon ${iconClass}`}
      />
    }
  >
    {`#${tag}`}
  </Button>
);

const UnfollowTagButton = ({
  tag,
  action,
}: {
  tag: string;
  action: () => unknown;
}) => (
  <GenericTagButton
    className="btn-primary"
    iconClass="rotate-45"
    action={action}
    tag={tag}
  />
);

const FollowTagButton = ({
  tag,
  action,
}: {
  tag: string;
  action: () => unknown;
}) => (
  <GenericTagButton
    className="btn-tag"
    iconClass="rotate-0"
    action={action}
    tag={tag}
  />
);

export default function TagButton({
  tag,
  followedTags,
}: {
  tag: string;
  followedTags?: Array<string>;
}): ReactElement {
  const { onFollow, onUnfollow } = useTag();

  if (followedTags.includes(tag)) {
    return (
      <UnfollowTagButton tag={tag} action={() => onUnfollow({ tags: [tag] })} />
    );
  }

  return <FollowTagButton tag={tag} action={() => onFollow({ tags: [tag] })} />;
}
