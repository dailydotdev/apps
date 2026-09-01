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

// The share sheet rasterises this node through a clone, so nothing here may be
// a pseudo-element (a clone drops them) or sized off the viewport.
export const AgentReplyCard = forwardRef(function AgentReplyCard(
  {
    message,
    name,
  }: {
    message: AgentMessage;
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

        <FlexRow className="shrink-0 items-center gap-1.5">
          <LogoIcon className={{ container: 'h-5 w-auto' }} />
          <LogoText className={{ container: 'h-5 w-auto' }} />
        </FlexRow>
      </FlexRow>

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
