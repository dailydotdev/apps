import React, { HTMLAttributes, ReactElement } from 'react';
import { FilterItem } from './common';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import TagButton from './TagButton';
import { TagActionArguments } from '../../hooks/useTagAndSource';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

type TagItemRowProps = {
  tooltip: string;
  tag: string;
  rowIcon: ReactElement;
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
  rowIcon,
  followedTags,
  blockedTags,
  onFollowTags,
  onUnfollowTags,
  onUnblockTags,
  onClick,
}: TagItemRowProps &
  Omit<HTMLAttributes<HTMLAnchorElement>, 'onClick'>): ReactElement {
  return (
    <FilterItem className="relative my-2 pl-6">
      <TagButton
        className={!onFollowTags ? 'cursor-default' : ''}
        size={ButtonSize.Small}
        followedTags={followedTags}
        blockedTags={blockedTags}
        tagItem={tag}
        onFollowTags={onFollowTags}
        onUnfollowTags={onUnfollowTags}
        onUnblockTags={onUnblockTags}
      />
      <SimpleTooltip placement="left" content={tooltip}>
        <Button
          className="absolute right-4 my-auto"
          variant={ButtonVariant.Tertiary}
          onClick={(event) => onClick?.(event, tag)}
          icon={rowIcon}
        />
      </SimpleTooltip>
    </FilterItem>
  );
}
