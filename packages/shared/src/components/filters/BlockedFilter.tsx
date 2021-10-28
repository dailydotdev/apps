import React, { ReactElement, useContext, useState } from 'react';
import { useContextMenu } from 'react-contexify';
import { UnblockModalType } from './common';
import useMutateFilters from '../../hooks/useMutateFilters';
import { Source } from '../../graphql/sources';
import SourceItemList from './SourceItemList';
import TagItemList from './TagItemList';
import AuthContext from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import TagOptionsMenu from './TagOptionsMenu';
import UnblockModal from '../modals/UnblockModal';

export default function BlockedFilter(): ReactElement {
  const { user } = useContext(AuthContext);
  const [selectedTag, setSelectedTag] = useState<string>();
  const [unblockItem, setUnblockItem] = useState<{
    tag?: string;
    source?: Source;
    action?: () => unknown;
  }>();
  const { show: showTagOptionsMenu } = useContextMenu({
    id: 'tag-options-context',
  });
  const { feedSettings, isLoading } = useFeedSettings();
  const { unblockTag, followSource } = useMutateFilters(user);

  const onTagContextOptions = (event: React.MouseEvent, tag: string): void => {
    setSelectedTag(tag);
    const { right, bottom } = event.currentTarget.getBoundingClientRect();
    showTagOptionsMenu(event, {
      position: { x: right - 112, y: bottom + 4 },
    });
  };

  const initUnblockModal = ({
    tag = null,
    source = null,
    action,
  }: UnblockModalType) => {
    setUnblockItem({ tag, source, action });
  };

  const sourceItemAction = (source) => {
    initUnblockModal({
      source,
      action: () => followSource({ source }),
    });
  };

  return (
    <div className="flex flex-col" aria-busy={isLoading}>
      <p className="mx-6 mb-6 typo-callout text-theme-label-tertiary">
        Blocking tags and sources can be done from the feed. Next time you seen
        a post with a tag or source you wish to block, click on the ⋮ button and
        click “Not interested in…”.
      </p>

      <h3 className="my-3 mx-6 typo-headline">Blocked tags</h3>

      <TagItemList
        blockedTags={feedSettings?.blockedTags}
        options={onTagContextOptions}
      />

      <h3 className="mx-6 mt-10 mb-3 typo-headline">Blocked sources</h3>

      <SourceItemList
        excludeSources={feedSettings?.excludeSources}
        onSourceClick={sourceItemAction}
      />

      <TagOptionsMenu
        tag={selectedTag}
        onUnblock={() =>
          initUnblockModal({
            tag: selectedTag,
            action: () => unblockTag({ tags: [selectedTag] }),
          })
        }
        onHidden={() => setSelectedTag(null)}
      />

      {unblockItem && (
        <UnblockModal
          item={unblockItem}
          isOpen={!!unblockItem}
          onConfirm={unblockItem.action}
          onRequestClose={() => setUnblockItem(null)}
        />
      )}
    </div>
  );
}
