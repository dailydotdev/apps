import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import useTag from '../../hooks/useTag';
import { TagCategory } from '../../graphql/feedSettings';

const ClearCategoryButton = ({
  matches,
  action,
}: {
  matches: number;
  action: () => unknown;
}) => (
  <Button onClick={action} className="px-4 btn-secondary small">
    Clear ({matches})
  </Button>
);

const FollowCategoryButton = ({ action }: { action: () => unknown }) => (
  <Button onClick={action} className="px-4 btn-primary small">
    Follow all
  </Button>
);

export default function CategoryButton({
  category,
  followedTags,
}: {
  category: TagCategory;
  followedTags?: Array<string>;
}): ReactElement {
  const { onFollow, onUnfollow } = useTag();

  const tagMatches = category?.tags.filter(
    (tag) => followedTags.indexOf(tag) !== -1,
  );

  if (tagMatches.length > 0) {
    return (
      <ClearCategoryButton
        matches={tagMatches.length}
        action={() => onUnfollow({ tags: tagMatches, category: category.id })}
      />
    );
  }

  return (
    <FollowCategoryButton
      action={() => onFollow({ tags: category.tags, category: category.id })}
    />
  );
}
