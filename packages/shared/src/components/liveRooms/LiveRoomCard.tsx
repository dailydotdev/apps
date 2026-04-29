import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  type LiveRoom,
  LiveRoomMode,
  LiveRoomStatus,
} from '../../graphql/liveRooms';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { UserIcon } from '../icons';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { FlexCol, FlexRow } from '../utilities';
import { largeNumberFormat } from '../../lib/numberFormat';

interface LiveRoomCardProps {
  room: LiveRoom;
  onJoin: (room: LiveRoom) => void;
  isJoining?: boolean;
}

const statusLabel: Record<LiveRoomStatus, string> = {
  [LiveRoomStatus.Live]: 'Live',
  [LiveRoomStatus.Created]: 'Starting',
  [LiveRoomStatus.Ended]: 'Ended',
};

const statusBadgeClass: Record<LiveRoomStatus, string> = {
  [LiveRoomStatus.Live]: 'bg-status-error text-white',
  [LiveRoomStatus.Created]: 'bg-surface-float text-text-secondary',
  [LiveRoomStatus.Ended]: 'bg-surface-float text-text-tertiary',
};

const modeLabel: Record<LiveRoomMode, string> = {
  [LiveRoomMode.Moderated]: 'Moderated',
  [LiveRoomMode.FreeForAll]: 'Free for all',
};

export const LiveRoomCard = ({
  room,
  onJoin,
  isJoining,
}: LiveRoomCardProps): ReactElement => {
  const watchingLabel =
    typeof room.participantCount === 'number'
      ? `${
          largeNumberFormat(room.participantCount) ?? room.participantCount
        } watching`
      : null;

  return (
    <FlexCol className="gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <FlexRow className="items-center gap-2">
        <span
          className={classNames(
            'inline-flex items-center gap-1 rounded-6 px-2 py-0.5 font-bold uppercase typo-caption2',
            statusBadgeClass[room.status],
          )}
        >
          {room.status === LiveRoomStatus.Live ? (
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
          ) : null}
          {statusLabel[room.status]}
        </span>
        <span className="rounded-6 border border-border-subtlest-tertiary px-2 py-0.5 text-text-tertiary typo-caption2">
          {modeLabel[room.mode]}
        </span>
      </FlexRow>

      <Typography type={TypographyType.Title3} bold className="line-clamp-2">
        {room.topic}
      </Typography>

      {watchingLabel ? (
        <FlexRow className="items-center gap-1 text-text-tertiary">
          <UserIcon size={IconSize.Size16} />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {watchingLabel}
          </Typography>
        </FlexRow>
      ) : null}

      <FlexRow className="items-center justify-between gap-2">
        <FlexRow className="min-w-0 items-center gap-2">
          <ProfilePicture user={room.host} size={ProfileImageSize.Small} />
          <FlexCol className="min-w-0">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Primary}
              bold
              truncate
            >
              {room.host.name}
            </Typography>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              truncate
            >
              @{room.host.username}
            </Typography>
          </FlexCol>
        </FlexRow>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={() => onJoin(room)}
          loading={isJoining}
        >
          Join
        </Button>
      </FlexRow>
    </FlexCol>
  );
};
