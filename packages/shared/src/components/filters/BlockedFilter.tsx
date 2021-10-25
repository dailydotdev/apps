import React, { ReactElement, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import request from 'graphql-request';
import { useQuery } from 'react-query';
import { useContextMenu } from 'react-contexify';
import { FiltersList } from './common';
import useMutateFilters, {
  getTagsFiltersQueryKey,
} from '../../hooks/useMutateFilters';
import AuthContext from '../../contexts/AuthContext';
import { apiUrl } from '../../lib/config';
import { ALL_BLOCKED_TAGS_AND_SOURCES } from '../../graphql/feedSettings';
import { Source } from '../../graphql/sources';
import SourceItemRow from './SourceItemRow';
import TagItemRow from './TagItemRow';

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

  const onOptions = (event: React.MouseEvent, tag: string): void => {
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
  }: {
    tag?: string;
    source?: Source;
    action?: () => unknown;
  }) => {
    setUnblockItem({ tag, source });
    setUnblockItemAction(() => action);
    setShowUnblockModal(true);
  };

  const unblockAction = async () => {
    await unblockItemAction();
  };

  return (
    <div aria-busy={isLoadingQuery}>
      <div className="px-6 pb-6">
        <p className="typo-callout text-theme-label-tertiary">
          Articles containing the following tags or sources will never be shown
          on your feed, even if the article contains a specifc tag that you do
          follow.
        </p>

        <h3 className="my-6 typo-headline">Blocked tags</h3>

        <FiltersList className="-mr-6">
          {blockedTagsAndSources?.feedSettings?.blockedTags?.map((tag) => (
            <TagItemRow
              tag={tag}
              key={tag}
              tooltip="Options"
              onClick={onOptions}
              menu
            />
          ))}
        </FiltersList>

        <h3 className="mt-10 mb-3 typo-headline">Blocked sources</h3>

        <p className="mb-6 typo-callout text-theme-label-tertiary">
          Blocking sources can be done from the feed. Next time you’ve seen a
          post from a source you wish to block, click on the ⋮ button and choose
          “Don’t show articles from…”
        </p>

        <FiltersList className="-mr-6 -ml-6">
          {blockedTagsAndSources?.feedSettings?.excludeSources.map((source) => (
            <SourceItemRow
              key={source.id}
              source={source}
              blocked
              onClick={() =>
                initUnblockModal({
                  source,
                  action: () => followSource({ source }),
                })
              }
            />
          ))}
        </FiltersList>
      </div>
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
