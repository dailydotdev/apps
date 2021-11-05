import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
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
  onFollowTags,
  onUnfollowTags,
}: {
  category: TagCategory;
  followedTags?: Array<string>;
  onFollowTags?: (tags, category?) => void;
  onUnfollowTags?: (tags, category?) => void;
}): ReactElement {
  const tagMatches = category?.tags.filter(
    (tag) => followedTags.indexOf(tag) !== -1,
  );

  if (tagMatches.length > 0) {
    return (
      <ClearCategoryButton
        matches={tagMatches.length}
        action={() =>
          onUnfollowTags({ tags: tagMatches, category: category.id })
        }
      />
    );
  }

  return (
    <FollowCategoryButton
      action={() =>
        onFollowTags({ tags: category.tags, category: category.id })
      }
    />
  );
}
