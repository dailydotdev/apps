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
import { rankFeed, SourceMode } from '../policy/rank';

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
  setTopicMode: (tag: string, mode?: TopicMode) => void;
  setTopicWeight: (tag: string, weight?: number) => void;
  setTagFollowed: (tag: string, isFollowed: boolean) => void;
  setTagBlocked: (tag: string, isBlocked: boolean) => void;
  setSourceFollowed: (source: NamedEntity, isFollowed: boolean) => void;
  setSourceMode: (source: NamedEntity, mode?: SourceMode) => void;
  setSourceWeight: (source: NamedEntity, weight?: number) => void;
  setSourceBlocked: (source: NamedEntity, isBlocked: boolean) => void;
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

const notInterestedMessage = (name: string, isFollowed: boolean): string =>
  isFollowed
    ? `Not interested in ${name}. Unfollowed it, and its posts rank lower.`
    : `Not interested in ${name}. Its posts rank lower.`;

const modeMessage: Record<
  TopicMode,
  (name: string, isFollowed: boolean) => string
> = {
  [TopicMode.Boosted]: (name) => `You'll see more ${name}.`,
  [TopicMode.Demoted]: (name) => `You'll see less ${name}.`,
  [TopicMode.NotInterested]: notInterestedMessage,
};

export const PersonalizationProvider = ({
  pool,
  initialState,
  servedState,
  children,
}: PropsWithChildren<{
  pool: Post[];
  initialState: PersonalizationState;
  /** Serves the page from these settings instead, so changes show as pending. */
  servedState?: PersonalizationState;
}>): ReactElement => {
  const [store, setStore] = useState<StoreState>(() => ({
    state: initialState,
    changes: [],
    refreshedAt: 0,
    served: rankFeed(pool, servedState ?? initialState).served,
  }));
  const { state, changes, refreshedAt, served, notice } = store;
  const next = useMemo(() => rankFeed(pool, state), [pool, state]);

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
    const paramMessage = (key: ParamKey, value: number) => {
      const meta = getParamMeta(key);
      return `${meta.label}: ${formatParam(meta.format, value)}.`;
    };

    return {
      state,
      pool,
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
          const result = rankFeed(pool, current.state);
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
      setTopicMode: (tag, mode) => {
        const isNotInterested = mode === TopicMode.NotInterested;
        apply(
          mode
            ? modeMessage[mode](tagName(tag), state.followedTags.includes(tag))
            : `${tagName(tag)} is back to normal.`,
          (current) => ({
            ...current,
            followedTags: isNotInterested
              ? toggle(current.followedTags, tag, false)
              : current.followedTags,
            controls: setControl(current.controls, tag, { mode }),
          }),
        );
      },
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
            controls: isFollowed
              ? setControl(current.controls, tag, {
                  ...current.controls[tag],
                  mode:
                    current.controls[tag]?.mode === TopicMode.NotInterested
                      ? undefined
                      : current.controls[tag]?.mode,
                })
              : current.controls,
          }),
        ),
      setTagBlocked: (tag, isBlocked) =>
        apply(
          isBlocked ? `Blocked ${tagName(tag)}.` : `Unblocked ${tagName(tag)}.`,
          (current) => ({
            ...current,
            blockedTags: toggle(current.blockedTags, tag, isBlocked),
            followedTags: isBlocked
              ? toggle(current.followedTags, tag, false)
              : current.followedTags,
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
            sourceControls:
              isFollowed &&
              current.sourceControls[source.id] === SourceMode.NotInterested
                ? withoutKey(current.sourceControls, source.id) ?? {}
                : current.sourceControls,
          }),
        ),
      setSourceMode: (source, mode) => {
        const isNotInterested = mode === SourceMode.NotInterested;
        let message = `${source.name} is back to normal.`;
        if (isNotInterested) {
          message = notInterestedMessage(
            source.name,
            state.followedSources.includes(source.id),
          );
        } else if (mode) {
          message = `You'll see less from ${source.name}.`;
        }
        apply(message, (current) => {
          const sourceControls = { ...current.sourceControls };
          if (mode) {
            sourceControls[source.id] = mode;
          } else {
            delete sourceControls[source.id];
          }
          return {
            ...current,
            followedSources: isNotInterested
              ? toggle(current.followedSources, source.id, false)
              : current.followedSources,
            sourceControls,
            sourceWeights: withoutKey(current.sourceWeights, source.id),
          };
        });
      },
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
      setSourceBlocked: (source, isBlocked) =>
        apply(
          isBlocked ? `Blocked ${source.name}.` : `Unblocked ${source.name}.`,
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
          isHidden ? 'Got it, fewer like this.' : 'Post is back in your feed.',
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
            params: defaultParams,
            isFillingWithPopular: true,
            isLearning: true,
            impressions: {},
            hidden: [],
          }),
        ),
    };
  }, [state, pool, served, next, changes, refreshedAt, notice]);

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
