import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useJoinSquad } from '../../../hooks/useJoinSquad';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { verifyPermission } from '../../../graphql/squads';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourcePermissions } from '../../../graphql/sources';
import { gqlClient } from '../../../graphql/common';
import {
  CONTENT_PREFERENCE_FOLLOW_MUTATION,
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';
import { hideSourceFeedPosts } from '../../../graphql/notifications';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { AuthTriggers } from '../../../lib/auth';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';

interface UseWatercoolerPostingProps {
  squad: Squad;
}

interface UseWatercoolerPosting {
  canPost: boolean;
  /**
   * Why posting is blocked, for the disabled button's tooltip. Undefined when
   * the user can post (including logged-out, where the click opens auth).
   */
  blockedReason?: string;
  isJoining: boolean;
  /**
   * Clears the way to post: opens auth when logged out, re-checks the gate, and
   * joins the squad silently when needed. Resolves false when posting can't go
   * ahead, so callers can bail before submitting.
   */
  ensureCanPost: () => Promise<boolean>;
  /** Hand off to the full composer, joining first if needed. */
  openComposer: (draft?: ComposerDraft) => Promise<void>;
}

interface ComposerDraft {
  title?: string;
  content?: string;
}

const reputationCopy = (minReputation: number): string =>
  `You need ${minReputation} reputation points to post`;

// Mirrors the gate copy on the squad page so a member sees the same reason in
// both places. Non-members are measured against the role and reputation they
// would land on right after joining.
const getBlockedReason = (
  squad: Squad,
  reputation: number,
): string | undefined => {
  const { currentMember, memberPostingRole, postingMinReputation } = squad;

  if (currentMember) {
    if (verifyPermission(squad, SourcePermissions.Post)) {
      return undefined;
    }

    if (
      typeof postingMinReputation === 'number' &&
      currentMember.role === SourceMemberRole.Member
    ) {
      return reputationCopy(postingMinReputation);
    }

    return 'Only admins and moderators can post';
  }

  if (memberPostingRole && memberPostingRole !== SourceMemberRole.Member) {
    return 'Only admins and moderators can post';
  }

  if (
    typeof postingMinReputation === 'number' &&
    reputation < postingMinReputation
  ) {
    return reputationCopy(postingMinReputation);
  }

  return undefined;
};

/**
 * Posting to the watercooler squad without making the user manage a membership.
 * A qualifying non-member is joined on the spot, silently: the API subscribes
 * new members by default, so we immediately downgrade the content preference to
 * a plain follow (which makes the API drop the squad's notification
 * preferences) and hide its posts from their feed.
 */
export const useWatercoolerPosting = ({
  squad,
}: UseWatercoolerPostingProps): UseWatercoolerPosting => {
  const { user, showLogin } = useAuthContext();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const joinSquad = useJoinSquad({ squad });
  const isMember = !!squad.currentMember;

  const { mutateAsync: joinSilently, isPending: isJoining } = useMutation({
    mutationFn: async () => {
      const joined = await joinSquad();

      if (!joined.id) {
        throw new Error('joinSource returned a squad without an id');
      }

      await gqlClient.request(CONTENT_PREFERENCE_FOLLOW_MUTATION, {
        id: joined.id,
        entity: ContentPreferenceType.Source,
        status: ContentPreferenceStatus.Follow,
      });
      await hideSourceFeedPosts(joined.id);

      return joined;
    },
    onSuccess: (joined) => {
      // useJoinSquad primes the caches from the join response, which predates
      // both follow-up mutations. Refetch so membership flags and the follow
      // status reflect what actually landed.
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Squad, user, joined.handle),
      });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.ContentPreference, user, {
          id: joined.id,
          entity: ContentPreferenceType.Source,
        }),
      });
    },
    onError: () => {
      displayToast(labels.error.generic);
    },
  });

  // Logged-out visitors keep an enabled button: the gate is only knowable once
  // we have a reputation to measure, and the click opens auth first.
  const blockedReason = user
    ? getBlockedReason(squad, user.reputation ?? 0)
    : undefined;

  const ensureCanPost = useCallback(async () => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.JoinSquad });
      return false;
    }

    if (getBlockedReason(squad, user.reputation ?? 0)) {
      return false;
    }

    if (isMember) {
      return true;
    }

    try {
      await joinSilently();
      return true;
    } catch {
      return false;
    }
  }, [isMember, joinSilently, showLogin, squad, user]);

  const openComposer = useCallback(
    async (draft?: ComposerDraft) => {
      if (!(await ensureCanPost())) {
        return;
      }

      openModal({
        type: LazyModal.SmartComposer,
        props: {
          initialSquadId: squad.id,
          initialKind: 'text',
          initialTitle: draft?.title,
          initialContent: draft?.content,
        },
      });
    },
    [ensureCanPost, openModal, squad.id],
  );

  return {
    canPost: !blockedReason,
    blockedReason,
    isJoining,
    ensureCanPost,
    openComposer,
  };
};
