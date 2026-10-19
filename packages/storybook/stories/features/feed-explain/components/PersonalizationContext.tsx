import type { PropsWithChildren, ReactElement } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { ParamKey } from '../policy/params';
import {
  defaultParams,
  formatParam,
  getParamMeta,
  ParamFormat,
} from '../policy/params';
import type { TopicControl } from '../policy/profile';
import { TopicMode } from '../policy/profile';
import type {
  Decision,
  PersonalizationState,
  RankResult,
} from '../policy/rank';
import { rankFeed, SourceMode, storyNow } from '../policy/rank';
import type { Duration } from '../policy/timed';
import {
  expiryKey,
  formatUntil,
  getActiveState,
  getEndedMessages,
  getUntil,
  setExpiry,
} from '../policy/timed';

interface Change {
  message: string;
  previous: PersonalizationState;
  /** Consecutive changes with the same key, like a slider drag, merge. */
  mergeKey?: string;
}

interface StoreState {
  state: PersonalizationState;
  changes: Change[];
  /** How many changes the served page already reflects. */
  refreshedAt: number;
  served: Decision[];
  notice?: string;
}

interface NamedEntity {
  id: string;
  name: string;
}

interface PersonalizationValue {
  state: PersonalizationState;
  pool: Post[];
  /** The prototype's clock, which timed changes end against. */
  now: number;
  /** The page as served at the last refresh. */
  served: Decision[];
  /** The page the current settings would serve. */
  next: RankResult;
  pendingCount: number;
  lastMessage?: string;
  notice?: string;
  undo: () => void;
  refresh: () => void;
  /** Applies several settings as one change, with one Undo. */
  applyChange: (
    message: string,
    update: (current: PersonalizationState) => PersonalizationState,
  ) => void;
  setTopicMode: (tag: string, mode?: TopicMode, duration?: Duration) => void;
  setTopicWeight: (tag: string, weight?: number) => void;
  setTagFollowed: (tag: string, isFollowed: boolean) => void;
  setTagBlocked: (tag: string, isBlocked: boolean, duration?: Duration) => void;
  setSourceFollowed: (source: NamedEntity, isFollowed: boolean) => void;
  setSourceMode: (
    source: NamedEntity,
    mode?: SourceMode,
    duration?: Duration,
  ) => void;
  setSourceWeight: (source: NamedEntity, weight?: number) => void;
  setSourceBlocked: (
    source: NamedEntity,
    isBlocked: boolean,
    duration?: Duration,
  ) => void;
  /**
   * Fewer like this: removes the post and, with a duration, shows less of its
   * main topic for that long.
   */
  fewerLikeThis: (
    postId: string,
    mainTopic?: string,
    duration?: Duration,
  ) => void;
  setAuthorFollowed: (author: NamedEntity, isFollowed: boolean) => void;
  setAuthorBlocked: (author: NamedEntity, isBlocked: boolean) => void;
  setParam: (key: ParamKey, value: number) => void;
  resetParam: (key: ParamKey) => void;
  setLearning: (isLearning: boolean) => void;
  setFilling: (isFilling: boolean) => void;
  setHidden: (postId: string, isHidden: boolean) => void;
  resetLearned: () => void;
  resetControls: () => void;
  resetParams: () => void;
  clearSeen: () => void;
  resetAll: () => void;
}

const PersonalizationContext = createContext<PersonalizationValue | null>(null);

const withoutKey = <T,>(
  record: Record<string, T> | undefined,
  key: string,
): Record<string, T> | undefined => {
  if (!record || !(key in record)) {
    return record;
  }
  const next = { ...record };
  delete next[key];
  return next;
};

const toggle = (list: string[], value: string, isOn: boolean): string[] =>
  isOn ? [...new Set([...list, value])] : list.filter((item) => item !== value);

const setControl = (
  controls: Record<string, TopicControl>,
  tag: string,
  control: TopicControl,
): Record<string, TopicControl> => {
  const next = { ...controls };
  if (control.mode === undefined && control.weight === undefined) {
    delete next[tag];
  } else {
    next[tag] = control;
  }
  return next;
};

