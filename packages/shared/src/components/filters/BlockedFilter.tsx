import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import type { FilterMenuProps } from './common';
import SourceItemList from './SourceItemList';
import TagItemList from './TagItemList';
import useFeedSettings from '../../hooks/useFeedSettings';
import useTagAndSource from '../../hooks/useTagAndSource';
import { BlockIcon } from '../icons';
import { Origin } from '../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { usePlusSubscription } from '../../hooks';

const BlockedWords = dynamic(() =>
  import(/* webpackChunkName: "blockedWords" */ './BlockedWords').then(
    (mod) => mod.BlockedWords,
  ),
);

export default function BlockedFilter({
  onUnblockItem,
}: FilterMenuProps): ReactElement {
  const { showPlusSubscription } = usePlusSubscription();
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
    <div className="flex flex-col gap-5" aria-busy={isLoading}>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Customize your feed by blocking what you don’t want to see. Remove{' '}
        {showPlusSubscription ? 'specific words,' : undefined} tags or sources
        to create a more personalized and focused experience.
      </Typography>

      {showPlusSubscription ? <BlockedWords /> : undefined}

      <div>
        <h3 className="font-bold typo-body">Blocked tags</h3>
        <TagItemList
          tags={feedSettings?.blockedTags}
          options={tagItemAction}
          tooltip="Unblock tag"
          emptyText="No blocked tags."
          rowIcon={<BlockIcon />}
        />
      </div>

      <div>
        <h3 className="font-bold typo-body">Blocked sources</h3>
        <SourceItemList
          excludeSources={feedSettings?.excludeSources}
          onSourceClick={sourceItemAction}
        />
      </div>
    </div>
  );
}
