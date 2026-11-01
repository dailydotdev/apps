import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { SidebarSettingsFlags } from '../../graphql/settings';
import type { Source } from '../../graphql/sources';
import { isFollowingContent } from '../../hooks/contentPreference/types';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { contentPreferenceStatusQueryOptions } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { useAdvancedSettings } from '../../hooks/feed/useAdvancedSettings';
import { setPostHiddenPanel } from '../../hooks/post/useBlockPostPanel';
import useFeedSettings from '../../hooks/useFeedSettings';
import useReportPost from '../../hooks/useReportPost';
import useTagAndSource from '../../hooks/useTagAndSource';
import { useToastNotification } from '../../hooks/useToastNotification';
import { SharedFeedPage } from '../../components/utilities/common';
import { labels } from '../../lib/labels';
import { LogEvent, Origin, TargetId } from '../../lib/log';
import { generateQueryKey, RequestKey } from '../../lib/query';
import type { FeedPersonalizationReset } from './graphql';
import type {
  FeedAuthorMode,
  FeedControl,
  FeedSourceMode,
  FeedTopicMode,
  WhatsOffChange,
  WhatsOffTarget,
} from './types';
import { WhatsOffOp, WhatsOffTargetType } from './types';
import type { ControlValue } from './useFeedControls';
import {
  ChangeKind,
  useFeedControls,
  useFeedPersonalizationReset,
} from './useFeedControls';
import { useDropIdleForYouFeeds } from './useDropIdleForYouFeeds';

const origin = Origin.WhatsOff;

type PreferenceOp =
  | WhatsOffOp.Follow
  | WhatsOffOp.Unfollow
  | WhatsOffOp.Block
  | WhatsOffOp.Unblock;

/**
 * Where the reader stands with a topic, source or person: the op that puts
 * them there, or none.
 */
type Preference = WhatsOffOp.Follow | WhatsOffOp.Block | null;

const clearOp: Record<NonNullable<Preference>, PreferenceOp> = {
  [WhatsOffOp.Follow]: WhatsOffOp.Unfollow,
  [WhatsOffOp.Block]: WhatsOffOp.Unblock,
};

// Follow and block set where the reader stands; unfollow and unblock clear it.
const getPreferenceAfter = (op: PreferenceOp): Preference =>
  op === WhatsOffOp.Follow || op === WhatsOffOp.Block ? op : null;

const resetFlags: Record<string, FeedPersonalizationReset> = {
  learned: { learned: true },
  seen: { seen: true },
  levels: { levels: true },
  everything: { learned: true, seen: true, levels: true, ranking: true },
};

// The control as it was, to undo to: its level or exact weight, or Auto.
const toValue = <Mode>(
  control: FeedControl<Mode> | undefined,
): ControlValue<Mode> =>
  control
    ? {
        mode: control.mode,
        ...(control.weight !== null && { weight: control.weight }),
      }
    : { mode: null };

export interface AppliedWhatsOffChange {
  /** Takes the change back to how things were, where that can be done. */
  undo?: () => Promise<boolean>;
}

// A timed level would lose its end date, so it has no undo.
const getLevelUndo = <Mode>(
  previous: FeedControl<Mode> | undefined,
  save: (value: ControlValue<Mode>) => Promise<boolean>,
): AppliedWhatsOffChange['undo'] =>
  previous?.expiresAt ? undefined : () => save(toValue(previous));

type TopicValue = { keyword: string } & ControlValue<FeedTopicMode>;

interface UseWhatsOffChange {
  /** Null when the change didn't go through; the reader was told why. */
  apply: (change: WhatsOffChange) => Promise<AppliedWhatsOffChange | null>;
  /** The controls still carry the change: one set back elsewhere doesn't. */
  isInEffect: (change: WhatsOffChange) => boolean;
}

/**
 * Applies a What's off change with the mutation its control already uses,
 * so every surface showing that control updates the way it does from there.
 */
