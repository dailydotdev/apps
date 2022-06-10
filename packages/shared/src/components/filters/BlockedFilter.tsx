import React, { ReactElement } from 'react';
import { FilterMenuProps } from './common';
import SourceItemList from './SourceItemList';
import TagItemList from './TagItemList';
import useFeedSettings from '../../hooks/useFeedSettings';
import useTagAndSource from '../../hooks/useTagAndSource';
import BlockIcon from '../icons/Block';

export default function BlockedFilter({
  onUnblockItem,
}: FilterMenuProps): ReactElement {
  const { feedSettings, isLoading } = useFeedSettings();
  const { onUnblockTags, onFollowSource } = useTagAndSource({
    origin: 'blocked filter',
  });

  const tagItemAction = (event: React.MouseEvent, tag: string) => {
    onUnblockItem({
      tag,
      action: () => onUnblockTags({ tags: [tag] }),
    });
  };

  const sourceItemAction = (source) => {
    onUnblockItem({
      source,
      action: () => onFollowSource({ source }),
    });
  };

  return (
    <div className="flex flex-col" aria-busy={isLoading}>
      <p className="mx-6 mb-6 typo-callout text-theme-label-tertiary">
        Block tags and sources directly from the feed. Whenever you see a post
        with a tag/source you wish to block, click on the more options button
        (⋮) and choose “Not interested in…“.
      </p>

      <h3 className="my-3 mx-6 typo-headline">Blocked tags</h3>

      <TagItemList
        tags={feedSettings?.blockedTags}
        options={tagItemAction}
        tooltip="Unblock tag"
        emptyText="No blocked tags."
        rowIcon={<BlockIcon />}
      />

      <h3 className="mx-6 mt-10 mb-3 typo-headline">Blocked sources</h3>

      <SourceItemList
        excludeSources={feedSettings?.excludeSources}
        onSourceClick={sourceItemAction}
      />
    </div>
  );
}
