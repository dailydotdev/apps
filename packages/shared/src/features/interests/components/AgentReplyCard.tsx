import type { ReactElement } from 'react';
import React from 'react';
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
 * Built in DOM rather than rendered to a picture so the text stays selectable
 * and the citations stay clickable. It is laid out to survive being turned into
 * one later — fixed padding, nothing that depends on the viewport — so if this
 * ever becomes a real exported image, this component is what gets exported.
 */
export const AgentReplyCard = ({
  message,
  name,
}: {
  message: AgentMessage;
  /** The agent's own name: the standing prompt it was spawned with. */
  name: string;
}): ReactElement => (
  <FlexCol className="agent-share-card gap-3 rounded-16 p-4">
    <FlexRow className="items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-10 bg-brand-float">
        <MagicIcon
          size={IconSize.Size16}
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
    </FlexRow>

    {/* Clipped, with the last line running out rather than being cut: a card is
        a taste of the reply, and a hard edge reads as content the sheet lost. */}
    <div className="relative max-h-52 overflow-hidden">
      <Markdown className={transcriptProse} content={messageAsHtml(message)} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background-subtle to-transparent"
      />
    </div>

    {/* The mark, quiet and in the corner, the way a screenshot is signed. */}
    <FlexRow className="items-center justify-end gap-1 opacity-40">
      <LogoIcon className={{ container: 'h-3 w-auto' }} />
      <LogoText className={{ container: 'h-3 w-auto' }} />
    </FlexRow>
  </FlexCol>
);
