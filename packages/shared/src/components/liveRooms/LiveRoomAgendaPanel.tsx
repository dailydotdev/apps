import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import Markdown from '../Markdown';
import { ContentEmbeds } from '../contentEmbeds/ContentEmbeds';
import type { ContentEmbed } from '../../graphql/posts';

interface LiveRoomAgendaPanelProps {
  descriptionHtml?: string | null;
  contentEmbeds?: ContentEmbed[];
}

export const LiveRoomAgendaPanel = ({
  descriptionHtml,
  contentEmbeds,
}: LiveRoomAgendaPanelProps): ReactElement => {
  const hasEmbeds = !!contentEmbeds && contentEmbeds.length > 0;
  const hasDescription = !!descriptionHtml;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4 tablet:p-5">
      {hasDescription ? (
        <Markdown
          content={descriptionHtml}
          className="break-words text-text-primary"
          openLinksInNewTab
        />
      ) : null}
      {hasEmbeds ? (
        <ContentEmbeds embeds={contentEmbeds} variant="post" />
      ) : null}
      {!hasDescription && !hasEmbeds ? (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          The host hasn&apos;t shared an agenda yet. Drop into the chat to ask
          what&apos;s on the docket.
        </Typography>
      ) : null}
    </div>
  );
};
