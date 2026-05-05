import type { ReactElement } from 'react';
import React from 'react';
import Markdown from '../Markdown';
import { ContentEmbeds } from '../contentEmbeds/ContentEmbeds';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { LiveRoom as LiveRoomModel } from '../../graphql/liveRooms';

export const LiveRoomLobbyContent = ({
  room,
}: {
  room: LiveRoomModel;
}): ReactElement => (
  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-1.5 pb-20 tablet:p-1.5 tablet:pb-28">
    <article className="mx-auto flex w-full max-w-[42rem] flex-col gap-5">
      {room.descriptionHtml ? (
        <Markdown
          content={room.descriptionHtml}
          className="break-words text-text-primary"
        />
      ) : (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          No agenda has been added yet.
        </Typography>
      )}
      <ContentEmbeds embeds={room.contentEmbeds} variant="post" />
    </article>
  </div>
);
