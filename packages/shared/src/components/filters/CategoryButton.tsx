import React, { ReactElement } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TagCategory } from '../../graphql/feedSettings';
import { TagActionArguments } from '../../hooks/useTagAndSource';

const ClearCategoryButton = ({
  matches,
  action,
}: {
  matches: number;
  action: () => unknown;
}) => (
  <Button
    onClick={action}
    className="px-4"
    variant={ButtonVariant.Secondary}
    size={ButtonSize.Small}
  >
    Clear ({matches})
  </Button>
);

const FollowCategoryButton = ({ action }: { action: () => unknown }) => (
  <Button
    onClick={action}
    className="px-4"
    variant={ButtonVariant.Primary}
    size={ButtonSize.Small}
  >
    Follow all
  </Button>
);

type CategoryButtonProps = {
  category: TagCategory;
  followedTags?: Array<string>;
  onFollowTags?: ({ tags, category }: TagActionArguments) => void;
  onUnfollowTags?: ({ tags, category }: TagActionArguments) => void;
};

export default function CategoryButton({
  category,
  followedTags,
  onFollowTags,
  onUnfollowTags,
}: CategoryButtonProps): ReactElement {
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
