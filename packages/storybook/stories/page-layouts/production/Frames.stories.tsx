import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as home from '../../../../webapp/pages/index';
import * as posts from '../../../../webapp/pages/posts/index';
import * as newFeed from '../../../../webapp/pages/feeds/new';
import * as tag from '../../../../webapp/pages/tags/[tag]';
import * as tagsDirectory from '../../../../webapp/pages/tags/index';
import * as sources from '../../../../webapp/pages/sources/index';
import * as squadsDiscover from '../../../../webapp/pages/squads/discover/index';
import * as marketplace from '../../../../webapp/pages/marketplace/index';
import * as agentHome from '../../../../webapp/pages/agent/index';
import * as agentWorkspace from '../../../../webapp/pages/agent/[id]/index';
import * as notifications from '../../../../webapp/pages/notifications';
import * as tips from '../../../../webapp/pages/tips';
import * as bestOfYear from '../../../../webapp/pages/posts/best-of/[year]';
import * as marketplaceSubmit from '../../../../webapp/pages/marketplace/submit';
import * as highlights from '../../../../webapp/pages/highlights/index';
import * as achievement from '../../../../webapp/pages/achievements/[id]';
import * as agentsAsk from '../../../../webapp/pages/agents/ask/index';
import * as squadsCreate from '../../../../webapp/pages/squads/create';
import * as leaderboard from '../../../../webapp/pages/users/[id]';
import * as gameCenter from '../../../../webapp/pages/game-center/index';
import * as post from '../../../../webapp/pages/posts/[id]/index';
import * as article from '../../../../webapp/pages/articles/[id]';
import * as wallet from '../../../../webapp/pages/wallet';
import * as search from '../../../../webapp/pages/search/posts/index';
import * as job from '../../../../webapp/pages/jobs/[id]/index';
import * as squad from '../../../../webapp/pages/squads/[handle]/index';
import * as squadsFeatured from '../../../../webapp/pages/squads/discover/featured';
import * as lfg from '../../../../webapp/pages/lfg/index';
import * as profile from '../../../../webapp/pages/[userId]/index';
import * as messages from '../../../../webapp/pages/messages/[[...peer]]';
import * as bookmarks from '../../../../webapp/pages/bookmarks/index';
import * as settingsProfile from '../../../../webapp/pages/settings/profile';
import * as organizationGeneral from '../../../../webapp/pages/settings/organization/[orgId]/general';
import * as squadManage from '../../../../webapp/pages/squads/[handle]/manage/index';
import * as you from '../../../../webapp/pages/you';
import * as recruiterDashboard from '../../../../webapp/pages/recruiter/dashboard/index';
import * as recruiterMatches from '../../../../webapp/pages/recruiter/[opportunityId]/matches/index';
import * as jobDone from '../../../../webapp/pages/jobs/[id]/done';
import * as plus from '../../../../webapp/pages/plus/index';
import * as cores from '../../../../webapp/pages/cores/index';
import * as pay from '../../../../webapp/pages/pay';
import * as notFound from '../../../../webapp/pages/404';
import * as onboarding from '../../../../webapp/pages/onboarding';
import * as resetPassword from '../../../../webapp/pages/reset-password';
import * as recruiter from '../../../../webapp/pages/recruiter/index';
import * as recruiterEdit from '../../../../webapp/pages/recruiter/[opportunityId]/edit';
import * as recruiterPayment from '../../../../webapp/pages/recruiter/[opportunityId]/payment';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';
import type { PageModule } from './harness';
import {
  bootAsVisitor,
  liveApi,
  LivePage,
  ownSquad,
  setRoute,
} from './harness';

// One production page per story, at whatever width the frame gives it. The
// category pages embed these at laptop, tablet and phone widths; they are
// hidden from the sidebar.

