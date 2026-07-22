import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { HotTake } from '../../../../graphql/user/userHotTake';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  ButtonColor,
} from '../../../../components/buttons/Button';
import { EditIcon, TrashIcon, UpvoteIcon } from '../../../../components/icons';
import InteractionCounter from '../../../../components/InteractionCounter';
import { IconSize } from '../../../../components/Icon';
import { QuaternaryButton } from '../../../../components/buttons/QuaternaryButton';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { useEngagementBarV2 } from '../../../../hooks/useEngagementBarV2';
import { HotTakeItem as HotTakeItemV2 } from './HotTakeItem.v2';
import { HotTakeShareButton } from './HotTakeShareButton';
import { getHotTakeShareText, getHotTakesProfileUrl } from './common';

interface HotTakeItemProps {
  item: HotTake;
  isOwner: boolean;
  /** When set, a flag-gated share control is rendered in the action area. */
  ownerUsername?: string;
  onEdit?: (item: HotTake) => void;
  onDelete?: (item: HotTake) => void;
  onUpvoteClick?: (item: HotTake) => void;
}

function HotTakeItemV1({
  item,
  isOwner,
  ownerUsername,
  onEdit,
  onDelete,
  onUpvoteClick,
}: HotTakeItemProps): ReactElement {
  const { emoji, title, subtitle } = item;
  const isUpvoteActive = item.upvoted;

  return (
    <div
      className={classNames(
        'group relative flex items-center gap-4 rounded-16 p-4',
        'bg-surface-float',
        'transition-all duration-200',
        'hover:bg-surface-hover',
      )}
    >
      <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-14 bg-overlay-quaternary-cabbage">
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {subtitle}
          </Typography>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isOwner && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<EditIcon />}
                onClick={() => onEdit(item)}
                aria-label="Edit hot take"
              />
            )}
            {onDelete && (
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<TrashIcon />}
                onClick={() => onDelete(item)}
                aria-label="Delete hot take"
              />
            )}
          </div>
        )}
        {ownerUsername && (
          <HotTakeShareButton
            link={getHotTakesProfileUrl(ownerUsername)}
            text={getHotTakeShareText({ title, username: ownerUsername })}
            label={`Share "${title}"`}
            targetId={item.id}
            surface="profile item"
            buttonSize={ButtonSize.XSmall}
          />
        )}
        {onUpvoteClick && (
          <Tooltip
            content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
            side="bottom"
          >
            <QuaternaryButton
              labelClassName="!pl-[1px]"
              className="btn-tertiary-avocado"
              color={ButtonColor.Avocado}
              pressed={isUpvoteActive}
              onClick={() => onUpvoteClick(item)}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={
                <UpvoteIcon secondary={isUpvoteActive} size={IconSize.XSmall} />
              }
            >
              {item.upvotes > 0 && (
                <InteractionCounter
                  className={classNames(
                    'tabular-nums typo-footnote',
                    !item.upvotes && 'invisible',
                  )}
                  value={item.upvotes}
                />
              )}
            </QuaternaryButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export function HotTakeItem(props: HotTakeItemProps): ReactElement {
  const useV2 = useEngagementBarV2();
  if (useV2) {
    return <HotTakeItemV2 {...props} />;
  }
  return <HotTakeItemV1 {...props} />;
}
