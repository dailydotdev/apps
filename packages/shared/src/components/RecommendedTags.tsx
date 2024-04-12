import React, { ReactElement } from 'react';
import { ElementPlaceholder } from './ElementPlaceholder';
import { TagLink } from './TagLinks';
import type { Tag } from '../graphql/feedSettings';

interface RecommendedTagsProps {
  isLoading: boolean;
  tags: Tag[];
}
export const RecommendedTags = ({
  isLoading,
  tags,
}: RecommendedTagsProps): ReactElement => {
  if (isLoading) {
    return (
      <div>
        <ElementPlaceholder className="mb-3 h-4 w-1/5 rounded-12" />
        <div className="flex gap-2">
          <ElementPlaceholder className="h-6 w-12 rounded-8" />
          <ElementPlaceholder className="h-6 w-12 rounded-8" />
          <ElementPlaceholder className="h-6 w-12 rounded-8" />
        </div>
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-3 text-text-tertiary typo-caption1">Related tags:</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {tags.map((relatedTag) => (
          <TagLink key={relatedTag.name} tag={relatedTag.name} />
        ))}
      </div>
    </div>
  );
};
