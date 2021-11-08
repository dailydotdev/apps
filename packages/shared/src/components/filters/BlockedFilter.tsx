import React, { ReactElement } from 'react';
import { FilterMenuProps } from './common';
import SourceItemList from './SourceItemList';
import TagItemList from './TagItemList';
import useFeedSettings from '../../hooks/useFeedSettings';
import TagOptionsMenu from './TagOptionsMenu';
import useTagContext from '../../hooks/useTagContext';
import useTagAndSource from '../../hooks/useTagAndSource';

export default function BlockedFilter({
  setUnblockItem,
}: FilterMenuProps): ReactElement {
  const { feedSettings, isLoading } = useFeedSettings();
  const { onUnblockTags, onFollowSource } = useTagAndSource({
    origin: 'blocked filter',
  });
  const { contextSelectedTag, setContextSelectedTag, onTagContextOptions } =
    useTagContext();

  const sourceItemAction = (source) => {
    setUnblockItem({
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
        options={onTagContextOptions}
        emptyText="No blocked tags."
      />

      <h3 className="mx-6 mt-10 mb-3 typo-headline">Blocked sources</h3>

      <SourceItemList
        excludeSources={feedSettings?.excludeSources}
        onSourceClick={sourceItemAction}
      />

      <TagOptionsMenu
        tag={contextSelectedTag}
        onUnblock={() =>
          setUnblockItem({
            tag: contextSelectedTag,
            action: () => onUnblockTags({ tags: [contextSelectedTag] }),
          })
        }
        onHidden={() => setContextSelectedTag(null)}
      />
    </div>
  );
}
