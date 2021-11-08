import React, { HTMLAttributes, ReactElement } from 'react';
import { FilterItem } from './common';
import { getTooltipProps } from '../../lib/tooltip';
import { Button } from '../buttons/Button';
import BlockIcon from '../../../icons/block.svg';
import TagButton from './TagButton';
import { TagActionArguments } from '../../hooks/useTagAndSource';

type TagItemRowProps = {
  tooltip: string;
  tag: string;
  followedTags?: Array<string>;
  blockedTags?: Array<string>;
  onFollowTags?: ({ tags, category }: TagActionArguments) => void;
  onUnfollowTags?: ({ tags, category }: TagActionArguments) => void;
  onUnblockTags?: ({ tags }: TagActionArguments) => void;
  onClick?: (event: React.MouseEvent, tag: string) => unknown;
};

export default function TagItemRow({
  tooltip,
  tag,
  followedTags,
  blockedTags,
  onFollowTags,
  onUnfollowTags,
  onUnblockTags,
  onClick,
}: TagItemRowProps &
  Omit<HTMLAttributes<HTMLAnchorElement>, 'onClick'>): ReactElement {
  return (
    <FilterItem className="relative pl-6 my-2">
      <TagButton
        className={!onFollowTags ? 'cursor-default' : ''}
        buttonSize="small"
        followedTags={followedTags}
        blockedTags={blockedTags}
        tagItem={tag}
        onFollowTags={onFollowTags}
        onUnfollowTags={onUnfollowTags}
        onUnblockTags={onUnblockTags}
      />
      <Button
        className="right-4 my-auto btn-tertiary"
        style={{ position: 'absolute' }}
        onClick={(event) => onClick?.(event, tag)}
        icon={<BlockIcon />}
        {...getTooltipProps(tooltip, {
          position: 'left',
        })}
      />
    </FilterItem>
  );
}
