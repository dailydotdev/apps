import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import { BlockIcon, VIcon } from '../../icons';
import { Checkbox } from '../../fields/Checkbox';
import { useSourceModerationList } from '../../../hooks/squads/useSourceModerationList';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { SquadModerationItem } from './SquadModerationItem';
import type { Squad } from '../../../graphql/sources';
import type { SourcePostModeration } from '../../../graphql/squads';
import {
  SourcePostModerationFilter,
  SourcePostModerationStatus,
} from '../../../graphql/squads';
import { EmptyModerationList } from './SquadModerationEmptyScreen';
import InfiniteScrolling from '../../containers/InfiniteScrolling';
import { useIsPhone } from '../../../hooks/useViewSize';
import { ShellDockedRow } from '../../shell/ShellPageContext';
import { Segments, ShellRow } from '../../shell/ShellRow';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../layout/SquadDirectoryNavbar';

interface SquadModerationListProps {
  squad?: Squad;
  isModerator: boolean;
}

enum QueueFilter {
  All = 'All',
  Flagged = 'Flagged',
  FirstPost = 'Newcomers',
}

const queueFilterValue: Record<
  QueueFilter,
  SourcePostModerationFilter | undefined
> = {
  [QueueFilter.All]: undefined,
  [QueueFilter.Flagged]: SourcePostModerationFilter.Flagged,
  [QueueFilter.FirstPost]: SourcePostModerationFilter.FirstPost,
};

const emptyFilterCopy: Record<
  QueueFilter,
  { title: string; description: string } | undefined
> = {
  [QueueFilter.All]: undefined,
  [QueueFilter.Flagged]: {
    title: 'Nothing flagged',
    description:
      'Posts shared in several Squads, or already shared here, show up here.',
  },
  [QueueFilter.FirstPost]: {
    title: 'No newcomers waiting',
    description:
      'Posts from members who have not posted here yet show up here.',
  },
};

interface SelectionBarProps {
  selected: SourcePostModeration[];
  total: number;
  onSelectAll: (isSelected: boolean) => void;
  isPending: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const SelectionBar = ({
  selected,
  total,
  onSelectAll,
  isPending,
  onApprove,
  onReject,
}: SelectionBarProps): ReactElement => (
  <div className="flex w-full items-center gap-2">
    <Checkbox
      name="select-all-pending-posts"
      checked={selected.length === total}
      indeterminate={selected.length > 0 && selected.length < total}
      onToggleCallback={onSelectAll}
      className="!pr-0"
      checkmarkClassName="!mr-2"
    >
      <span className="tabular-nums">{selected.length} selected</span>
    </Checkbox>
    <span className="ml-auto flex gap-2">
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        icon={<BlockIcon />}
        disabled={isPending}
        onClick={onReject}
      >
        Decline
      </Button>
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        icon={<VIcon secondary />}
        disabled={isPending}
        onClick={onApprove}
      >
        Approve
      </Button>
    </span>
  </div>
);

export function SquadModerationList({
  squad,
  isModerator,
}: SquadModerationListProps): ReactElement {
  const isPhone = useIsPhone();
  const moderate = useSourceModerationList();
  const [filter, setFilter] = useState(QueueFilter.All);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isFetched, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSquadPendingPosts({
      squadId: squad?.id,
      status: isModerator
        ? [SourcePostModerationStatus.Pending]
        : [
            SourcePostModerationStatus.Pending,
            SourcePostModerationStatus.Rejected,
          ],
      filter: isModerator ? queueFilterValue[filter] : undefined,
    });

  const list = useMemo(
    () =>
      data?.pages.flatMap((page) => page.edges).flatMap(({ node }) => node) ??
      [],
    [data],
  );
  // Posts leave the selection as they leave the queue.
  const selected = list.filter(({ id }) => selectedIds.includes(id));
  const canSelect = isModerator && (list.length > 1 || selected.length > 0);

  const onSelectAll = (isSelected: boolean) =>
    setSelectedIds(isSelected ? list.map(({ id }) => id) : []);
  const onToggleSelect = (id: string) => (isSelected: boolean) =>
    setSelectedIds((ids) =>
      isSelected ? [...ids, id] : ids.filter((itemId) => itemId !== id),
    );
  const onFilter = (value: QueueFilter) => {
    setFilter(value);
    setSelectedIds([]);
  };

  const selectionBar = selected.length > 0 && (
    <SelectionBar
      selected={selected}
      total={list.length}
      onSelectAll={onSelectAll}
      isPending={moderate.isPending}
      onApprove={() => moderate.onApprove(selected)}
      onReject={() => moderate.onReject(selected)}
    />
  );

  return (
    <div className="flex flex-col">
      {isModerator && isPhone && (
        <ShellDockedRow>
          <ShellRow>
            {selectionBar || (
              <Segments
                items={Object.values(QueueFilter).map((item) => ({
                  key: item,
                  label: item,
                  active: filter === item,
                  onClick: () => onFilter(item),
                }))}
              />
            )}
          </ShellRow>
        </ShellDockedRow>
      )}
      {isModerator && (
        <div className="hidden items-center gap-4 border-b border-border-subtlest-tertiary px-6 py-3 tablet:flex">
          <SquadDirectoryNavbar
            aria-label="Queue filters"
            className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
          >
            {Object.values(QueueFilter).map((item) => (
              <SquadDirectoryNavbarItem
                key={item}
                buttonSize={ButtonSize.Small}
                isActive={filter === item}
                label={item}
                ariaLabel={item}
                onClick={() => onFilter(item)}
              />
            ))}
          </SquadDirectoryNavbar>
          {canSelect && !selected.length && (
            <Checkbox
              name="select-all-pending-posts"
              checked={false}
              onToggleCallback={onSelectAll}
              className="!pr-0"
              checkmarkClassName="!mr-2"
            >
              Select all
            </Checkbox>
          )}
        </div>
      )}
      {list.length ? (
        <InfiniteScrolling
          canFetchMore={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        >
          {list.map((item) => (
            <SquadModerationItem
              key={item.id}
              squad={squad}
              data={item}
              isModerator={isModerator}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={canSelect ? onToggleSelect(item.id) : undefined}
            />
          ))}
        </InfiniteScrolling>
      ) : (
        <EmptyModerationList
          isModerator={isModerator}
          isFetched={isFetched}
          {...emptyFilterCopy[filter]}
        />
      )}
      {selectionBar && !isPhone && (
        <div className="sticky bottom-0 z-2 flex border-t border-border-subtlest-tertiary bg-background-default px-6 py-3 laptop:rounded-b-16">
          {selectionBar}
        </div>
      )}
    </div>
  );
}
