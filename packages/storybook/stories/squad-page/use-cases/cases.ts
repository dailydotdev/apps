import { Viewer } from '../kit';
import type { SquadConfig } from '../workspace';
import { ContentSource, MemberRole, PostingGate } from '../workspace';

// Every use case, on the chosen direction (Squad Page, 1. Direction).
// One list so the stories, the index and the phone frames (which load a
// case by id in the Direction playground) all draw from the same place.

export interface UseCase {
  id: string;
  title: string;
  who: string;
  sees: string;
  viewer: Viewer;
  /** A page id, or a feed chip: releases, discussions, polls, about. */
  page?: string;
  source?: ContentSource;
  empty?: boolean;
  isPrivate?: boolean;
  config?: Partial<SquadConfig>;
  /** rem, the desktop frame's height */
  height?: number;
}

export const viewerCases: UseCase[] = [
  {
    id: 'anonymous',
    title: 'Anonymous',
    who: 'Logged out, from a link or a search result',
    sees: 'The page reads in full. The header ends with Sign up to follow, full width under the stats on a phone. The composer is the lock card, no bell, polls are read-only.',
    viewer: Viewer.Anonymous,
  },
  {
    id: 'visitor',
    title: 'Logged in, not a member',
    who: 'A daily.dev user who has not followed',
    sees: 'Follow is the one primary button, last in the header row. Everything reads; the composer says Follow to create new posts.',
    viewer: Viewer.Visitor,
  },
  {
    id: 'member',
    title: 'Member',
    who: 'Following',
    sees: 'Following in the Subtle style and the bell in the header, the composer with Share a link, a vote in Polls.',
    viewer: Viewer.Member,
  },
  {
    id: 'moderator',
    title: 'Moderator',
    who: 'A member the company trusts with the queue',
    sees: 'Everything a member has, plus the Manage gear with only Moderation, View as a visitor and the share card at the top of the right column, and Poll in the composer. No analytics or settings.',
    viewer: Viewer.Moderator,
  },
  {
    id: 'admin',
    title: 'Admin',
    who: 'The company, or the daily.dev manager acting for them',
    sees: 'Edit page and Boost in the header, the full Manage menu, View as a visitor and the share card, the Analytics widget, Poll in the composer, Add product on Products.',
    viewer: Viewer.Admin,
  },
  {
    id: 'blocked',
    title: 'Blocked',
    who: 'Removed by a moderator, still logged in',
    sees: 'A public squad still reads. Follow is disabled with “You are not allowed to follow this Squad”, the composer is the lock card, no bell. A private squad shows the wall.',
    viewer: Viewer.Blocked,
  },
];

export const postingCases: UseCase[] = [
  {
    id: 'discussions-anonymous',
    title: 'Discussions, logged out',
    who: 'Anonymous',
    sees: 'The composer is the lock card. The Discussions chip reads in full.',
    viewer: Viewer.Anonymous,
    page: 'discussions',
    height: 40,
  },
  {
    id: 'discussions-visitor',
    title: 'Discussions, not a member',
    who: 'Logged in, not followed',
    sees: 'The lock card says Follow to create new posts. Same feed.',
    viewer: Viewer.Visitor,
    page: 'discussions',
    height: 40,
  },
  {
    id: 'discussions-member',
    title: 'Discussions, as a member',
    who: 'Member',
    sees: 'The whole composer box opens the new composer; Share a link is the shortcut. The post waits for a moderator if the squad reviews posts.',
    viewer: Viewer.Member,
    page: 'discussions',
    height: 40,
  },
  {
    id: 'releases-fed',
    title: 'Releases on a verified page',
    who: 'Admin, feed connected',
    sees: 'No New release: the feed publishes. Feed settings instead, and a strip says where the posts come from.',
    viewer: Viewer.Admin,
    page: 'releases',
    source: ContentSource.Feed,
    height: 44,
  },
  {
    id: 'releases-manual',
    title: 'Releases on a hand-written squad',
    who: 'Admin, no feed',
    sees: 'New release, and no strip. The same list with the company writing instead of syncing.',
    viewer: Viewer.Admin,
    page: 'releases',
    source: ContentSource.Manual,
    height: 44,
  },
  {
    id: 'polls-member',
    title: 'Polls, as a member',
    who: 'Member',
    sees: 'One vote each on the production poll card. The composer has no Poll shortcut; asking is the team’s.',
    viewer: Viewer.Member,
    page: 'polls',
    height: 44,
  },
  {
    id: 'polls-moderator',
    title: 'Polls, as a moderator',
    who: 'Moderator',
    sees: 'New poll above the list, and Poll in the composer. Moderators can ask.',
    viewer: Viewer.Moderator,
    page: 'polls',
    height: 44,
  },
  {
    id: 'moderation',
    title: 'The queue',
    who: 'Moderator',
    sees: 'Member posts waiting for approval, with Approve and Decline. Moderation is the only page in a moderator’s Manage menu.',
    viewer: Viewer.Moderator,
    page: 'moderation',
    height: 44,
  },
];

