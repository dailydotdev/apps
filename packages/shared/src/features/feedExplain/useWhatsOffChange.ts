import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { SidebarSettingsFlags } from '../../graphql/settings';
import type { Source } from '../../graphql/sources';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { useAdvancedSettings } from '../../hooks/feed/useAdvancedSettings';
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
  useFeedControls,
  useFeedPersonalizationReset,
} from './useFeedControls';

const origin = Origin.WhatsOff;

type PreferenceOp =
  | WhatsOffOp.Follow
  | WhatsOffOp.Unfollow
  | WhatsOffOp.Block
  | WhatsOffOp.Unblock;

const inverseOp: Record<PreferenceOp, PreferenceOp> = {
  [WhatsOffOp.Follow]: WhatsOffOp.Unfollow,
  [WhatsOffOp.Unfollow]: WhatsOffOp.Follow,
  [WhatsOffOp.Block]: WhatsOffOp.Unblock,
  [WhatsOffOp.Unblock]: WhatsOffOp.Block,
};

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
  /** Takes the change back, where it has a clear inverse. */
  undo?: () => Promise<boolean>;
}

interface UseWhatsOffChange {
  /** Null when the change didn't go through; the reader was told why. */
  apply: (change: WhatsOffChange) => Promise<AppliedWhatsOffChange | null>;
  /** The controls still carry the change: a refused one rolls back. */
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
  const { updateFlag } = useSettingsContext();
  const {
    controls,
    getTopicControl,
    getSourceControl,
    getAuthorControl,
    setTopic,
    setSource,
    setAuthor,
    setLearning,
    setFillIns,
    setRankingSetting,
  } = useFeedControls({ origin });
  const { reset } = useFeedPersonalizationReset({ origin });
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
  } = useTagAndSource({ origin });
  const { follow, unfollow, block, unblock } = useContentPreference();
  const { hidePost, unhidePost } = useReportPost();

  const run = useCallback(
    async (action: () => unknown): Promise<boolean> => {
      try {
        return (await action()) !== false;
      } catch {
        displayToast(labels.error.generic);
        return false;
      }
    },
    [displayToast],
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
        return (await tagActions[op]({ tags: [target.id] })).successful;
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
      await updateFlag(SidebarSettingsFlags.ClickbaitShieldEnabled, enabled);
      logEvent({
        event_name: LogEvent.ToggleClickbaitShield,
        target_id: enabled ? TargetId.On : TargetId.Off,
        extra: JSON.stringify({ origin }),
      });
      client.invalidateQueries({
        queryKey: generateQueryKey(SharedFeedPage.MyFeed, user),
      });
    },
    [updateFlag, logEvent, client, user],
  );

  const setPostsHidden = useCallback(
    async (postIds: string[], isHidden: boolean) => {
      const results = await Promise.all(
        postIds.map((id) => (isHidden ? hidePost(id) : unhidePost(id))),
      );
      return results.every(({ successful }) => successful);
    },
    [hidePost, unhidePost],
  );

  const apply = useCallback(
    async (change: WhatsOffChange): Promise<AppliedWhatsOffChange | null> => {
      const { op, target } = change;
      const enabled = !!change.enabled;
      const mode = change.mode ?? null;
      switch (op) {
        case WhatsOffOp.Topic: {
          if (!target) {
            return null;
          }
          const previous = getTopicControl(target.id);
          setTopic(target.id, { mode: mode as FeedTopicMode | null });
          return {
            undo: () => run(() => setTopic(target.id, toValue(previous))),
          };
        }
        case WhatsOffOp.Source: {
          if (!target) {
            return null;
          }
          const previous = getSourceControl(target.id);
          setSource(target.id, { mode: mode as FeedSourceMode | null });
          return {
            undo: () => run(() => setSource(target.id, toValue(previous))),
          };
        }
        case WhatsOffOp.Author: {
          if (!target) {
            return null;
          }
          const previous = getAuthorControl(target.id);
          setAuthor(target.id, { mode: mode as FeedAuthorMode | null });
          return {
            undo: () => run(() => setAuthor(target.id, toValue(previous))),
          };
        }
        case WhatsOffOp.Follow:
        case WhatsOffOp.Unfollow:
        case WhatsOffOp.Block:
        case WhatsOffOp.Unblock: {
          if (!target || !(await run(() => setPreference(op, target)))) {
            return null;
          }
          return {
            undo: () => run(() => setPreference(inverseOp[op], target)),
          };
        }
        case WhatsOffOp.Format:
        case WhatsOffOp.Curation:
        case WhatsOffOp.Squads: {
          const id = change.advancedSettingId;
          if (!id || !(await run(() => onUpdateSettings([{ id, enabled }])))) {
            return null;
          }
          return {
            undo: () =>
              run(() => onUpdateSettings([{ id, enabled: !enabled }])),
          };
        }
        case WhatsOffOp.BlockedWord: {
          const word = change.value;
          if (!word || !(await run(() => setBlockedWord(word, true)))) {
            return null;
          }
          return { undo: () => run(() => setBlockedWord(word, false)) };
        }
        case WhatsOffOp.ClickbaitShield: {
          if (!(await run(() => setClickbaitShield(enabled)))) {
            return null;
          }
          return { undo: () => run(() => setClickbaitShield(!enabled)) };
        }
        case WhatsOffOp.Learning: {
          const previous = controls?.learning ?? true;
          setLearning(enabled);
          return { undo: () => run(() => setLearning(previous)) };
        }
        case WhatsOffOp.FillIns: {
          const previous = controls?.fillIns ?? true;
          setFillIns(enabled);
          return { undo: () => run(() => setFillIns(previous)) };
        }
        case WhatsOffOp.Reset: {
          const flags = resetFlags[change.value ?? ''];
          // Nothing brings back what a reset forgets.
          return flags && (await reset(flags)) ? {} : null;
        }
        case WhatsOffOp.Ranking: {
          const key = change.value;
          if (!key || typeof change.to !== 'number') {
            return null;
          }
          const previous =
            controls?.ranking.find((setting) => setting.key === key)?.value ??
            null;
          setRankingSetting(key, change.to);
          return { undo: () => run(() => setRankingSetting(key, previous)) };
        }
        case WhatsOffOp.HidePosts: {
          const postIds = change.postIds ?? [];
          if (
            !postIds.length ||
            !(await run(() => setPostsHidden(postIds, true)))
          ) {
            return null;
          }
          return { undo: () => run(() => setPostsHidden(postIds, false)) };
        }
        default:
          return null;
      }
    },
    [
      controls,
      getTopicControl,
      getSourceControl,
      getAuthorControl,
      setTopic,
      setSource,
      setAuthor,
      setLearning,
      setFillIns,
      setRankingSetting,
      reset,
      onUpdateSettings,
      setPreference,
      setBlockedWord,
      setClickbaitShield,
      setPostsHidden,
      run,
    ],
  );

  const isInEffect = useCallback(
    ({ op, target, mode, enabled, value, to }: WhatsOffChange): boolean => {
      if (!controls) {
        return true;
      }
      const id = target?.id ?? '';
      const level = mode ?? null;
      switch (op) {
        case WhatsOffOp.Topic:
          return (getTopicControl(id)?.mode ?? null) === level;
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
