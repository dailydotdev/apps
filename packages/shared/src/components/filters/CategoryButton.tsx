import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import useTag from '../../hooks/useTag';
import { TagCategory } from '../../graphql/feedSettings';

export default function CategoryButton({
  category,
  followedTags,
}: {
  category: TagCategory;
  followedTags?: Array<string>;
}): ReactElement {
  const { onFollow, onUnfollow } = useTag();

  let action = () => onFollow({ tags: category.tags, category: category.id });
  let btnText = 'Follow all';
  let btnClass = 'btn-primary';

  const tagMatches = category?.tags.filter(
    (tag) => followedTags.indexOf(tag) !== -1,
  );

  if (tagMatches.length > 0) {
    action = () => onUnfollow({ tags: tagMatches, category: category.id });
    btnText = `Clear (${tagMatches.length})`;
    btnClass = 'btn-secondary';
  }

  return (
    <Button onClick={action} className={btnClass}>
      {btnText}
    </Button>
  );
}