export const useWhatsOffChange = (): UseWhatsOffChange => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { flags, updateFlag } = useSettingsContext();
  // An undo comes after the settings changed, and the updateFlag of the
  // apply would write the old ones back.
  const updateFlagRef = useRef(updateFlag);
  updateFlagRef.current = updateFlag;
  const dropIdleFeeds = useDropIdleForYouFeeds();
  const {
    controls,
    getTopicControl,
    getSourceControl,
    getAuthorControl,
    saveChange,
  } = useFeedControls({ origin });
  const { reset } = useFeedPersonalizationReset({ origin });
  const { feedSettings } = useFeedSettings();
  const { onUpdateSettings } = useAdvancedSettings();
  const {
    onFollowTags,
    onUnfollowTags,
    onBlockTags,
    onUnblockTags,
    onFollowSource,
    onUnfollowSource,
    onBlockSource,
    onUnblockSource,
  } = useTagAndSource({ origin, shouldInvalidateQueries: false });
  const { follow, unfollow, block, unblock } = useContentPreference();
  const { hidePost, unhidePost } = useReportPost();

  // Changes the For You controls don't carry drop the idle For You feeds
  // here; the controls drop them on their own.
  const run = useCallback(
    async (action: () => unknown): Promise<boolean> => {
      try {
        if ((await action()) === false) {
          return false;
        }
      } catch {
        displayToast(labels.error.generic);
        return false;
      }
      dropIdleFeeds();
      return true;
    },
    [displayToast, dropIdleFeeds],
  );

  // A change missing what it acts on: nothing else tells the reader.
  const refuse = useCallback((): null => {
    displayToast(labels.error.generic);
    return null;
  }, [displayToast]);

  // Sets each topic's level in turn and stops at the first one refused,
  // which tells the reader why: how many went through.
  const saveTopics = useCallback(
    (topics: TopicValue[]): Promise<number> =>
      topics.reduce<Promise<number>>(async (saving, topic, index) => {
        const saved = await saving;
        if (saved < index) {
          return saved;
        }
        const isSaved = await saveChange({ kind: ChangeKind.Topic, ...topic });
        return isSaved ? saved + 1 : saved;
      }, Promise.resolve(0)),
    [saveChange],
  );

  const getPreference = useCallback(
    async ({ type, id }: WhatsOffTarget): Promise<Preference> => {
      if (type === WhatsOffTargetType.User) {
        const preference = await client.fetchQuery(
          contentPreferenceStatusQueryOptions(user, {
            id,
            entity: ContentPreferenceType.User,
          }),
        );
        if (preference?.status === ContentPreferenceStatus.Blocked) {
          return WhatsOffOp.Block;
        }
        return isFollowingContent(preference ?? undefined)
          ? WhatsOffOp.Follow
          : null;
      }
      const isKeyword = type === WhatsOffTargetType.Keyword;
      const isBlocked = isKeyword
        ? !!feedSettings?.blockedTags?.includes(id)
        : !!feedSettings?.excludeSources?.some((source) => source.id === id);
      if (isBlocked) {
        return WhatsOffOp.Block;
      }
      const isFollowed = isKeyword
        ? !!feedSettings?.includeTags?.includes(id)
        : !!feedSettings?.includeSources?.some((source) => source.id === id);
      return isFollowed ? WhatsOffOp.Follow : null;
    },
    [client, user, feedSettings],
  );

  const setPreference = useCallback(
    async (op: PreferenceOp, target: WhatsOffTarget): Promise<boolean> => {
      if (target.type === WhatsOffTargetType.Keyword) {
        const tagActions = {
          [WhatsOffOp.Follow]: onFollowTags,
          [WhatsOffOp.Unfollow]: onUnfollowTags,
          [WhatsOffOp.Block]: onBlockTags,
          [WhatsOffOp.Unblock]: onUnblockTags,
        };
        const { successful } = await tagActions[op]({ tags: [target.id] });
        // A topic's follow or block changes the weights the profile shows.
        if (successful) {
          await client.invalidateQueries({
            queryKey: generateQueryKey(RequestKey.FeedProfile, user),
          });
        }
        return successful;
      }
      if (target.type === WhatsOffTargetType.Source) {
        const sourceActions = {
          [WhatsOffOp.Follow]: onFollowSource,
          [WhatsOffOp.Unfollow]: onUnfollowSource,
          [WhatsOffOp.Block]: onBlockSource,
          [WhatsOffOp.Unblock]: onUnblockSource,
        };
        const source = {
          id: target.id,
          name: target.name,
          image: target.image,
          handle: target.handle,
        } as Source;
        return (await sourceActions[op]({ source })).successful;
      }
      const userActions = {
        [WhatsOffOp.Follow]: follow,
        [WhatsOffOp.Unfollow]: unfollow,
        [WhatsOffOp.Block]: block,
        [WhatsOffOp.Unblock]: unblock,
      };
      await userActions[op]({
        id: target.id,
        entity: ContentPreferenceType.User,
        entityName: target.name,
        opts: { extra: { origin } },
      });
      return true;
    },
    [
      client,
      user,
      onFollowTags,
      onUnfollowTags,
      onBlockTags,
      onUnblockTags,
      onFollowSource,
      onUnfollowSource,
      onBlockSource,
      onUnblockSource,
      follow,
      unfollow,
      block,
      unblock,
    ],
  );

  // Clears what the change set, then sets what the reader had, so a block
  // over a follow undoes to the follow.
  const restorePreference = useCallback(
    async (
      target: WhatsOffTarget,
      op: PreferenceOp,
      previous: Preference,
    ): Promise<boolean> => {
      const current = getPreferenceAfter(op);
      if (current === previous) {
        return true;
      }
      if (current && !(await setPreference(clearOp[current], target))) {
        return false;
      }
      return previous ? setPreference(previous, target) : true;
    },
    [setPreference],
  );

  const setBlockedWord = useCallback(
    async (word: string, isBlocked: boolean) => {
      const params = {
        id: word,
        entity: ContentPreferenceType.Word,
        entityName: 'words',
        feedId: user?.id,
      };
      await (isBlocked ? block(params) : unblock(params));
      client.invalidateQueries({
        queryKey: generateQueryKey(
          RequestKey.ContentPreference,
          user,
          RequestKey.UserBlocked,
          { entity: ContentPreferenceType.Word },
        ),
      });
    },
    [block, unblock, client, user],
  );

  const setClickbaitShield = useCallback(
    async (enabled: boolean) => {
      await updateFlagRef.current(
        SidebarSettingsFlags.ClickbaitShieldEnabled,
        enabled,
      );
      logEvent({
        event_name: LogEvent.ToggleClickbaitShield,
        target_id: enabled ? TargetId.On : TargetId.Off,
        extra: JSON.stringify({ origin }),
      });
      client.invalidateQueries({
        queryKey: generateQueryKey(SharedFeedPage.MyFeed, user),
      });
    },
    [logEvent, client, user],
  );

  const setPostsHidden = useCallback(
    async (postIds: string[], isHidden: boolean) => {
      const results = await Promise.all(
        postIds.map((id) => (isHidden ? hidePost(id) : unhidePost(id))),
      );
      if (!results.every(({ successful }) => successful)) {
        return false;
      }
      postIds.forEach((id) => setPostHiddenPanel(client, user, id, isHidden));
      return true;
    },
    [hidePost, unhidePost, client, user],
  );

  const apply = useCallback(
    async (change: WhatsOffChange): Promise<AppliedWhatsOffChange | null> => {
      const { op, target } = change;
      const enabled = !!change.enabled;
      const mode = change.mode ?? null;
      switch (op) {
        case WhatsOffOp.Topic: {
          if (!target) {
            return refuse();
          }
          const previous = getTopicControl(target.id);
          const save = (value: ControlValue<FeedTopicMode>) =>
            saveChange({
              kind: ChangeKind.Topic,
              keyword: target.id,
              ...value,
            });
          if (!(await save({ mode: mode as FeedTopicMode | null }))) {
            return null;
          }
          return { undo: getLevelUndo(previous, save) };
        }
        case WhatsOffOp.TopicFamily: {
          const keywords = change.tags?.map(({ id }) => id) ?? [];
          if (!keywords.length) {
            return refuse();
          }
          const before = keywords.map((keyword) => getTopicControl(keyword));
          const previous = keywords.map(
            (keyword, index): TopicValue => ({
              keyword,
              ...toValue(before[index]),
            }),
          );
          const saved = await saveTopics(
            keywords.map((keyword) => ({
              keyword,
              mode: mode as FeedTopicMode | null,
            })),
          );
          // The family applies whole or not at all.
          if (saved < keywords.length) {
            await saveTopics(previous.slice(0, saved));
            return null;
          }
          // A timed level would lose its end date, so it has no undo.
          return {
            undo: before.some((control) => control?.expiresAt)
              ? undefined
              : async () => (await saveTopics(previous)) === previous.length,
          };
        }
        case WhatsOffOp.Source: {
          if (!target) {
            return refuse();
          }
          const previous = getSourceControl(target.id);
          const save = (value: ControlValue<FeedSourceMode>) =>
            saveChange({
              kind: ChangeKind.Source,
              sourceId: target.id,
              ...value,
            });
          if (!(await save({ mode: mode as FeedSourceMode | null }))) {
            return null;
          }
          return { undo: getLevelUndo(previous, save) };
        }
        case WhatsOffOp.Author: {
          if (!target) {
            return refuse();
          }
          const previous = getAuthorControl(target.id);
          const save = (value: ControlValue<FeedAuthorMode>) =>
            saveChange({
              kind: ChangeKind.Author,
              userId: target.id,
              ...value,
            });
          if (!(await save({ mode: mode as FeedAuthorMode | null }))) {
            return null;
          }
          return { undo: getLevelUndo(previous, save) };
        }
        case WhatsOffOp.Follow:
        case WhatsOffOp.Unfollow:
        case WhatsOffOp.Block:
        case WhatsOffOp.Unblock: {
          if (!target) {
            return refuse();
          }
          let previous: Preference = null;
          const isDone = await run(async () => {
            previous = await getPreference(target);
            return setPreference(op, target);
          });
          if (!isDone) {
            return null;
          }
          return {
            undo: () => run(() => restorePreference(target, op, previous)),
          };
        }
        case WhatsOffOp.Format:
        case WhatsOffOp.Curation:
        case WhatsOffOp.Squads: {
          const id = change.advancedSettingId;
          if (!id) {
            return refuse();
          }
          if (!(await run(() => onUpdateSettings([{ id, enabled }])))) {
            return null;
          }
          return {
            undo: () =>
              run(() => onUpdateSettings([{ id, enabled: !enabled }])),
          };
        }
        case WhatsOffOp.BlockedWord: {
          const word = change.value;
          if (!word) {
            return refuse();
          }
          if (!(await run(() => setBlockedWord(word, true)))) {
            return null;
          }
          return { undo: () => run(() => setBlockedWord(word, false)) };
        }
        case WhatsOffOp.ClickbaitShield: {
          const previous = !!flags?.clickbaitShieldEnabled;
          if (!(await run(() => setClickbaitShield(enabled)))) {
            return null;
          }
          return { undo: () => run(() => setClickbaitShield(previous)) };
        }
        case WhatsOffOp.Learning: {
          const previous = controls?.learning ?? true;
          if (!(await saveChange({ kind: ChangeKind.Learning, enabled }))) {
            return null;
          }
          return {
            undo: () =>
              saveChange({ kind: ChangeKind.Learning, enabled: previous }),
          };
        }
        case WhatsOffOp.FillIns: {
          const previous = controls?.fillIns ?? true;
          if (!(await saveChange({ kind: ChangeKind.FillIns, enabled }))) {
            return null;
          }
          return {
            undo: () =>
              saveChange({ kind: ChangeKind.FillIns, enabled: previous }),
          };
        }
        case WhatsOffOp.Reset: {
          const flagsToReset = resetFlags[change.value ?? ''];
          if (!flagsToReset) {
            return refuse();
          }
          // Nothing brings back what a reset forgets.
          return (await reset(flagsToReset)) ? {} : null;
        }
        case WhatsOffOp.Ranking: {
          const key = change.value;
          const value = change.to;
          if (!key || typeof value !== 'number') {
            return refuse();
          }
          const previous =
            controls?.ranking.find((setting) => setting.key === key)?.value ??
            null;
          if (!(await saveChange({ kind: ChangeKind.Ranking, key, value }))) {
            return null;
          }
          return {
            undo: () =>
              saveChange({ kind: ChangeKind.Ranking, key, value: previous }),
          };
        }
        case WhatsOffOp.HidePosts: {
          const postIds = change.postIds ?? [];
          if (!postIds.length) {
            return refuse();
          }
          if (!(await run(() => setPostsHidden(postIds, true)))) {
            return null;
          }
          return { undo: () => run(() => setPostsHidden(postIds, false)) };
        }
        default:
          return refuse();
      }
    },
    [
      controls,
      flags,
      getTopicControl,
      getSourceControl,
      getAuthorControl,
      saveChange,
      reset,
      onUpdateSettings,
      getPreference,
      setPreference,
      restorePreference,
      setBlockedWord,
      setClickbaitShield,
      setPostsHidden,
      saveTopics,
      run,
      refuse,
    ],
  );

  const isInEffect = useCallback(
    ({
      op,
      target,
      tags,
      mode,
      enabled,
      value,
      to,
    }: WhatsOffChange): boolean => {
      if (!controls) {
        return true;
      }
      const id = target?.id ?? '';
      const level = mode ?? null;
      switch (op) {
        case WhatsOffOp.Topic:
          return (getTopicControl(id)?.mode ?? null) === level;
        case WhatsOffOp.TopicFamily:
          return (tags ?? []).every(
            (tag) => (getTopicControl(tag.id)?.mode ?? null) === level,
          );
        case WhatsOffOp.Source:
          return (getSourceControl(id)?.mode ?? null) === level;
        case WhatsOffOp.Author:
          return (getAuthorControl(id)?.mode ?? null) === level;
        case WhatsOffOp.Learning:
          return controls.learning === !!enabled;
        case WhatsOffOp.FillIns:
          return controls.fillIns === !!enabled;
        case WhatsOffOp.Ranking:
          return (
            controls.ranking.find((setting) => setting.key === value)?.value ===
            to
          );
        default:
          return true;
      }
    },
    [controls, getTopicControl, getSourceControl, getAuthorControl],
  );

  return { apply, isInEffect };
};
