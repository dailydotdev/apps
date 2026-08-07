import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import { webappUrl } from '../../../lib/constants';
import type { AgentMonitorItem } from './AgentMonitor';
import { AgentState } from './AgentMonitor';

// Two, then a count. Any more and the field is buried under its own news.
const shownByDefault = 2;

/**
 * A finding waiting on you, as one row.
 *
 * Built like a pull-request row: the state first, as a coloured word, then
 * whose it is, then what it says, with everything else muted on the right. No
 * leading tile and no solid button — a stack of these has to read as a shelf
 * you scan, not as four alerts.
 */
const Chip = ({
  item,
  onDismiss,
}: {
  item: AgentMonitorItem;
  onDismiss: () => void;
}): ReactElement => (
  <FlexRow className="relative items-center gap-2 rounded-10 bg-surface-float py-1.5 pl-2 pr-1 transition-colors hover:bg-surface-hover">
    <AgentState state={item.state} />
    <Link href={`${webappUrl}agent/${item.id}`}>
      {/* Stretched over the row, so the whole thing opens the agent while the
          dismiss keeps a hit area of its own. */}
      <a className="min-w-0 shrink-0 after:absolute after:inset-0 after:rounded-10">
        <Typography
          type={TypographyType.Caption1}
          bold
          className="max-w-[9rem] truncate"
        >
          {item.name}
        </Typography>
      </a>
    </Link>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="min-w-0 flex-1 truncate"
    >
      {item.line}
    </Typography>
    {/* When, not how many: the run's own sentence already says what it kept,
        and the reader wants to know how stale this is. */}
    {item.at && (
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
        className="shrink-0 tabular-nums"
      >
        <DateFormat date={item.at} type={TimeFormatType.LastActivity} />
      </Typography>
    )}
    <Button
      icon={<MiniCloseIcon size={IconSize.Size16} />}
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Tertiary}
      className="relative z-1 shrink-0"
      aria-label={`Dismiss the update from ${item.name}`}
      onClick={onDismiss}
    />
  </FlexRow>
);

/**
 * Findings waiting on you, stacked over the field.
 *
 * The monitor under the field is ambient — it says what is happening and asks
 * for nothing. This is the other half: an agent that came back with something
 * is a piece of work with your name on it, so it gets a row of its own above
 * the field and stays there until you open it or wave it off.
 */
export const AgentReviewChips = ({
  items,
}: {
  items: AgentMonitorItem[];
}): ReactElement | null => {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isExpanded, setExpanded] = useState(false);
  const waiting = items.filter(({ id }) => !dismissed.includes(id));

  if (!waiting.length) {
    return null;
  }

  const shown = isExpanded ? waiting : waiting.slice(0, shownByDefault);
  const hidden = waiting.length - shown.length;

  return (
    <FlexCol className="gap-1">
      {shown.map((item) => (
        <Chip
          key={item.id}
          item={item}
          onDismiss={() => setDismissed((current) => [...current, item.id])}
        />
      ))}
      {!!hidden && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="px-2 py-0.5 text-left text-text-tertiary typo-caption2 hover:text-text-primary"
        >
          {`Show ${hidden} more`}
        </button>
      )}
    </FlexCol>
  );
};