export const contentCases: UseCase[] = [
  {
    id: 'feed-admin',
    title: 'The content feed, as an admin',
    who: 'The company, or its daily.dev manager',
    sees: 'Managed by daily.dev up top with a contact. The source, its health, where it publishes, how often it is checked, what it has imported. Sync, pause, add a feed. Recent imports with their state.',
    viewer: Viewer.Admin,
    page: 'feed',
    source: ContentSource.Feed,
    height: 52,
  },
  {
    id: 'feed-member',
    title: 'Releases, as a member of a fed page',
    who: 'Member',
    sees: 'A one-line strip says the posts are published from the company’s feed. Otherwise the normal Releases list.',
    viewer: Viewer.Member,
    page: 'releases',
    source: ContentSource.Feed,
    height: 44,
  },
  {
    id: 'manual-moderator',
    title: 'Releases on a plain squad, as a moderator',
    who: 'Moderator, no feed',
    sees: 'New release. There is no Content feed page because there is no feed.',
    viewer: Viewer.Moderator,
    page: 'releases',
    source: ContentSource.Manual,
    height: 44,
  },
  {
    id: 'manual-admin',
    title: 'A plain squad’s Manage menu',
    who: 'Admin, no feed',
    sees: 'The gear in the header opens Moderation, Analytics, Settings. Content feed appears only once a feed is connected.',
    viewer: Viewer.Admin,
    source: ContentSource.Manual,
    height: 44,
  },
];

export const stateCases: UseCase[] = [
  {
    id: 'empty-admin',
    title: 'Just created, as an admin',
    who: 'Admin, feed not yet delivering',
    sees: 'The header, the badge, the rules, the team and the links are all there. No products shelf and no pins yet; the feed says what to do next: connect the feed or write the first post.',
    viewer: Viewer.Admin,
    empty: true,
    height: 44,
  },
  {
    id: 'empty-visitor',
    title: 'Just created, as a visitor',
    who: 'Logged in, not followed',
    sees: 'The same page with an empty feed asking them to follow to hear when the team posts.',
    viewer: Viewer.Visitor,
    empty: true,
    height: 44,
  },
  {
    id: 'empty-releases',
    title: 'Releases before the first item',
    who: 'Member, feed connected',
    sees: 'The feed strip and an empty list: the first item lands the hour it is published.',
    viewer: Viewer.Member,
    page: 'releases',
    empty: true,
    source: ContentSource.Feed,
    height: 40,
  },
  {
    id: 'private-anonymous',
    title: 'Private squad, logged out',
    who: 'Anonymous',
    sees: 'The header, rules and team read; the feed and every page are production’s Unauthorized copy, with Log in.',
    viewer: Viewer.Anonymous,
    isPrivate: true,
    height: 40,
  },
  {
    id: 'private-visitor',
    title: 'Private squad, logged in',
    who: 'Logged in, not a member',
    sees: 'The same wall without Log in. There is no request to join in production; the invitation link is the only door.',
    viewer: Viewer.Visitor,
    page: 'releases',
    isPrivate: true,
    height: 40,
  },
  {
    id: 'private-member',
    title: 'Private squad, as a member',
    who: 'Member',
    sees: 'No wall. The squad behaves like any other.',
    viewer: Viewer.Member,
    page: 'discussions',
    isPrivate: true,
    height: 40,
  },
];

