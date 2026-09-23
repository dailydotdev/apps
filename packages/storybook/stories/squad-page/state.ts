import { createContext, useContext } from 'react';
import { isJoined, isStaff, Viewer } from './kit';

// The squad's state, shared by the workspace shell and the Home page so
// neither has to import the other.

/**
 * How posts get in. A regular squad is written by hand. A verified company
 * page is fed: the company's RSS (releases, blog, changelog) lands in
 * Releases as posts, daily.dev runs the feed for them, and members still
 * write in Discussions and vote in Polls. Same squad underneath.
 */
export enum ContentSource {
  Manual = 'manual',
  Feed = 'feed',
}

/**
 * Production's posting gate, one radio in Squad settings: anyone can post,
 * every member post is reviewed, or only members above a reputation
 * threshold may post (no review). Moderators and admins bypass all three.
 */
export enum PostingGate {
  None = 'none',
  Moderation = 'moderation',
  Reputation = 'reputation',
}

/** Who may do a thing: every member, or only moderators and admins. */
export enum MemberRole {
  Member = 'member',
  Moderator = 'moderator',
}

/**
 * The squad's own settings as production stores them, plus the bits of
 * per-member state the page reads. Every case in the use-case stories is a
 * combination of these and the viewer.
 */
export interface SquadConfig {
  /** Public squads are joinable and listed; private ones are invite-only. */
  isPublic: boolean;
  /** Set by daily.dev, shown as a badge, listed under Featured. */
  featured: boolean;
  /** Public squads only. Links to the directory. */
  category?: string;
  memberPostingRole: MemberRole;
  postingGate: PostingGate;
  postingMinReputation: number;
  memberInviteRole: MemberRole;
  /** A boost campaign is running. */
  campaign: boolean;
  /** Slack integration connected. */
  slack: boolean;
  /** The viewer's reputation, for the reputation gate. */
  viewerReputation: number;
  /** The member chose to collapse pinned posts. */
  pinnedCollapsed: boolean;
  /** Posts by the viewer waiting in the queue, or rejected. */
  ownPending: number;
}

export const defaultConfig: SquadConfig = {
  isPublic: true,
  featured: false,
  category: 'DevRel',
  memberPostingRole: MemberRole.Member,
  postingGate: PostingGate.Moderation,
  postingMinReputation: 250,
  memberInviteRole: MemberRole.Member,
  campaign: false,
  slack: false,
  viewerReputation: 1200,
  pinnedCollapsed: false,
  ownPending: 0,
};

export interface WorkspaceState {
  viewer: Viewer;
  source: ContentSource;
  /** No posts yet. */
  empty: boolean;
  /** Members only; everyone else sees the wall. */
  isPrivate: boolean;
  config: SquadConfig;
}

export const WorkspaceContext = createContext<WorkspaceState>({
  viewer: Viewer.Member,
  source: ContentSource.Feed,
  empty: false,
  isPrivate: false,
  config: defaultConfig,
});

/**
 * Production's getPostingDisabledText and the Blocked role, as one answer:
 * may this viewer post here, and if not, what does the lock card say.
 * Moderators and admins always may.
 */
export const postingState = (
  viewer: Viewer,
  config: SquadConfig,
): { canPost: boolean; reason?: string; reviewed?: boolean } => {
  if (isStaff(viewer)) {
    return { canPost: true };
  }
  if (viewer === Viewer.Blocked) {
    return {
      canPost: false,
      reason: 'You no longer have access to this Squad.',
    };
  }
  if (!isJoined(viewer)) {
    return { canPost: false, reason: 'Join the Squad to create new posts' };
  }
  if (config.memberPostingRole === MemberRole.Moderator) {
    return { canPost: false, reason: 'Only admins and moderators can post' };
  }
  if (
    config.postingGate === PostingGate.Reputation &&
    config.viewerReputation < config.postingMinReputation
  ) {
    return {
      canPost: false,
      reason: `You need ${config.postingMinReputation} reputation points to post`,
    };
  }
  return {
    canPost: true,
    reviewed: config.postingGate === PostingGate.Moderation,
  };
};

export const useWorkspace = (): WorkspaceState => useContext(WorkspaceContext);
