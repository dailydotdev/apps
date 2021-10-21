import React, { ReactElement } from 'react';
import PlusIcon from '../../../icons/plus.svg';
import useTag from '../../hooks/useTag';
import { Button } from '../buttons/Button';

export default function TagButton({
  tag,
  followedTags,
}: {
  tag: string;
  followedTags?: Array<string>;
}): ReactElement {
  const { onFollow, onUnfollow } = useTag();

  let action = () => onFollow({ tags: [tag] });
  let btnClasses = 'btn-tag';
  let iconClasses = 'rotate-0';
  if (followedTags.includes(tag)) {
    action = () => onUnfollow({ tags: [tag] });
    btnClasses = 'btn-primary';
    iconClasses = 'rotate-45';
  }

  return (
    <Button
      className={`mb-3 mr-3 font-bold ${btnClasses} typo-callout`}
      onClick={action}
      rightIcon={
        <PlusIcon
          className={`ml-2 transition-transform text-xl transform icon ${iconClasses}`}
        />
      }
    >
      {`#${tag}`}
    </Button>
  );
}