const modeMessage: Record<TopicMode, (name: string) => string> = {
  [TopicMode.Boosted]: (name) => `Showing more ${name}`,
  [TopicMode.Demoted]: (name) => `Showing less ${name}`,
  [TopicMode.StopLearning]: (name) =>
    `Stopped learning ${name} from your reading`,
};

export const PersonalizationProvider = ({
  pool,
  initialState,
  servedState,
  now = storyNow,
  children,
}: PropsWithChildren<{
  pool: Post[];
  initialState: PersonalizationState;
  /** Serves the page from these settings instead, so changes show as pending. */
  servedState?: PersonalizationState;
  /** Where the prototype's clock stands, for timed changes. */
  now?: number;
}>): ReactElement => {
  const [store, setStore] = useState<StoreState>(() => {
    const sourceName = (id: string) =>
      pool.find(({ source }) => source?.id === id)?.source?.name ?? id;
    const ended = getEndedMessages(initialState, now, sourceName);
    return {
      state: getActiveState(initialState, now),
      changes: [],
      refreshedAt: 0,
      served: rankFeed(pool, servedState ?? initialState, now).served,
      notice:
        ended.length > 1
          ? `${ended.length} changes you set for a while ended. They're back to Auto.`
          : ended[0],
    };
  });
  const { state, changes, refreshedAt, served, notice } = store;
  const next = useMemo(() => rankFeed(pool, state, now), [pool, state, now]);

  const value = useMemo((): PersonalizationValue => {
    const apply = (
      message: string,
      update: (current: PersonalizationState) => PersonalizationState,
      mergeKey?: string,
    ) =>
      setStore((current) => {
        const last = current.changes[current.changes.length - 1];
        const isMerge =
          !!mergeKey &&
          last?.mergeKey === mergeKey &&
          current.changes.length > current.refreshedAt;
        return {
          ...current,
          notice: undefined,
          state: update(current.state),
          changes: [
            ...(isMerge ? current.changes.slice(0, -1) : current.changes),
            {
              message,
              previous: isMerge ? last.previous : current.state,
              mergeKey,
            },
          ],
        };
      });
    const tagName = (tag: string) => `#${tag}`;
    const untilText = (duration?: Duration) => {
      const until = getUntil(duration, now);
      return until ? ` ${formatUntil(until, now)}` : '';
    };
    const paramMessage = (key: ParamKey, value: number) => {
      const meta = getParamMeta(key);
      return `${meta.label}: ${formatParam(meta.format, value)}.`;
    };

    return {
      state,
      pool,
      now,
      served,
      next,
      pendingCount: changes.length - refreshedAt,
      lastMessage:
        changes.length > refreshedAt
          ? changes[changes.length - 1].message
          : undefined,
      notice,
      undo: () =>
        setStore((current) => {
          const last = current.changes[current.changes.length - 1];
          if (!last) {
            return current;
          }
          return {
            ...current,
            state: last.previous,
            changes: current.changes.slice(0, -1),
            refreshedAt: Math.min(
              current.refreshedAt,
              current.changes.length - 1,
            ),
          };
        }),
      applyChange: (message, update) => apply(message, update),
      refresh: () =>
        setStore((current) => {
          const result = rankFeed(pool, current.state, now);
          const servedIds = new Set(current.served.map(({ post }) => post.id));
          const incoming = result.served.filter(
            ({ post }) => !servedIds.has(post.id),
          ).length;
          return {
            ...current,
            served: result.served,
            refreshedAt: current.changes.length,
            notice: incoming
              ? `Feed refreshed: ${incoming} new ${
                  incoming === 1 ? 'post' : 'posts'
                } in.`
              : 'Feed refreshed with your changes.',
          };
        }),
      setTopicMode: (tag, mode, duration) =>
        apply(
          mode
            ? `${modeMessage[mode](tagName(tag))}${untilText(duration)}.`
            : `${tagName(tag)} is back to Auto.`,
          (current) => ({
            ...current,
            controls: setControl(current.controls, tag, { mode }),
            expiries: setExpiry(
              current.expiries,
              expiryKey.topic(tag),
              mode ? getUntil(duration, now) : undefined,
            ),
          }),
        ),
      setTopicWeight: (tag, weight) =>
        apply(
          weight === undefined
            ? `${tagName(tag)} is automatic again.`
            : `${tagName(tag)} boost set to ${formatParam(
                ParamFormat.Boost,
                weight,
              )}.`,
          (current) => ({
            ...current,
            controls: setControl(current.controls, tag, { weight }),
            expiries: setExpiry(
              current.expiries,
              expiryKey.topic(tag),
              undefined,
            ),
          }),
          `weight:${tag}`,
        ),
      setTagFollowed: (tag, isFollowed) =>
        apply(
          isFollowed
            ? `Following ${tagName(tag)}.`
            : `Unfollowed ${tagName(tag)}.`,
          (current) => ({
            ...current,
            followedTags: toggle(current.followedTags, tag, isFollowed),
          }),
        ),
      setTagBlocked: (tag, isBlocked, duration) =>
        apply(
          isBlocked
            ? `Blocked ${tagName(tag)}${untilText(duration)}.`
            : `Unblocked ${tagName(tag)}.`,
          (current) => ({
            ...current,
            blockedTags: toggle(current.blockedTags, tag, isBlocked),
            followedTags: isBlocked
              ? toggle(current.followedTags, tag, false)
              : current.followedTags,
            expiries: setExpiry(
              current.expiries,
              expiryKey.blockedTag(tag),
              isBlocked ? getUntil(duration, now) : undefined,
            ),
          }),
        ),
      setSourceFollowed: (source, isFollowed) =>
        apply(
          isFollowed
            ? `Following ${source.name}.`
            : `Unfollowed ${source.name}.`,
          (current) => ({
            ...current,
            followedSources: toggle(
              current.followedSources,
              source.id,
              isFollowed,
            ),
            sourceWeights: isFollowed
              ? current.sourceWeights
              : withoutKey(current.sourceWeights, source.id),
          }),
        ),
      setSourceMode: (source, mode, duration) =>
        apply(
          mode
            ? `Showing less from ${source.name}${untilText(duration)}.`
            : `${source.name} is back to Auto.`,
          (current) => {
            const sourceControls = { ...current.sourceControls };
            if (mode) {
              sourceControls[source.id] = mode;
            } else {
              delete sourceControls[source.id];
            }
            return {
              ...current,
              sourceControls,
              sourceWeights: withoutKey(current.sourceWeights, source.id),
              expiries: setExpiry(
                current.expiries,
                expiryKey.source(source.id),
                mode ? getUntil(duration, now) : undefined,
              ),
            };
          },
        ),
      setSourceWeight: (source, weight) =>
        apply(
          weight === undefined
            ? `${source.name} is automatic again.`
            : `${source.name} boost set to ${formatParam(
                ParamFormat.Multiplier,
                weight,
              )}.`,
          (current) => {
            const sourceControls = { ...current.sourceControls };
            delete sourceControls[source.id];
            return {
              ...current,
              sourceControls,
              sourceWeights:
                weight === undefined
                  ? withoutKey(current.sourceWeights, source.id)
                  : { ...current.sourceWeights, [source.id]: weight },
            };
          },
          `source:${source.id}`,
        ),
      setSourceBlocked: (source, isBlocked, duration) =>
        apply(
          isBlocked
            ? `Blocked ${source.name}${untilText(duration)}.`
            : `Unblocked ${source.name}.`,
          (current) => ({
            ...current,
            blockedSources: toggle(
              current.blockedSources,
              source.id,
              isBlocked,
            ),
            followedSources: isBlocked
              ? toggle(current.followedSources, source.id, false)
              : current.followedSources,
            expiries: setExpiry(
              current.expiries,
              expiryKey.blockedSource(source.id),
              isBlocked ? getUntil(duration, now) : undefined,
            ),
          }),
        ),
      fewerLikeThis: (postId, mainTopic, duration) =>
        apply(
          mainTopic && duration
            ? `Fewer like this: removed it, and showing less ${tagName(
                mainTopic,
              )}${untilText(duration)}.`
            : 'Removed this post.',
          (current) => ({
            ...current,
            hidden: toggle(current.hidden, postId, true),
            ...(mainTopic && duration
              ? {
                  controls: setControl(current.controls, mainTopic, {
                    mode: TopicMode.Demoted,
                  }),
                  expiries: setExpiry(
                    current.expiries,
                    expiryKey.topic(mainTopic),
                    getUntil(duration, now),
                  ),
                }
              : {}),
          }),
        ),
      setAuthorFollowed: (author, isFollowed) =>
        apply(
          isFollowed
            ? `Following ${author.name}.`
            : `Unfollowed ${author.name}.`,
          (current) => ({
            ...current,
            followedAuthors: toggle(
              current.followedAuthors,
              author.id,
              isFollowed,
            ),
          }),
        ),
      setAuthorBlocked: (author, isBlocked) =>
        apply(
          isBlocked ? `Blocked ${author.name}.` : `Unblocked ${author.name}.`,
          (current) => ({
            ...current,
            blockedAuthors: toggle(
              current.blockedAuthors,
              author.id,
              isBlocked,
            ),
          }),
        ),
      setParam: (key, paramValue) =>
        apply(
          paramMessage(key, paramValue),
          (current) => ({
            ...current,
            params: { ...current.params, [key]: paramValue },
          }),
          `param:${key}`,
        ),
      resetParam: (key) =>
        apply(
          `${getParamMeta(key).label} is back to its default.`,
          (current) => ({
            ...current,
            params: { ...current.params, [key]: defaultParams[key] },
          }),
        ),
      setLearning: (isLearning) =>
        apply(
          isLearning
            ? 'Learning from your reading again.'
            : 'Stopped learning from your reading. Only follows count.',
          (current) => ({ ...current, isLearning }),
        ),
      setFilling: (isFillingWithPopular) =>
        apply(
          isFillingWithPopular
            ? 'Popular posts fill a short feed again.'
            : 'No more popular fill-ins. A short feed stays short.',
          (current) => ({ ...current, isFillingWithPopular }),
        ),
      setHidden: (postId, isHidden) =>
        apply(
          isHidden ? 'Removed this post.' : 'Post is back in your feed.',
          (current) => ({
            ...current,
            hidden: toggle(current.hidden, postId, isHidden),
          }),
        ),
      resetLearned: () =>
        apply(
          'Forgot everything learned from your reading. Follows and blocks stay.',
          (current) => ({ ...current, evidence: [], tagShownDays: {} }),
        ),
      resetControls: () =>
        apply('Every boost you set is automatic again.', (current) => ({
          ...current,
          controls: {},
          sourceControls: {},
          sourceWeights: {},
          expiries: {},
        })),
      resetParams: () =>
        apply('Ranking is back to the defaults.', (current) => ({
          ...current,
          params: defaultParams,
          isFillingWithPopular: true,
          isLearning: true,
        })),
      clearSeen: () =>
        apply('Forgot what you scrolled past.', (current) => ({
          ...current,
          impressions: {},
        })),
      resetAll: () =>
        apply(
          'Personalization reset. Only your follows, blocks and filters remain.',
          (current) => ({
            ...current,
            evidence: [],
            tagShownDays: {},
            controls: {},
            sourceControls: {},
            sourceWeights: {},
            expiries: {},
            params: defaultParams,
            isFillingWithPopular: true,
            isLearning: true,
            impressions: {},
            hidden: [],
          }),
        ),
    };
  }, [state, pool, now, served, next, changes, refreshedAt, notice]);

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = (): PersonalizationValue => {
  const value = useContext(PersonalizationContext);
  if (!value) {
    throw new Error(
      'usePersonalization must be used inside PersonalizationProvider',
    );
  }
  return value;
};
