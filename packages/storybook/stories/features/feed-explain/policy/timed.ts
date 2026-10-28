import type { PersonalizationState } from './rank';
import { FeedAction, glossary } from './glossary';
import { TopicMode } from './profile';
import { getCuration } from './curation';

/** How long a Show less, Show more or block lasts. */
export enum Duration {
  ThreeDays = 'three_days',
  Week = 'week',
  Ongoing = 'ongoing',
}

export const durationOptions: Array<{ value: Duration; label: string }> = [
  { value: Duration.ThreeDays, label: '3 days' },
  { value: Duration.Week, label: '1 week' },
  { value: Duration.Ongoing, label: 'Until I change it' },
];

const dayMs = 86_400_000;

const durationDays: Partial<Record<Duration, number>> = {
  [Duration.ThreeDays]: 3,
  [Duration.Week]: 7,
};

export const getUntil = (
  duration: Duration | undefined,
  now: number,
): number | undefined => {
  const days = duration ? durationDays[duration] : undefined;
  return days ? now + days * dayMs : undefined;
};

const formatDay = (time: number, options: Intl.DateTimeFormatOptions) =>
  new Date(time).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });

/** "until Sun", or "until Thu, Oct 22" when the weekday alone is ambiguous. */
export const formatUntil = (until: number, now: number): string => {
  const weekday = formatDay(until, { weekday: 'short' });
  return until - now < 6 * dayMs
    ? `until ${weekday}`
    : `until ${weekday}, ${formatDay(until, {
        month: 'short',
        day: 'numeric',
      })}`;
};

/** Keys into `PersonalizationState.expiries`, one per thing a change can end on. */
export const expiryKey = {
  topic: (tag: string): string => `topic:${tag}`,
  source: (id: string): string => `source:${id}`,
  blockedTag: (tag: string): string => `blocked-tag:${tag}`,
  blockedSource: (id: string): string => `blocked-source:${id}`,
  curation: (id: string): string => `curation:${id}`,
};

export const setExpiry = (
  expiries: Record<string, number> | undefined,
  key: string,
  until: number | undefined,
): Record<string, number> | undefined => {
  if (until !== undefined) {
    return { ...expiries, [key]: until };
  }
  if (!expiries || !(key in expiries)) {
    return expiries;
  }
  const next = { ...expiries };
  delete next[key];
  return next;
};

export const getUntilFor = (
  state: PersonalizationState,
  key: string,
): number | undefined => state.expiries?.[key];

const hasEnded = (state: PersonalizationState, key: string, now: number) => {
  const until = state.expiries?.[key];
  return until !== undefined && until <= now;
};

/** The settings with every change whose time ran out taken back. */
export const getActiveState = (
  state: PersonalizationState,
  now: number,
): PersonalizationState => {
  if (!Object.values(state.expiries ?? {}).some((until) => until <= now)) {
    return state;
  }
  const ended = (key: string) => hasEnded(state, key, now);
  return {
    ...state,
    controls: Object.fromEntries(
      Object.entries(state.controls).filter(
        ([tag]) => !ended(expiryKey.topic(tag)),
      ),
    ),
    sourceControls: Object.fromEntries(
      Object.entries(state.sourceControls).filter(
        ([id]) => !ended(expiryKey.source(id)),
      ),
    ),
    blockedTags: state.blockedTags.filter(
      (tag) => !ended(expiryKey.blockedTag(tag)),
    ),
    blockedSources: state.blockedSources.filter(
      (id) => !ended(expiryKey.blockedSource(id)),
    ),
    blockedCurations: state.blockedCurations?.filter(
      (id) => !ended(expiryKey.curation(id)),
    ),
    expiries: Object.fromEntries(
      Object.entries(state.expiries ?? {}).filter(([, until]) => until > now),
    ),
  };
};

const modeVerb: Record<TopicMode, string> = {
  [TopicMode.Boosted]: glossary[FeedAction.ShowMore].verb,
  [TopicMode.Demoted]: glossary[FeedAction.ShowLess].verb,
  [TopicMode.StopLearning]: glossary[FeedAction.StopLearning].verb,
};

/** One line per change that ran out, for the "back to normal" notice. */
export const getEndedMessages = (
  state: PersonalizationState,
  now: number,
  sourceName: (id: string) => string,
): string[] =>
  Object.keys(state.expiries ?? {})
    .filter((key) => hasEnded(state, key, now))
    .map((key) => {
      const [kind, ...rest] = key.split(':');
      const id = rest.join(':');
      switch (kind) {
        case 'topic': {
          const mode = state.controls[id]?.mode;
          return `${
            mode ? modeVerb[mode] : 'Your change to'
          } #${id} ended. It's back to Auto.`;
        }
        case 'source':
          return `Show less from ${sourceName(id)} ended. It's back to Auto.`;
        case 'blocked-tag':
          return `Your block on #${id} ended. Its posts can show again.`;
        case 'blocked-source':
          return `Your block on ${sourceName(
            id,
          )} ended. Its posts can show again.`;
        case 'curation':
          return `Hiding ${getCuration(id).title} ended. They can show again.`;
        default:
          return `A change you set for a while ended.`;
      }
    });
