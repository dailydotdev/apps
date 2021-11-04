import React, { ReactElement, useContext, useState } from 'react';
import { UnblockModalType } from './common';
import useMutateFilters from '../../hooks/useMutateFilters';
import { Source } from '../../graphql/sources';
import SourceItemList from './SourceItemList';
import TagItemList from './TagItemList';
import AuthContext from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import TagOptionsMenu from './TagOptionsMenu';
import UnblockModal from '../modals/UnblockModal';
import { Tag } from '../../graphql/feedSettings';
import useTagContext from '../../hooks/useTagContext';
import useDisableFilterAlert from '../../hooks/useDisableFilterAlert';

export default function BlockedFilter(): ReactElement {
  const { user } = useContext(AuthContext);
  const [unblockItem, setUnblockItem] = useState<{
    tag?: Tag;
    source?: Source;
    action?: () => unknown;
  }>();
  const { feedSettings, isLoading } = useFeedSettings();
  useDisableFilterAlert(feedSettings);
  const { unblockTag, followSource } = useMutateFilters(user);
  const { contextSelectedTag, setContextSelectedTag, onTagContextOptions } =
    useTagContext();

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
          initUnblockModal({
            tag: contextSelectedTag,
            action: () => unblockTag({ tags: [contextSelectedTag] }),
          })
        }
        onHidden={() => setContextSelectedTag(null)}
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
