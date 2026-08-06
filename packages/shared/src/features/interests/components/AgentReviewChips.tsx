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
import { webappUrl } from '../../../lib/constants';
import type { AgentMonitorItem } from './AgentMonitor';
import { AgentMark } from './AgentMark';
import { UserInterestStatus } from '../../../graphql/interests';

// Two, then a count. Any more and the field is buried under its own news.
const shownByDefault = 2;

const Chip = ({
  item,
  onDismiss,
}: {
  item: AgentMonitorItem;
  onDismiss: () => void;
}): ReactElement => (
  <FlexRow className="items-center gap-2 rounded-10 bg-surface-float py-1 pl-2 pr-1">
    <AgentMark isCompact status={UserInterestStatus.Active} />
    <Typography
      type={TypographyType.Caption1}
      bold
      className="max-w-[9rem] shrink-0 truncate"
    >
      {item.name}
    </Typography>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="min-w-0 flex-1 truncate"
    >
      {item.line}
    </Typography>
    {!!item.found && (
      <span className="shrink-0 rounded-6 bg-action-upvote-float px-1 tabular-nums text-action-upvote-default typo-caption2">
        {`+${item.found}`}
      </span>
    )}
    {/* Subtle, not Primary: there can be four of these stacked over the feed,
        and four solid buttons read as an alert rather than as a shelf of
        things waiting. */}
    <Link href={`${webappUrl}agent/${item.id}`}>
      <Button
        tag="a"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Subtle}
        className="shrink-0"
      >
        Review
      </Button>
    </Link>
    <Button
      icon={<MiniCloseIcon size={IconSize.Size16} />}
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Tertiary}
      className="shrink-0"
      aria-label={`Dismiss the update from ${item.name}`}
      onClick={onDismiss}
    />
  </FlexRow>
);

/**
 * Findings waiting on you, stacked over the field.
 *
 * The monitor under the field is ambient — it tells you what is happening and
 * asks for nothing. This is the other half: an agent that came back with
 * something is a piece of work with your name on it, so it gets a row of its
 * own above the field with the action already on it, and it stays there until
 * you open it or wave it off.
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
