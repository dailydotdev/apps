import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { PersonalizationState } from '../../policy/rank';
import { formatUntil } from '../../policy/timed';
import { getCuration } from '../../policy/curation';
import { describeAction, FeedAction, glossary } from '../../policy/glossary';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { getLevelOption, getTopicLevel, Level } from '../plus';
import { PanelSection, useFrozenGroups } from './Section';

export const hasTimedChanges = (state: PersonalizationState): boolean =>
  Object.keys(state.expiries ?? {}).length > 0;

interface TimedRow {
  key: string;
  label: string;
  until: number;
  endHint: string;
  onEnd: () => void;
}

/** Every change set for a while, when it ends, and a way to end it now. */
export const TimedSection = (): ReactElement => {
  const store = usePersonalization();
  const { state, now, pool } = store;
  const sourceName = (id: string) =>
    pool.find(({ source }) => source?.id === id)?.source?.name ?? id;
  const current = Object.entries(state.expiries ?? {})
    .sort(([, a], [, b]) => a - b)
    .map(([key, until]): TimedRow => {
      const [kind, ...rest] = key.split(':');
      const id = rest.join(':');
      const source = { id, name: sourceName(id) };
      switch (kind) {
        case 'topic':
          return {
            key,
            label: `${
              getLevelOption(
                getTopicLevel(state.controls[id]) ?? Level.Auto,
                '',
              ).label
            } #${id}`,
            until,
            endHint: describeAction(FeedAction.Auto, `#${id}`),
            onEnd: () => store.setTopicMode(id, undefined),
          };
        case 'source':
          return {
            key,
            label: `${glossary[FeedAction.ShowLess].verb} from ${source.name}`,
            until,
            endHint: describeAction(FeedAction.Auto, source.name),
            onEnd: () => store.setSourceMode(source, undefined),
          };
        case 'curation': {
          const { title } = getCuration(id);
          return {
            key,
            label: `${glossary[FeedAction.HideCategory].verb} ${title}`,
            until,
            endHint: `${title} can show again.`,
            onEnd: () => store.setCurationHidden(id, false),
          };
        }
        case 'blocked-tag':
          return {
            key,
            label: `${glossary[FeedAction.Block].verb} #${id}`,
            until,
            endHint: describeAction(FeedAction.Unblock, `#${id}`),
            onEnd: () => store.setTagBlocked(id, false),
          };
        default:
          return {
            key,
            label: `${glossary[FeedAction.Block].verb} ${source.name}`,
            until,
            endHint: describeAction(FeedAction.Unblock, source.name),
            onEnd: () => store.setSourceBlocked(source, false),
          };
      }
    });

  // Rows keep their places: one ended here stays, marked ended, until the
  // list opens again.
  const lastSeen = useRef(new Map<string, TimedRow>());
  current.forEach((row) => lastSeen.current.set(row.key, row));
  const order = useFrozenGroups({ rows: current.map(({ key }) => key) }).rows;
  const rows = order.flatMap((key) => {
    const row = lastSeen.current.get(key);
    return row
      ? [{ ...row, isEnded: !current.some((item) => item.key === key) }]
      : [];
  });

  return (
    <PanelSection
      section={ControlSection.Timed}
      title="Changes that end on their own"
      description="Each one goes back to how it was on the day shown. End one now to undo it today."
    >
      <ul className="flex flex-col">
        {rows.map(({ key, label, until, endHint, onEnd, isEnded }) => {
          const ends = isEnded
            ? 'ended, back to how it was'
            : formatUntil(until, now);
          return (
            <li key={key} className="flex items-center gap-3 py-2">
              <span className="flex min-w-0 flex-1 flex-col">
                <Typography
                  type={TypographyType.Callout}
                  className="truncate"
                  bold
                >
                  {label}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {ends.charAt(0).toUpperCase() + ends.slice(1)}
                </Typography>
              </span>
              {!isEnded && (
                <Tooltip content={endHint}>
                  <Button
                    type="button"
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                    onClick={onEnd}
                  >
                    End now
                  </Button>
                </Tooltip>
              )}
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
};
