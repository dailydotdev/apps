import React, { ReactElement } from 'react';
import { FilterMenuProps } from './common';
import SourceItemList from './SourceItemList';
import TagItemList from './TagItemList';
import useFeedSettings from '../../hooks/useFeedSettings';
import useTagAndSource from '../../hooks/useTagAndSource';
import { BlockIcon } from '../icons';
import { Origin } from '../../lib/log';

export default function BlockedFilter({
  onUnblockItem,
}: FilterMenuProps): ReactElement {
  const { feedSettings, isLoading } = useFeedSettings();
  const { onUnblockTags, onUnblockSource } = useTagAndSource({
    origin: Origin.BlockedFilter,
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
      action: () => onUnblockSource({ source }),
    });
  };

  return (
    <div className="flex flex-col" aria-busy={isLoading}>
      <p className="mx-6 mb-6 text-text-tertiary typo-callout">
        Block tags and sources directly from the feed. Whenever you see a post
        with a tag/source you wish to block, click on the more options button
        (⋮) and choose “Not interested in…“.
      </p>

      <h3 className="mx-6 my-3 font-bold typo-body">Blocked tags</h3>

      <TagItemList
        tags={feedSettings?.blockedTags}
        options={tagItemAction}
        tooltip="Unblock tag"
        emptyText="No blocked tags."
        rowIcon={<BlockIcon />}
      />

      <h3 className="mx-6 mb-3 mt-10 font-bold typo-body">Blocked sources</h3>

      <SourceItemList
        excludeSources={feedSettings?.excludeSources}
        onSourceClick={sourceItemAction}
      />
    </div>
  );
}