const meta: Meta = {
  title: 'Page layouts/Production frames',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen', msw: { handlers: liveApi } },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

const frame = (
  page: unknown,
  title: string,
  pathname: string,
  params: Record<string, string> = {},
  features: Record<string, unknown> = {},
): Story => ({
  loaders: [
    () => {
      setRoute(pathname, params);
      // next/head sets the title in production; the sidebar's Recent list
      // reads it. Each frame starts with an empty Recent list.
      document.title = title;
      localStorage.removeItem('dailydev:recentPages');
    },
  ],
  render: () => (
    <FeatureOverrides values={features}>
      <LivePage page={page as PageModule} params={params} />
    </FeatureOverrides>
  ),
});

// Direct messages, and Looking for group on top of them, are still rolling
// out; these frames show the pages as someone inside the rollout sees them.
const withMessages = { direct_messages: true, lfg: true };

export const Home = frame(home, 'Home', '/');
export const Posts = frame(posts, 'Explore', '/posts');
export const NewFeed = frame(newFeed, 'New feed', '/feeds/new');
export const Tag = frame(tag, 'javascript', '/tags/[tag]', {
  tag: 'javascript',
});
export const TagsDirectory = frame(tagsDirectory, 'Tags', '/tags');
export const Sources = frame(sources, 'Sources', '/sources');
export const SquadsDiscover = frame(
  squadsDiscover,
  'Squads',
  '/squads/discover',
);
export const Marketplace = frame(marketplace, 'Marketplace', '/marketplace');

// Content
export const AgentHome = frame(agentHome, 'Agent', '/agent');
export const AgentWorkspace = frame(agentWorkspace, 'Agent', '/agent/[id]', {
  id: 'page-layouts-agent',
});
export const Notifications = frame(
  notifications,
  'Notifications',
  '/notifications',
);
export const Tips = frame(tips, 'Tips', '/tips');
export const BestOfYear = frame(
  bestOfYear,
  'Best of 2025',
  '/posts/best-of/[year]',
  { year: '2025' },
);
export const MarketplaceSubmit = frame(
  marketplaceSubmit,
  'Submit a tool',
  '/marketplace/submit',
);
export const Highlights = frame(highlights, 'Highlights', '/highlights');
export const Achievement = frame(
  achievement,
  'Achievement',
  '/achievements/[id]',
  { id: 'page-layouts-achievement' },
);
export const AgentsAsk = frame(agentsAsk, 'Ask', '/agents/ask');
export const SquadsCreate = frame(squadsCreate, 'New Squad', '/squads/create');
export const Leaderboard = frame(leaderboard, 'Leaderboard', '/users/[id]', {
  id: 'highestLevel',
});
export const GameCenter = frame(gameCenter, 'Game center', '/game-center');
export const You = frame(you, 'You', '/you');
export const Post = frame(post, 'Post', '/posts/[id]', { id: 'qojM1enSN' });
export const Article = frame(article, 'Article', '/articles/[id]', {
  id: 'qojM1enSN',
});
export const Wallet = frame(wallet, 'Wallet', '/wallet');
export const Search = frame(search, 'Search', '/search/posts', {
  q: 'react',
});
export const Job = frame(job, 'Job', '/jobs/[id]', {
  id: 'page-layouts-job',
});
export const Squad = frame(squad, 'daily.dev updates', '/squads/[handle]', {
  handle: 'daily_updates',
});
export const SquadsFeatured = frame(
  squadsFeatured,
  'Featured Squads',
  '/squads/discover/featured',
);
export const Lfg = frame(lfg, 'Looking for group', '/lfg', {}, withMessages);
export const Profile = frame(profile, 'daily.dev', '/[userId]', {
  userId: 'dailydotdev',
});
export const Messages = frame(
  messages,
  'Messages',
  '/messages/[[...peer]]',
  {},
  withMessages,
);
export const Bookmarks = frame(bookmarks, 'Bookmarks', '/bookmarks');
export const SettingsProfile = frame(
  settingsProfile,
  'Profile settings',
  '/settings/profile',
);
export const OrganizationGeneral = frame(
  organizationGeneral,
  'Organization',
  '/settings/organization/[orgId]/general',
  { orgId: 'page-layouts-org' },
);
// Only a Squad's admins can manage it, so this member runs it here.
const squadManageFrame = frame(
  squadManage,
  'Manage Squad',
  '/squads/[handle]/manage',
  { handle: 'daily_updates' },
);
export const SquadManage: Story = {
  ...squadManageFrame,
  loaders: [
    ...(squadManageFrame.loaders as []),
    () => ownSquad('daily_updates'),
  ],
};

// Marketing
export const Plus = frame(plus, 'daily.dev Plus', '/plus');
export const Cores = frame(cores, 'Cores', '/cores');

// Standalone
const opportunity = { opportunityId: 'page-layouts-opportunity' };
export const RecruiterDashboard = frame(
  recruiterDashboard,
  'Recruiter',
  '/recruiter/dashboard',
);
export const RecruiterMatches = frame(
  recruiterMatches,
  'Matches',
  '/recruiter/[opportunityId]/matches',
  opportunity,
);
export const JobDone = frame(jobDone, 'Job', '/jobs/[id]/done', {
  id: 'page-layouts-job',
});
export const Pay = frame(pay, 'Pay', '/pay');
export const NotFound = frame(notFound, 'Page not found', '/404');
const onboardingFrame = frame(onboarding, 'Onboarding', '/onboarding');
export const Onboarding: Story = {
  ...onboardingFrame,
  loaders: [...(onboardingFrame.loaders as []), bootAsVisitor],
};
// Without a token the page reports an invalid link instead of the form.
export const ResetPassword = frame(
  resetPassword,
  'Reset password',
  '/reset-password',
  { token: 'page-layouts-token' },
);
export const Recruiter = frame(recruiter, 'Recruiter', '/recruiter');
export const RecruiterEdit = frame(
  recruiterEdit,
  'Edit job',
  '/recruiter/[opportunityId]/edit',
  opportunity,
);
export const RecruiterPayment = frame(
  recruiterPayment,
  'Payment',
  '/recruiter/[opportunityId]/payment',
  opportunity,
);