// Every state the production squad page has today, and where it lives in
// the direction. Audited from packages/webapp/pages/squads/** and
// packages/shared/src/components/squads/** on 23 Sep 2026. Copy is
// production's, word for word, unless a case says it changed.
export const productionCases: UseCase[] = [
  {
    id: 'blocked-member',
    title: 'Blocked member',
    who: 'SourceMemberRole.Blocked',
    sees: 'Follow is disabled with production’s copy, the composer is the lock card, the bell and Unfollow are gone (production still shows them, a quirk). The page reads in full because the squad is public.',
    viewer: Viewer.Blocked,
    height: 44,
  },
  {
    id: 'featured',
    title: 'Featured public squad with a category',
    who: 'Visitor',
    sees: 'The meta line carries production’s SquadPrivacyState (Featured outranks Public outranks Private) and the category link to the directory. Awards appear in the stats when the squad has any.',
    viewer: Viewer.Visitor,
    config: { featured: true, category: 'DevRel' },
    height: 40,
  },
  {
    id: 'mods-only',
    title: 'Only moderators can post',
    who: 'Member, memberPostingRole = moderator',
    sees: 'The lock card says “Only admins and moderators can post”.',
    viewer: Viewer.Member,
    config: {
      memberPostingRole: MemberRole.Moderator,
      postingGate: PostingGate.None,
    },
    height: 40,
  },
  {
    id: 'reputation',
    title: 'Reputation gate, member below it',
    who: 'Member with 120 reputation, threshold 250',
    sees: '“You need 250 reputation points to post”. A member above the threshold posts without review.',
    viewer: Viewer.Member,
    config: {
      postingGate: PostingGate.Reputation,
      postingMinReputation: 250,
      viewerReputation: 120,
    },
    height: 40,
  },
  {
    id: 'moderated',
    title: 'Post approval on, member with posts in the queue',
    who: 'Member, moderationRequired',
    sees: 'The composer works and says posts are reviewed before they go live. Above it, the member’s own queue: two waiting.',
    viewer: Viewer.Member,
    config: { postingGate: PostingGate.Moderation, ownPending: 2 },
    height: 44,
  },
  {
    id: 'pending',
    title: 'Pending posts, the author’s view',
    who: 'Member',
    sees: 'Production’s /squads/moderate for a non-moderator: Pending and Rejected items, the rejection reason, Resubmitted Post, Edit and Delete.',
    viewer: Viewer.Member,
    page: 'pending',
    config: { ownPending: 3 },
    height: 44,
  },
  {
    id: 'queue',
    title: 'The moderation queue',
    who: 'Moderator',
    sees: 'Approve all N posts, the spam warning, a poll item, Decline opening the ten production reasons, Approve.',
    viewer: Viewer.Moderator,
    page: 'moderation',
    height: 48,
  },
  {
    id: 'queue-empty',
    title: 'The queue, all done',
    who: 'Moderator',
    sees: 'Production’s empty copy. Authors get theirs on Pending posts (production shows skeletons forever there, a bug).',
    viewer: Viewer.Moderator,
    page: 'moderation',
    empty: true,
    height: 36,
  },
  {
    id: 'members',
    title: 'Followers with the Blocked tab and the role menu',
    who: 'Admin',
    sees: 'Production’s SquadMemberModal as a page: three tabs, search, Copy invitation link first, Mod badges, and the member menu (Make admin, Promote, Demote, Report, Block, Gift Plus).',
    viewer: Viewer.Admin,
    page: 'members',
    height: 44,
  },
  {
    id: 'members-member',
    title: 'Followers as a plain follower',
    who: 'Member, memberInviteRole = member',
    sees: 'Two tabs, Copy invitation link because members may invite, Follow on rows instead of the menu.',
    viewer: Viewer.Member,
    page: 'members',
    height: 40,
  },
  {
    id: 'settings',
    title: 'Squad settings',
    who: 'Admin',
    sees: 'Production’s Details form and its sections: details with cover upload, Squad type with the category, Moderation settings, Integrations (Slack, plus the content feed on a fed page), Danger zone.',
    viewer: Viewer.Admin,
    page: 'settings',
    height: 56,
  },
  {
    id: 'analytics',
    title: 'Squad analytics with a boost running',
    who: 'Admin, ViewAnalytics, campaign active',
    sees: 'Impressions and unique reach, the 45-day chart with boosted days in cabbage, the numbers list. The header says View boost instead of Boost.',
    viewer: Viewer.Admin,
    page: 'analytics',
    config: { campaign: true },
    height: 44,
  },
  {
    id: 'add-product',
    title: 'Adding a product',
    who: 'Admin',
    sees: 'The profile’s add-experience pattern: its own page, Save in the header, the link first to fill the rest, then logo, name, tagline, category, pricing, description.',
    viewer: Viewer.Admin,
    page: 'add-product',
    height: 52,
  },
  {
    id: 'invite-anonymous',
    title: 'Invitation link, logged out',
    who: 'Anonymous on /squads/[handle]/[token]',
    sees: 'Production’s landing: who invited you, the squad card, Join Squad (sign up first), who is waiting inside.',
    viewer: Viewer.Anonymous,
    page: 'invite',
    height: 44,
  },
  {
    id: 'invite-blocked',
    title: 'Invitation link, blocked',
    who: 'Blocked',
    sees: 'Join is disabled and the forbidden label shows. Production shows it as a toast on click.',
    viewer: Viewer.Blocked,
    page: 'invite',
    height: 44,
  },
  {
    id: 'private-wall',
    title: 'Private squad, not a member',
    who: 'Logged in, not a member',
    sees: 'Production’s Unauthorized screen, word for word, under the header. The invitation link is the only door.',
    viewer: Viewer.Visitor,
    page: 'releases',
    isPrivate: true,
    height: 40,
  },
  {
    id: 'not-found',
    title: 'Deleted squad or bad handle',
    who: 'Anyone',
    sees: 'Production’s Custom404 copy, plus a Find Squads door it does not have.',
    viewer: Viewer.Visitor,
    page: 'not-found',
    height: 32,
  },
];

export const allCases: UseCase[] = [
  ...viewerCases,
  ...postingCases,
  ...contentCases,
  ...stateCases,
  ...productionCases,
];

export const caseById = Object.fromEntries(
  allCases.map((useCase) => [useCase.id, useCase]),
) as Record<string, UseCase>;
