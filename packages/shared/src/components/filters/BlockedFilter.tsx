import React, { ReactElement, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import request from 'graphql-request';
import { useQuery } from 'react-query';
import { useContextMenu } from 'react-contexify';
import { UnblockModalType } from './common';
import useMutateFilters, {
  getTagsFiltersQueryKey,
} from '../../hooks/useMutateFilters';
import AuthContext from '../../contexts/AuthContext';
import { apiUrl } from '../../lib/config';
import { ALL_BLOCKED_TAGS_AND_SOURCES } from '../../graphql/feedSettings';
import { Source } from '../../graphql/sources';
import SourceItemList from './SourceItemList';
import TagItemList from './TagItemList';

const TagOptionsMenu = dynamic(
  () => import(/* webpackChunkName: "tagOptionsMenu" */ './TagOptionsMenu'),
);

const UnblockModal = dynamic(
  () => import(/* webpackChunkName: "unblockModal" */ '../modals/UnblockModal'),
);

export default function BlockedFilter(): ReactElement {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [selectedTag, setSelectedTag] = useState<string>();
  const [unblockItem, setUnblockItem] =
    useState<{ tag: string; source: Source }>();
  const [unblockItemAction, setUnblockItemAction] = useState<() => unknown>();
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const { show: showTagOptionsMenu } = useContextMenu({
    id: 'tag-options-context',
  });
  const { unblockTag, followSource } = useMutateFilters(user);

  const filtersKey = getTagsFiltersQueryKey(user);
  const { data: blockedTagsAndSources, isLoading: isLoadingQuery } = useQuery(
    filtersKey,
    () => request(`${apiUrl}/graphql`, ALL_BLOCKED_TAGS_AND_SOURCES),
    {
      enabled: tokenRefreshed,
    },
  );

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
    setUnblockItem({ tag, source });
    setUnblockItemAction(() => action);
    setShowUnblockModal(true);
  };

  const unblockAction = async () => {
    await unblockItemAction();
  };

  const sourceItemAction = (source) => {
    initUnblockModal({
      source,
      action: () => followSource({ source }),
    });
  };

  return (
    <div className="px-6 pb-6" aria-busy={isLoadingQuery}>
      <p className="typo-callout text-theme-label-tertiary">
        Blocking tags and sources can be done from the feed. Next time you seen
        a post with a tag or source you wish to block, click on the ⋮ button and
        click “Not interested in…”.
      </p>

      <h3 className="my-6 typo-headline">Blocked tags</h3>

      <TagItemList
        blockedTags={blockedTagsAndSources?.feedSettings?.blockedTags}
        options={onTagContextOptions}
      />

      <h3 className="mt-10 mb-6 typo-headline">Blocked sources</h3>

      <SourceItemList
        excludeSources={blockedTagsAndSources?.feedSettings?.excludeSources}
        action={sourceItemAction}
      />

      <TagOptionsMenu
        showViewButton={selectedTag}
        onUnblock={() =>
          initUnblockModal({
            tag: selectedTag,
            action: () => unblockTag({ tags: [selectedTag] }),
          })
        }
        onHidden={() => setSelectedTag(null)}
      />

      {showUnblockModal && (
        <UnblockModal
          item={unblockItem}
          isOpen={showUnblockModal}
          action={unblockAction}
          onRequestClose={() => setShowUnblockModal(false)}
        />
      )}
    </div>
  );
}
