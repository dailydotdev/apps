import React, { ReactElement } from 'react';
import { ClickableText } from '../buttons/ClickableText';
import { SearchChunkSource } from '../../graphql/search';

interface SearchSourceItemProps {
  item: SearchChunkSource;
}

export function SearchSourceItem({
  item,
}: SearchSourceItemProps): ReactElement {
  if (!item) return null;

  const { name, snippet, url } = item;

  return (
    <div className="w-60 laptop:w-full">
      <ClickableText
        tag="a"
        target="_blank"
        href={url}
        className="mb-2 typo-callout"
      >
        {name}
      </ClickableText>
      <p className="line-clamp-4 typo-footnote text-theme-label-tertiary multi-truncate">
        {snippet}
      </p>
    </div>
  );
}
