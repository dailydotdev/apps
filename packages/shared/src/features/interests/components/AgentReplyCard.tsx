import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import LogoIcon from '../../../svg/LogoIcon';
import LogoText from '../../../svg/LogoText';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { MagicIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import Markdown from '../../../components/Markdown';
import type { AgentMessage } from '../chat';
import { messageAsHtml } from '../replyText';
import { transcriptProse } from '../prose';

/**
 * One reply, as the thing that gets sent.
 *
 * Not a preview pane: a card with a top and a bottom, which is why it carries
 * who said it and whose product said it. Someone who receives this has none of
 * the surrounding screen to tell them either, and an unattributed paragraph of
 * findings is indistinguishable from a person's own notes.
 *
 * This is also what gets exported. The sheet rasterises this very node rather
 * than redrawing it, so the picture and the preview cannot disagree — an earlier
 * pass kept a hand-drawn copy of this layout and the two drifted immediately.
 * Two things follow from that and should stay: the glow is a real element rather
 * than a `::before`, because a clone does not carry pseudo-elements; and there
 * is nothing here whose size depends on the viewport.
 */
export const AgentReplyCard = forwardRef(function AgentReplyCard(
  {
    message,
    name,
  }: {
    message: AgentMessage;
    /** The agent's own name: the standing prompt it was spawned with. */
    name: string;
  },
  ref: Ref<HTMLDivElement>,
): ReactElement {
  return (
    <FlexCol ref={ref} className="agent-share-card gap-3 rounded-16 p-4">
      <span aria-hidden className="agent-share-glow" />

      <FlexRow className="items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-10 bg-brand-float">
          <MagicIcon
            size={IconSize.Small}
            className="text-brand-default"
            secondary
            aria-hidden
          />
        </span>
        <FlexCol className="min-w-0 flex-1">
          <Typography type={TypographyType.Footnote} bold truncate>
            {name}
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            Agent
            {message.at && (
              <>
                {' · '}
                <DateFormat date={message.at} type={TimeFormatType.Post} />
              </>
            )}
          </Typography>
        </FlexCol>

        {/* Opposite the agent, and at a size a signature should be read at: it
            is the one thing on the card that says where any of this came from,
            and a card that travels has no surrounding screen to say it. */}
        <FlexRow className="shrink-0 items-center gap-1.5">
          <LogoIcon className={{ container: 'h-5 w-auto' }} />
          <LogoText className={{ container: 'h-5 w-auto' }} />
        </FlexRow>
      </FlexRow>

      {/* Clipped, with the last line running out rather than being cut: a card
          is a taste of the reply, and a hard edge reads as content the sheet
          lost. */}
      <div className="relative max-h-52 overflow-hidden">
        <Markdown
          className={transcriptProse}
          content={messageAsHtml(message)}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background-subtle to-transparent"
        />
      </div>
    </FlexCol>
  );
});
