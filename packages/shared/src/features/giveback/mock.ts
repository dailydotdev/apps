import type {
  GivebackAction,
  GivebackCampaign,
  GivebackCause,
  GivebackCommunityEvent,
  GivebackCommunityRally,
  GivebackLeaderboardEntry,
  GivebackLevel,
  GivebackSponsor,
  GivebackTopContributor,
  GivebackUserAction,
  GivebackUserProfile,
} from './types';
import {
  GivebackActionCategory,
  GivebackActionPersona,
  GivebackActionPlatform,
  GivebackActionValidationType,
  GivebackCampaignStatus,
  GivebackCauseStatus,
  GivebackRewardStatus,
  GivebackRewardType,
  GivebackSponsorType,
  GivebackUserActionStatus,
} from './types';

// Phase 1 mock data. This is the single source of truth the baseline page renders
// from, and the dev review toggle drives it. Replaced by live queries in a later phase.

export const GIVEBACK_CURRENCY = 'USD';

export const givebackCauses: GivebackCause[] = [
  {
    id: 'cause-software-freedom-conservancy',
    name: 'Software Freedom Conservancy',
    description:
      'Nonprofit home for free and open-source projects, funding their legal and governance work.',
    url: 'https://sfconservancy.org',
    logoUrl:
      'https://www.google.com/s2/favicons?domain=sfconservancy.org&sz=128',
    category: 'Open source',
    status: GivebackCauseStatus.Active,
    sortOrder: 1,
    recommended: true,
  },
  {
    id: 'cause-python-software-foundation',
    name: 'Python Software Foundation',
    description:
      'Sustains Python, PyPI, and the ecosystem infrastructure millions of developers rely on.',
    url: 'https://www.python.org/psf/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=python.org&sz=128',
    category: 'Open source',
    status: GivebackCauseStatus.Active,
    sortOrder: 2,
    recommended: true,
  },
  {
    id: 'cause-numfocus',
    name: 'NumFOCUS',
    description:
      'Powers open-source scientific computing tools like NumPy, pandas, and Jupyter.',
    url: 'https://numfocus.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=numfocus.org&sz=128',
    category: 'Open source',
    status: GivebackCauseStatus.Active,
    sortOrder: 3,
    recommended: true,
  },
  {
    id: 'cause-owasp',
    name: 'OWASP Foundation',
    description:
      'Improves software security with open-source projects, standards, and developer education.',
    url: 'https://owasp.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=owasp.org&sz=128',
    category: 'Security',
    status: GivebackCauseStatus.Active,
    sortOrder: 4,
    recommended: true,
  },
  {
    id: 'cause-freecodecamp',
    name: 'freeCodeCamp',
    description:
      'Free coding education at global scale, helping people become developers.',
    url: 'https://www.freecodecamp.org',
    logoUrl:
      'https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=128',
    category: 'Education',
    status: GivebackCauseStatus.Active,
    sortOrder: 5,
    recommended: true,
  },
  {
    id: 'cause-codepath',
    name: 'CodePath',
    description:
      'Reprograms higher education to create the next generation of software engineers.',
    url: 'https://www.codepath.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=codepath.org&sz=128',
    category: 'Education',
    status: GivebackCauseStatus.Active,
    sortOrder: 6,
    recommended: true,
  },
  {
    id: 'cause-raspberry-pi-foundation',
    name: 'Raspberry Pi Foundation',
    description:
      'Enables young people worldwide through computing and digital making.',
    url: 'https://www.raspberrypi.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=raspberrypi.org&sz=128',
    category: 'Education',
    status: GivebackCauseStatus.Active,
    sortOrder: 7,
    recommended: true,
  },
  {
    id: 'cause-codeyourfuture',
    name: 'CodeYourFuture',
    description:
      'Free coding school for refugees and people from disadvantaged backgrounds.',
    url: 'https://codeyourfuture.io',
    logoUrl:
      'https://www.google.com/s2/favicons?domain=codeyourfuture.io&sz=128',
    category: 'Inclusion',
    status: GivebackCauseStatus.Active,
    sortOrder: 8,
    recommended: true,
  },
  {
    id: 'cause-osmi',
    name: 'Open Sourcing Mental Health',
    description:
      'Supports mental wellness in the tech and open-source communities.',
    url: 'https://osmihelp.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=osmihelp.org&sz=128',
    category: 'Mental health',
    status: GivebackCauseStatus.Active,
    sortOrder: 9,
    recommended: true,
  },
  {
    id: 'cause-nv-access',
    name: 'NV Access',
    description:
      'Builds NVDA, the free open-source screen reader for blind and vision-impaired people.',
    url: 'https://www.nvaccess.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=nvaccess.org&sz=128',
    category: 'Accessibility',
    status: GivebackCauseStatus.Active,
    sortOrder: 10,
    recommended: true,
  },
  {
    id: 'cause-wikimedia',
    name: 'Wikimedia Foundation',
    description:
      'Hosts Wikipedia and keeps reliable, open knowledge accessible to everyone.',
    url: 'https://wikimediafoundation.org',
    logoUrl:
      'https://www.google.com/s2/favicons?domain=wikimediafoundation.org&sz=128',
    category: 'Public knowledge',
    status: GivebackCauseStatus.Active,
    sortOrder: 11,
    recommended: false,
  },
  {
    id: 'cause-human-i-t',
    name: 'Human-I-T',
    description:
      'Turns donated tech into refurbished devices, low-cost internet, and digital training.',
    url: 'https://www.human-i-t.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=human-i-t.org&sz=128',
    category: 'Digital equity',
    status: GivebackCauseStatus.Active,
    sortOrder: 12,
    recommended: false,
  },
  {
    id: 'cause-givewell',
    name: 'GiveWell Top Charities Fund',
    description:
      'Directs funds to rigorously researched, high-impact global health and relief charities.',
    url: 'https://www.givewell.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=givewell.org&sz=128',
    category: 'Humanitarian',
    status: GivebackCauseStatus.Active,
    sortOrder: 13,
    recommended: false,
  },
  {
    id: 'cause-eff',
    name: 'Electronic Frontier Foundation',
    description:
      'Defends digital privacy, free expression, and user rights online.',
    url: 'https://www.eff.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=eff.org&sz=128',
    category: 'Digital rights',
    status: GivebackCauseStatus.Active,
    sortOrder: 14,
    recommended: false,
  },
  {
    id: 'cause-internet-archive',
    name: 'Internet Archive',
    description:
      'Preserves the web, software, and cultural memory for open access by everyone.',
    url: 'https://archive.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=archive.org&sz=128',
    category: 'Digital preservation',
    status: GivebackCauseStatus.Active,
    sortOrder: 15,
    recommended: false,
  },
  {
    id: 'cause-green-web-foundation',
    name: 'Green Web Foundation',
    description:
      'Works toward a fossil-free internet and tools for greener digital services.',
    url: 'https://www.thegreenwebfoundation.org',
    logoUrl:
      'https://www.google.com/s2/favicons?domain=thegreenwebfoundation.org&sz=128',
    category: 'Climate',
    status: GivebackCauseStatus.Active,
    sortOrder: 16,
    recommended: false,
  },
  {
    id: 'cause-restart-project',
    name: 'The Restart Project',
    description:
      'Helps people repair electronics, build skills, and push right-to-repair policy.',
    url: 'https://therestartproject.org',
    logoUrl:
      'https://www.google.com/s2/favicons?domain=therestartproject.org&sz=128',
    category: 'Right to repair',
    status: GivebackCauseStatus.Active,
    sortOrder: 17,
    recommended: false,
  },
];

const communityAvatars = [
  'https://media.daily.dev/image/upload/s---xy_OAwk--/f_auto,q_auto/v1703781380/avatars/avatar_28849d86070e4c099c877ab6837c61f0',
  'https://media.daily.dev/image/upload/v1682322243/avatars/avatar_1d339aa5b85c4e0ba85fdedb523c48d4.jpg',
  'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-',
  'https://media.daily.dev/image/upload/v1679300599/avatars/avatar_LJSkpBexOSCWc8INyu3Eu.jpg',
  'https://media.daily.dev/image/upload/s--W1oZyHsz--/f_auto/v1719829173/avatars/avatar_0pjeBcFKQqsnU97ZOj9EW',
  'https://media.daily.dev/image/upload/s--C7nUVtfM--/f_auto,q_auto/v1/avatars/avatar_14yFjmSDxLUrr05G27mp6',
];

export const givebackCommunityEvents: GivebackCommunityEvent[] = [
  {
    id: 'event-1',
    actorLabel: 'A community member',
    actorName: 'Ana P.',
    actorAvatar: communityAvatars[4],
    actionLabel: 'shared the Giveback launch post',
    amount: 10,
    currency: GIVEBACK_CURRENCY,
    causeName: 'freeCodeCamp',
    createdAt: '2026-06-01T10:30:00.000Z',
    isAnonymous: true,
  },
  {
    id: 'event-2',
    actorLabel: 'A creator',
    actorName: 'Marco R.',
    actorAvatar: communityAvatars[2],
    actionLabel: 'submitted a daily.dev workflow video',
    amount: 50,
    currency: GIVEBACK_CURRENCY,
    causeName: 'CodePath',
    createdAt: '2026-06-01T11:15:00.000Z',
    isAnonymous: true,
  },
  {
    id: 'event-3',
    actorLabel: 'A power user',
    actorName: 'Lena S.',
    actorAvatar: communityAvatars[1],
    actionLabel: 'invited a developer friend',
    amount: 15,
    currency: GIVEBACK_CURRENCY,
    causeName: 'Electronic Frontier Foundation',
    createdAt: '2026-06-01T12:20:00.000Z',
    isAnonymous: true,
  },
  {
    id: 'event-4',
    actorLabel: 'A Squad member',
    actorName: 'Diego S.',
    actorAvatar: communityAvatars[0],
    actionLabel: 'posted a developer tip',
    amount: 15,
    currency: GIVEBACK_CURRENCY,
    causeName: 'Internet Archive',
    createdAt: '2026-06-01T13:45:00.000Z',
    isAnonymous: true,
  },
  {
    id: 'event-5',
    actorLabel: 'Someone from the community',
    actorName: 'Priya N.',
    actorAvatar: communityAvatars[3],
    actionLabel: 'left optional app feedback for love',
    currency: GIVEBACK_CURRENCY,
    createdAt: '2026-06-01T15:00:00.000Z',
    isAnonymous: true,
  },
  {
    id: 'event-6',
    actorLabel: 'A team lead',
    actorName: 'Tomas N.',
    actorAvatar: communityAvatars[5],
    actionLabel: 'referred their dev team',
    amount: 40,
    currency: GIVEBACK_CURRENCY,
    causeName: 'freeCodeCamp',
    createdAt: '2026-06-01T15:30:00.000Z',
    isAnonymous: true,
  },
  {
    id: 'event-7',
    actorLabel: 'A blogger',
    actorName: 'Yuki T.',
    actorAvatar: communityAvatars[2],
    actionLabel: 'wrote a blog post about their daily.dev setup',
    amount: 30,
    currency: GIVEBACK_CURRENCY,
    causeName: 'CodePath',
    createdAt: '2026-06-01T16:10:00.000Z',
    isAnonymous: true,
  },
  {
    id: 'event-8',
    actorLabel: 'A mobile user',
    actorName: 'Sara K.',
    actorAvatar: communityAvatars[1],
    actionLabel: 'left an honest mobile app review',
    amount: 20,
    currency: GIVEBACK_CURRENCY,
    causeName: 'Electronic Frontier Foundation',
    createdAt: '2026-06-01T16:45:00.000Z',
    isAnonymous: true,
  },
];

const baseGivebackActions: GivebackAction[] = [
  {
    id: 'share-launch-post',
    title: 'Share the Giveback launch post',
    description:
      'Post the official Giveback announcement with your own note about why it matters.',
    category: GivebackActionCategory.SocialMedia,
    platform: GivebackActionPlatform.X,
    personaTags: [
      GivebackActionPersona.Creator,
      GivebackActionPersona.PowerUser,
      GivebackActionPersona.CommunityMember,
    ],
    donationAmount: 10,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Manual,
    requiresLink: true,
    requiresImage: false,
    requiresNote: true,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
    instructions: 'Share the campaign and submit the public post URL.',
  },
  {
    id: 'record-demo-video',
    title: 'Record a short daily.dev workflow video',
    description:
      'Show how daily.dev helps you discover, save, or discuss developer content.',
    category: GivebackActionCategory.CreatorContent,
    platform: GivebackActionPlatform.YouTube,
    personaTags: [
      GivebackActionPersona.Creator,
      GivebackActionPersona.PowerUser,
      GivebackActionPersona.SeniorDeveloper,
    ],
    donationAmount: 50,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Manual,
    requiresLink: true,
    requiresImage: false,
    requiresNote: true,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
    instructions: 'Submit a public link to the video after posting it.',
  },
  {
    id: 'invite-dev-friend',
    title: 'Invite a developer friend',
    description:
      'Bring another developer into the community through an official invite flow.',
    category: GivebackActionCategory.Referrals,
    platform: GivebackActionPlatform.DailyDev,
    personaTags: [
      GivebackActionPersona.CommunityMember,
      GivebackActionPersona.PowerUser,
      GivebackActionPersona.TeamLead,
    ],
    donationAmount: 15,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Automatic,
    requiresLink: false,
    requiresImage: false,
    requiresNote: false,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
    instructions:
      'Use your invite link. We validate accepted invites automatically.',
  },
  {
    id: 'refer-team',
    title: 'Refer a dev team',
    description:
      'Introduce daily.dev to a team that could benefit from shared discovery.',
    category: GivebackActionCategory.Referrals,
    platform: GivebackActionPlatform.LinkedIn,
    personaTags: [
      GivebackActionPersona.TeamLead,
      GivebackActionPersona.SeniorDeveloper,
      GivebackActionPersona.DailyPlusSubscriber,
    ],
    donationAmount: 40,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Hybrid,
    requiresLink: false,
    requiresImage: false,
    requiresNote: true,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
    instructions:
      'Tell us who you introduced and we will validate the referral.',
  },
  {
    id: 'submit-product-feedback',
    title: 'Send thoughtful product feedback',
    description:
      'Share one product insight that would help make daily.dev better for developers.',
    category: GivebackActionCategory.ProductFeedback,
    platform: GivebackActionPlatform.DailyDev,
    personaTags: [
      GivebackActionPersona.PowerUser,
      GivebackActionPersona.SeniorDeveloper,
      GivebackActionPersona.Student,
    ],
    donationAmount: 10,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Manual,
    requiresLink: false,
    requiresImage: false,
    requiresNote: true,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
  },
  {
    id: 'join-user-interview',
    title: 'Join a 20-minute user interview',
    description:
      'Talk to the team about your daily.dev habits, blockers, and wishlist.',
    category: GivebackActionCategory.ProductFeedback,
    platform: GivebackActionPlatform.DailyDev,
    personaTags: [
      GivebackActionPersona.PowerUser,
      GivebackActionPersona.SeniorDeveloper,
      GivebackActionPersona.TeamLead,
    ],
    donationAmount: 25,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Manual,
    requiresLink: false,
    requiresImage: false,
    requiresNote: false,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
  },
  {
    id: 'post-community-tip',
    title: 'Post a developer tip in your community',
    description:
      'Share a practical daily.dev tip in a developer group, forum, or community space.',
    category: GivebackActionCategory.CommunityPosts,
    platform: GivebackActionPlatform.Reddit,
    personaTags: [
      GivebackActionPersona.CommunityMember,
      GivebackActionPersona.OpenSourceContributor,
      GivebackActionPersona.Student,
    ],
    donationAmount: 15,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Manual,
    requiresLink: true,
    requiresImage: false,
    requiresNote: true,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
  },
  {
    id: 'write-blog-post',
    title: 'Write a blog post about your daily.dev setup',
    description:
      'Explain how you use daily.dev to stay current, organize reading, or follow topics.',
    category: GivebackActionCategory.CreatorContent,
    platform: GivebackActionPlatform.Hashnode,
    personaTags: [
      GivebackActionPersona.Creator,
      GivebackActionPersona.SeniorDeveloper,
      GivebackActionPersona.OpenSourceContributor,
    ],
    donationAmount: 50,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Manual,
    requiresLink: true,
    requiresImage: false,
    requiresNote: false,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
  },
  {
    id: 'create-open-source-note',
    title: 'Mention daily.dev in an open-source resource list',
    description:
      'Add a relevant daily.dev recommendation to a public learning or tooling resource.',
    category: GivebackActionCategory.CommunityPosts,
    platform: GivebackActionPlatform.GitHub,
    personaTags: [
      GivebackActionPersona.OpenSourceContributor,
      GivebackActionPersona.Creator,
      GivebackActionPersona.Student,
    ],
    donationAmount: 25,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Manual,
    requiresLink: true,
    requiresImage: false,
    requiresNote: true,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
  },
  {
    id: 'share-squad-story',
    title: 'Share a Squad success story',
    description:
      'Tell the community how a Squad helped you learn, collaborate, or discover content.',
    category: GivebackActionCategory.SocialMedia,
    platform: GivebackActionPlatform.X,
    personaTags: [
      GivebackActionPersona.CommunityMember,
      GivebackActionPersona.TeamLead,
      GivebackActionPersona.PowerUser,
    ],
    donationAmount: 20,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Manual,
    requiresLink: true,
    requiresImage: true,
    requiresNote: true,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
  },
  {
    id: 'complete-onboarding-quiz',
    title: 'Complete the Giveback onboarding quiz',
    description:
      'Help us understand which actions and causes feel most relevant to you.',
    category: GivebackActionCategory.ProductFeedback,
    platform: GivebackActionPlatform.DailyDev,
    personaTags: [
      GivebackActionPersona.Student,
      GivebackActionPersona.CommunityMember,
      GivebackActionPersona.DailyPlusSubscriber,
    ],
    donationAmount: 5,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Automatic,
    requiresLink: false,
    requiresImage: false,
    requiresNote: false,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
  },
  {
    id: 'honest-app-store-review',
    title: 'Leave an honest mobile app review',
    description:
      'If daily.dev has helped you, consider sharing an honest review. No rewards attached.',
    category: GivebackActionCategory.CommunityLove,
    platform: GivebackActionPlatform.AppStore,
    personaTags: [
      GivebackActionPersona.CommunityMember,
      GivebackActionPersona.PowerUser,
      GivebackActionPersona.DailyPlusSubscriber,
    ],
    donationAmount: 0,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.None,
    requiresLink: false,
    requiresImage: false,
    requiresNote: false,
    isRewarded: false,
    donationEligible: false,
    isComplianceSensitive: true,
    isLoveAction: true,
    instructions:
      'Reviews are voluntary and never unlock donation value, rewards, or product access.',
  },
  {
    id: 'chrome-store-love',
    title: 'Share honest Chrome Web Store feedback',
    description:
      'Optional feedback for people who already use the extension. No incentives or donation value.',
    category: GivebackActionCategory.CommunityLove,
    platform: GivebackActionPlatform.ChromeWebStore,
    personaTags: [
      GivebackActionPersona.PowerUser,
      GivebackActionPersona.CommunityMember,
      GivebackActionPersona.SeniorDeveloper,
    ],
    donationAmount: 0,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.None,
    requiresLink: false,
    requiresImage: false,
    requiresNote: false,
    isRewarded: false,
    donationEligible: false,
    isComplianceSensitive: true,
    isLoveAction: true,
  },
  {
    id: 'mentor-student',
    title: 'Help a student set up daily.dev',
    description:
      'Walk a student or junior developer through topic follows, bookmarks, and Squads.',
    category: GivebackActionCategory.CommunityPosts,
    platform: GivebackActionPlatform.DailyDev,
    personaTags: [
      GivebackActionPersona.Student,
      GivebackActionPersona.SeniorDeveloper,
      GivebackActionPersona.CommunityMember,
    ],
    donationAmount: 20,
    currency: GIVEBACK_CURRENCY,
    validationType: GivebackActionValidationType.Manual,
    requiresLink: false,
    requiresImage: false,
    requiresNote: true,
    isRewarded: true,
    donationEligible: true,
    isComplianceSensitive: false,
    isLoveAction: false,
  },
];

// --- Community-led growth action library -----------------------------------
// The full action library from the community-led growth doc, mapped onto the
// action model. Program modes translate directly to compliance flags:
//   review → rewardable with manual review (durable, human-written public content)
//   proof  → rewardable with URL/API proof (low-risk public social actions)
//   love   → voluntary, zero reward (sensitive trust surfaces + earned outcomes)
type DocActionMode = 'review' | 'proof' | 'love';

interface DocActionSpec {
  id: string;
  title: string;
  platform: GivebackActionPlatform;
  category: GivebackActionCategory;
  personas: GivebackActionPersona[];
  mode: DocActionMode;
  /** Override the default payout for the mode (e.g. high-effort content). */
  amount?: number;
}

const docActionDefaultAmount: Record<DocActionMode, number> = {
  review: 30,
  proof: 10,
  love: 0,
};

const docActionValidationType: Record<
  DocActionMode,
  GivebackActionValidationType
> = {
  review: GivebackActionValidationType.Manual,
  proof: GivebackActionValidationType.Automatic,
  love: GivebackActionValidationType.None,
};

const createDocAction = ({
  id,
  title,
  platform,
  category,
  personas,
  mode,
  amount,
}: DocActionSpec): GivebackAction => {
  const isLove = mode === 'love';

  return {
    id,
    title,
    category,
    platform,
    personaTags: personas,
    donationAmount: isLove ? 0 : amount ?? docActionDefaultAmount[mode],
    currency: GIVEBACK_CURRENCY,
    validationType: docActionValidationType[mode],
    requiresLink: !isLove,
    requiresImage: false,
    requiresNote: false,
    isRewarded: !isLove,
    donationEligible: !isLove,
    isComplianceSensitive: isLove,
    isLoveAction: isLove,
  };
};

const P = GivebackActionPersona;
const C = GivebackActionCategory;
const PL = GivebackActionPlatform;

const docActionSpecs: DocActionSpec[] = [
  // Reviews, ratings, and discovery listings
  {
    id: 'refresh-chrome-review',
    title: 'Refresh an old Chrome Web Store review after a major update',
    platform: PL.ChromeWebStore,
    category: C.CommunityLove,
    personas: [P.PowerUser, P.CommunityMember],
    mode: 'love',
  },
  {
    id: 'edge-addons-review',
    title: 'Leave an honest Microsoft Edge Add-ons review',
    platform: PL.EdgeAddons,
    category: C.CommunityLove,
    personas: [P.PowerUser, P.CommunityMember],
    mode: 'love',
  },
  {
    id: 'firefox-addons-review',
    title: 'Leave an honest Firefox Add-ons review',
    platform: PL.FirefoxAddons,
    category: C.CommunityLove,
    personas: [P.PowerUser, P.CommunityMember],
    mode: 'love',
  },
  {
    id: 'google-play-review',
    title: 'Leave an honest Google Play review',
    platform: PL.GooglePlay,
    category: C.CommunityLove,
    personas: [P.CommunityMember, P.PowerUser],
    mode: 'love',
  },
  {
    id: 'trustpilot-review',
    title: 'Leave an honest Trustpilot review',
    platform: PL.Trustpilot,
    category: C.CommunityLove,
    personas: [P.DailyPlusSubscriber, P.PowerUser],
    mode: 'love',
  },
  {
    id: 'g2-review',
    title: 'Write a professional G2 review about team or workplace use',
    platform: PL.G2,
    category: C.CommunityLove,
    personas: [P.TeamLead, P.SeniorDeveloper],
    mode: 'love',
  },
  {
    id: 'capterra-review',
    title: 'Write a Capterra review with concrete workflow examples',
    platform: PL.Capterra,
    category: C.CommunityLove,
    personas: [P.TeamLead, P.SeniorDeveloper],
    mode: 'love',
  },
  {
    id: 'product-hunt-review',
    title: 'Write a Product Hunt product-page review after meaningful use',
    platform: PL.ProductHunt,
    category: C.CommunityLove,
    personas: [P.Creator, P.PowerUser],
    mode: 'love',
  },
  {
    id: 'product-hunt-follow',
    title: 'Follow daily.dev on Product Hunt after a launch or update',
    platform: PL.ProductHunt,
    category: C.CommunityLove,
    personas: [P.Creator, P.PowerUser],
    mode: 'love',
  },
  {
    id: 'product-hunt-upvote',
    title: 'Upvote daily.dev on Product Hunt when genuinely relevant',
    platform: PL.ProductHunt,
    category: C.CommunityLove,
    personas: [P.Creator, P.PowerUser],
    mode: 'love',
  },
  {
    id: 'alternativeto-rating',
    title: 'Add a rating or feedback note on AlternativeTo',
    platform: PL.Directory,
    category: C.ProductFeedback,
    personas: [P.PowerUser, P.CommunityMember],
    mode: 'review',
    amount: 20,
  },
  {
    id: 'alternativeto-suggest',
    title:
      'Suggest daily.dev as an alternative to relevant products on AlternativeTo',
    platform: PL.Directory,
    category: C.ProductFeedback,
    personas: [P.PowerUser],
    mode: 'review',
    amount: 20,
  },
  {
    id: 'stackshare-add',
    title: 'Add daily.dev to a StackShare stack or “tools we use” profile',
    platform: PL.Directory,
    category: C.ProductFeedback,
    personas: [P.SeniorDeveloper, P.PowerUser],
    mode: 'review',
    amount: 20,
  },
  {
    id: 'software-directory-add',
    title:
      'Add daily.dev to a reputable software discovery listing or tool directory',
    platform: PL.Directory,
    category: C.ProductFeedback,
    personas: [P.PowerUser],
    mode: 'review',
    amount: 20,
  },
  {
    id: 'extension-collection-add',
    title:
      'Add daily.dev to a curated browser-extension collection or recommendation board',
    platform: PL.Directory,
    category: C.ProductFeedback,
    personas: [P.PowerUser, P.Creator],
    mode: 'review',
    amount: 20,
  },
  {
    id: 'site-testimonial',
    title: 'Submit a short testimonial for the daily.dev case-study wall',
    platform: PL.DailyDev,
    category: C.ProductFeedback,
    personas: [P.CommunityMember, P.PowerUser],
    mode: 'review',
    amount: 20,
  },
  {
    id: 'persona-testimonial',
    title:
      'Submit a persona-specific testimonial (student, maintainer, or staff engineer)',
    platform: PL.DailyDev,
    category: C.ProductFeedback,
    personas: [P.Student, P.OpenSourceContributor, P.SeniorDeveloper],
    mode: 'review',
    amount: 20,
  },
  {
    id: 'nominate-best-tools',
    title: 'Nominate daily.dev in a “best developer tools” voting list',
    platform: PL.Directory,
    category: C.CommunityLove,
    personas: [P.PowerUser],
    mode: 'love',
  },

  // Searchable editorial content and reference surfaces
  {
    id: 'medium-workflow-post',
    title: 'Publish a Medium post on how you use daily.dev in your workflow',
    platform: PL.Medium,
    category: C.CreatorContent,
    personas: [P.Creator, P.PowerUser],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'dev-setup-post',
    title: 'Publish a DEV post with screenshots and a real setup walkthrough',
    platform: PL.Dev,
    category: C.CreatorContent,
    personas: [P.Creator, P.SeniorDeveloper],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'hashnode-workflow-article',
    title: 'Publish a Hashnode article about a daily.dev workflow',
    platform: PL.Hashnode,
    category: C.CreatorContent,
    personas: [P.Creator, P.SeniorDeveloper],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'personal-blog-review',
    title: 'Write a personal-blog review of daily.dev',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Creator, P.PowerUser],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'newsletter-mention',
    title:
      'Mention daily.dev in a Substack or email newsletter you already run',
    platform: PL.Newsletter,
    category: C.CreatorContent,
    personas: [P.Creator, P.CommunityMember],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'guest-post',
    title: 'Publish a guest post on a bootcamp, university, or community blog',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Student, P.SeniorDeveloper],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'best-extensions-article',
    title:
      'Write “Best Chrome extensions for developers” and include daily.dev',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'stay-current-article',
    title:
      'Write “Best ways to stay current in software engineering” and include daily.dev',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.SeniorDeveloper, P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'best-ai-news-article',
    title: 'Write “Best AI engineering news sources” and include daily.dev',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'best-devops-news-article',
    title:
      'Write “Best DevOps/security/cloud news sources” and include daily.dev',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'browser-setup-article',
    title: 'Write “My coding browser setup” and show daily.dev in the stack',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Creator, P.PowerUser],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'new-tab-article',
    title: 'Write “My new-tab page for developers” with a before/after setup',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.PowerUser],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'frontend-setup-guide',
    title: 'Publish a frontend-specific setup guide using daily.dev',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'ai-ml-setup-guide',
    title: 'Publish an AI/ML-specific setup guide using daily.dev',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'devops-setup-guide',
    title: 'Publish a DevOps/security-specific setup guide using daily.dev',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'interview-prep-article',
    title: 'Publish “How daily.dev helps me prepare for interviews”',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Student, P.SeniorDeveloper],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'cs-student-article',
    title: 'Publish “How daily.dev helps me as a CS student”',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Student],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'team-uses-article',
    title: 'Publish “How our engineering team uses daily.dev”',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.TeamLead],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'comparison-article',
    title: 'Publish an objective comparison between daily.dev and alternatives',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Creator, P.SeniorDeveloper],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'reading-roundup',
    title:
      'Publish a weekly “what I read this week” roundup sourced through daily.dev',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'github-profile-readme',
    title: 'Add daily.dev to your GitHub profile README “tools I use” section',
    platform: PL.GitHub,
    category: C.CommunityPosts,
    personas: [P.OpenSourceContributor, P.PowerUser],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'repo-readme-resources',
    title:
      'Add daily.dev to a repository README “resources” or “tooling” section',
    platform: PL.GitHub,
    category: C.CommunityPosts,
    personas: [P.OpenSourceContributor],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'github-awesome-list',
    title: 'Add daily.dev to a relevant GitHub awesome list',
    platform: PL.GitHub,
    category: C.CommunityPosts,
    personas: [P.OpenSourceContributor],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'notion-resource-hub',
    title:
      'Add daily.dev to a public Notion hub, wiki, or developer resource page',
    platform: PL.Notion,
    category: C.CommunityPosts,
    personas: [P.Creator, P.SeniorDeveloper],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'uses-page-add',
    title:
      'Add daily.dev to your “uses” page, portfolio, or creator toolkit page',
    platform: PL.Website,
    category: C.CommunityPosts,
    personas: [P.Creator, P.SeniorDeveloper],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'starter-pack-template',
    title: 'Publish a public starter-pack template that includes daily.dev',
    platform: PL.Notion,
    category: C.CommunityPosts,
    personas: [P.PowerUser, P.Creator],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'suggest-to-curator',
    title:
      'Suggest daily.dev to a blogger or newsletter curator covering dev tools',
    platform: PL.Newsletter,
    category: C.CommunityPosts,
    personas: [P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'earn-independent-coverage',
    title: 'Earn independent coverage that could support reference notability',
    platform: PL.Blog,
    category: C.CreatorContent,
    personas: [P.Creator, P.SeniorDeveloper],
    mode: 'love',
  },
  {
    id: 'wikipedia-talk-request',
    title:
      'Make a neutral, disclosed Wikipedia Talk-page request for factual corrections',
    platform: PL.Wiki,
    category: C.CommunityLove,
    personas: [P.SeniorDeveloper],
    mode: 'love',
  },
  {
    id: 'wikidata-hygiene',
    title: 'Help with community-maintained Wikidata hygiene where notable',
    platform: PL.Wiki,
    category: C.CommunityLove,
    personas: [P.OpenSourceContributor],
    mode: 'love',
  },

  // Community discussions and recommendation threads
  {
    id: 'reddit-stay-updated',
    title: 'Answer a Reddit thread asking how developers stay up to date',
    platform: PL.Reddit,
    category: C.CommunityPosts,
    personas: [P.CommunityMember, P.PowerUser],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'reddit-setup-showcase',
    title: 'Post a Reddit setup showcase showing how you configured daily.dev',
    platform: PL.Reddit,
    category: C.CommunityPosts,
    personas: [P.PowerUser],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'reddit-extensions',
    title: 'Reply in Reddit threads about favorite developer extensions',
    platform: PL.Reddit,
    category: C.CommunityPosts,
    personas: [P.PowerUser],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'reddit-newtab',
    title:
      'Reply in Reddit threads about better new-tab pages or homepage tools',
    platform: PL.Reddit,
    category: C.CommunityPosts,
    personas: [P.PowerUser],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'reddit-doomscroll',
    title:
      'Reply in Reddit threads about avoiding doomscrolling while staying informed',
    platform: PL.Reddit,
    category: C.CommunityPosts,
    personas: [P.CommunityMember, P.Student],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'reddit-student',
    title:
      'Reply in Reddit learning threads with a student-specific daily.dev use case',
    platform: PL.Reddit,
    category: C.CommunityPosts,
    personas: [P.Student],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'reddit-niche-news',
    title: 'Reply in Reddit threads about AI-news or web-dev-news tooling',
    platform: PL.Reddit,
    category: C.CommunityPosts,
    personas: [P.PowerUser],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'hn-overload-comment',
    title:
      'Comment on Hacker News threads about information overload or feed curation',
    platform: PL.HackerNews,
    category: C.CommunityPosts,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'hn-workflow-comment',
    title:
      'Comment on Hacker News threads comparing reader workflows or dev homepages',
    platform: PL.HackerNews,
    category: C.CommunityPosts,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'show-hn',
    title: 'Submit a Show HN around a genuinely new workflow or integration',
    platform: PL.HackerNews,
    category: C.CommunityPosts,
    personas: [P.Creator, P.PowerUser],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'ask-hn',
    title:
      'Start an Ask HN conversation about staying current, using your own workflow',
    platform: PL.HackerNews,
    category: C.CommunityPosts,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'stackoverflow-answer',
    title:
      'Write a Stack Overflow answer where daily.dev is directly relevant (disclose affiliation)',
    platform: PL.StackOverflow,
    category: C.CommunityPosts,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'stackoverflow-resource',
    title:
      'Contribute to Stack Overflow resource discussions with original, human-written content',
    platform: PL.StackOverflow,
    category: C.CommunityPosts,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'dev-comment',
    title:
      'Leave useful comments on DEV posts where daily.dev solves the problem',
    platform: PL.Dev,
    category: C.CommunityPosts,
    personas: [P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'hashnode-comment',
    title:
      'Leave useful comments on Hashnode posts where daily.dev fits the workflow',
    platform: PL.Hashnode,
    category: C.CommunityPosts,
    personas: [P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'github-discussions-mention',
    title:
      'Mention daily.dev in GitHub Discussions threads about tooling or resources',
    platform: PL.GitHub,
    category: C.CommunityPosts,
    personas: [P.OpenSourceContributor],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'oss-thread-mention',
    title:
      'Mention daily.dev in OSS community threads about keeping contributors informed',
    platform: PL.GitHub,
    category: C.CommunityPosts,
    personas: [P.OpenSourceContributor],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'discord-recommend',
    title:
      'Recommend daily.dev in Discord servers’ tools or resources channels',
    platform: PL.Discord,
    category: C.CommunityPosts,
    personas: [P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'slack-recommend',
    title:
      'Recommend daily.dev in Slack communities’ tools or resources channels',
    platform: PL.Slack,
    category: C.CommunityPosts,
    personas: [P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'internal-wiki-add',
    title:
      'Add daily.dev to a public internal engineering wiki or onboarding page',
    platform: PL.Notion,
    category: C.CommunityPosts,
    personas: [P.TeamLead, P.SeniorDeveloper],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'campus-share',
    title:
      'Share daily.dev in a university CS club forum, Discord, or Telegram group',
    platform: PL.Telegram,
    category: C.CommunityPosts,
    personas: [P.Student],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'indie-hackers-post',
    title: 'Post a workflow story on Indie Hackers or a maker forum',
    platform: PL.IndieHackers,
    category: C.CommunityPosts,
    personas: [P.Creator, P.PowerUser],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'product-hunt-comment',
    title:
      'Leave a genuine Product Hunt launch-day comment about how you use daily.dev',
    platform: PL.ProductHunt,
    category: C.CommunityLove,
    personas: [P.Creator, P.PowerUser],
    mode: 'love',
  },
  {
    id: 'x-reply-tools',
    title:
      'Reply to X posts asking for favorite developer tools or news workflows',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.PowerUser, P.Creator],
    mode: 'proof',
  },
  {
    id: 'linkedin-reply-tools',
    title:
      'Reply to LinkedIn posts asking for favorite developer tools or learning systems',
    platform: PL.LinkedIn,
    category: C.SocialMedia,
    personas: [P.SeniorDeveloper, P.TeamLead],
    mode: 'proof',
  },
  {
    id: 'newsletter-reply',
    title:
      'Add daily.dev to newsletter community replies or reader recommendation sections',
    platform: PL.Newsletter,
    category: C.CommunityPosts,
    personas: [P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'podcast-suggest',
    title:
      'Suggest daily.dev to podcast hosts or community call-for-tools threads',
    platform: PL.Podcast,
    category: C.CommunityPosts,
    personas: [P.Creator, P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'discourse-answer',
    title:
      'Answer relevant questions in Discourse communities or other forum platforms',
    platform: PL.Forum,
    category: C.CommunityPosts,
    personas: [P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'regional-forum-post',
    title:
      'Post in regional-language forums or communities with a localized use case',
    platform: PL.Forum,
    category: C.CommunityPosts,
    personas: [P.Creator, P.CommunityMember],
    mode: 'review',
    amount: 25,
  },

  // Creator media and educational content
  {
    id: 'youtube-review',
    title: 'Publish a full YouTube review of daily.dev',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-setup-tutorial',
    title:
      'Publish a YouTube setup tutorial showing exactly how to configure a feed',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator, P.PowerUser],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-extensions-roundup',
    title: 'Include daily.dev in a “top developer extensions” roundup video',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-browser-setup',
    title: 'Include daily.dev in a “my coding browser setup” video',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-frontend-tutorial',
    title: 'Create a niche tutorial “daily.dev for frontend developers”',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-ai-tutorial',
    title: 'Create a niche tutorial “daily.dev for AI engineers”',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-devops-tutorial',
    title: 'Create a niche tutorial “daily.dev for DevOps or security teams”',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-comparison',
    title: 'Publish a comparison video versus alternatives',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-interview-prep',
    title: 'Publish an interview-prep workflow video using daily.dev',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.SeniorDeveloper, P.Student],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-student-productivity',
    title: 'Publish a student productivity video featuring daily.dev',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Student, P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'youtube-oss-workflow',
    title:
      'Publish an open-source maintainer workflow video featuring daily.dev',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.OpenSourceContributor],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'shortform-before-after',
    title: 'Publish a short-form before/after feed-customization clip',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'proof',
    amount: 15,
  },
  {
    id: 'shortform-feeds-i-follow',
    title: 'Publish a short-form “3 feeds I follow on daily.dev” clip',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'proof',
    amount: 15,
  },
  {
    id: 'day-in-the-life-video',
    title: 'Include daily.dev in a day-in-the-life developer video',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'one-week-challenge-video',
    title: 'Publish a “one week with daily.dev” challenge video',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'live-coding-stream',
    title: 'Mention and demonstrate daily.dev during a live coding stream',
    platform: PL.Twitch,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'twitch-panel-add',
    title:
      'Add daily.dev to a Twitch panel, bot command, or stream resource page',
    platform: PL.Twitch,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'podcast-segment',
    title:
      'Record a podcast segment or mini-review discussing how you use daily.dev',
    platform: PL.Podcast,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'webinar-workshop',
    title:
      'Host a webinar or live workshop that includes daily.dev in a workflow',
    platform: PL.Event,
    category: C.CreatorContent,
    personas: [P.SeniorDeveloper, P.CommunityMember],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'meetup-lightning-talk',
    title: 'Give a meetup lightning talk mentioning daily.dev in your workflow',
    platform: PL.Event,
    category: C.CreatorContent,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'conference-slide',
    title: 'Include daily.dev on a conference slide or resource list',
    platform: PL.Event,
    category: C.CreatorContent,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'loom-walkthrough',
    title: 'Publish a Loom walkthrough on LinkedIn or X showing your workflow',
    platform: PL.LinkedIn,
    category: C.CreatorContent,
    personas: [P.SeniorDeveloper, P.Creator],
    mode: 'proof',
    amount: 15,
  },
  {
    id: 'monthly-tools-roundup-video',
    title: 'Mention daily.dev in a monthly tools roundup video',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'doomscroll-video',
    title:
      'Publish a “stay current without doomscrolling” video with daily.dev as one tactic',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator, P.SeniorDeveloper],
    mode: 'review',
    amount: 50,
  },
  {
    id: 'creator-toolkit-page',
    title: 'Add daily.dev to a public creator toolkit or resource page',
    platform: PL.Website,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'localized-tutorial',
    title: 'Publish a localized, non-English daily.dev tutorial',
    platform: PL.YouTube,
    category: C.CreatorContent,
    personas: [P.Creator],
    mode: 'review',
    amount: 50,
  },

  // Social amplification and ambassador loops
  {
    id: 'follow-x',
    title: 'Follow daily.dev’s X account',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.CommunityMember, P.PowerUser],
    mode: 'proof',
  },
  {
    id: 'follow-linkedin',
    title: 'Follow daily.dev’s LinkedIn page',
    platform: PL.LinkedIn,
    category: C.SocialMedia,
    personas: [P.SeniorDeveloper, P.TeamLead],
    mode: 'proof',
  },
  {
    id: 'subscribe-youtube',
    title: 'Subscribe to the official daily.dev YouTube channel',
    platform: PL.YouTube,
    category: C.SocialMedia,
    personas: [P.CommunityMember],
    mode: 'proof',
  },
  {
    id: 'engage-announcement',
    title: 'Like, save, or comment on a major daily.dev feature announcement',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.CommunityMember, P.PowerUser],
    mode: 'proof',
  },
  {
    id: 'repost-launch',
    title: 'Repost a daily.dev launch or update post with your own experience',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.PowerUser, P.Creator],
    mode: 'proof',
    amount: 15,
  },
  {
    id: 'quote-post-feed',
    title:
      'Quote-post a daily.dev feature announcement with a screenshot of your feed',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.PowerUser],
    mode: 'proof',
    amount: 15,
  },
  {
    id: 'screenshot-setup-x',
    title: 'Share a screenshot of your daily.dev setup on X',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.PowerUser],
    mode: 'proof',
    amount: 15,
  },
  {
    id: 'screenshot-setup-linkedin',
    title: 'Share a screenshot of your daily.dev setup on LinkedIn',
    platform: PL.LinkedIn,
    category: C.SocialMedia,
    personas: [P.SeniorDeveloper],
    mode: 'proof',
    amount: 15,
  },
  {
    id: 'linkedin-carousel',
    title: 'Publish a LinkedIn carousel titled “How I use daily.dev”',
    platform: PL.LinkedIn,
    category: C.SocialMedia,
    personas: [P.SeniorDeveloper, P.Creator],
    mode: 'proof',
    amount: 15,
  },
  {
    id: 'share-weekly-trend',
    title: 'Share a weekly top article or trend you found through daily.dev',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.CommunityMember, P.PowerUser],
    mode: 'proof',
  },
  {
    id: 'share-collection',
    title:
      'Share a favorite bookmark, collection, or list discovered through daily.dev',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.PowerUser],
    mode: 'proof',
  },
  {
    id: 'share-giveback-card',
    title: 'Share your Giveback milestone card with why you support daily.dev',
    platform: PL.DailyDev,
    category: C.SocialMedia,
    personas: [P.CommunityMember, P.PowerUser],
    mode: 'proof',
  },
  {
    id: 'tag-desk-setup',
    title: 'Tag daily.dev in a “my desk setup” or “my browser toolbar” post',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.Creator],
    mode: 'proof',
  },
  {
    id: 'team-onboarding-doc',
    title:
      'Add daily.dev to a team onboarding document or internal starter guide',
    platform: PL.Notion,
    category: C.Referrals,
    personas: [P.TeamLead],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'mentor-resource-pack',
    title: 'Add daily.dev to a mentor resource pack or intern starter kit',
    platform: PL.Website,
    category: C.Referrals,
    personas: [P.SeniorDeveloper],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'bootcamp-syllabus',
    title:
      'Add daily.dev to a bootcamp syllabus or community learning resource list',
    platform: PL.Website,
    category: C.Referrals,
    personas: [P.SeniorDeveloper, P.Student],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'campus-ambassador-demo',
    title: 'Run a campus ambassador demo or short onboarding session',
    platform: PL.Event,
    category: C.Referrals,
    personas: [P.Student, P.CommunityMember],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'feed-office-hours',
    title:
      'Run office hours or a “configure your daily.dev feed” session for a community',
    platform: PL.Event,
    category: C.Referrals,
    personas: [P.CommunityMember, P.SeniorDeveloper],
    mode: 'review',
    amount: 30,
  },
  {
    id: 'meme-post',
    title:
      'Create a meme or relatable post about developer-news overload and daily.dev',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.Creator],
    mode: 'proof',
  },
  {
    id: 'localized-cheat-sheet',
    title:
      'Create a localized cheat sheet, starter guide, or template around daily.dev',
    platform: PL.Blog,
    category: C.CommunityPosts,
    personas: [P.Creator],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'pitch-newsletter-curator',
    title:
      'Pitch daily.dev to newsletter curators or roundup authors who feature dev tools',
    platform: PL.Newsletter,
    category: C.CommunityPosts,
    personas: [P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'suggest-to-creators',
    title:
      'Suggest daily.dev to creators compiling “tools I use” videos or posts',
    platform: PL.YouTube,
    category: C.CommunityPosts,
    personas: [P.CommunityMember],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'public-bookmarks-collection',
    title:
      'Publish a public bookmarks or Raindrop-style collection that includes daily.dev',
    platform: PL.Directory,
    category: C.CommunityPosts,
    personas: [P.PowerUser],
    mode: 'review',
    amount: 25,
  },
  {
    id: 'thirty-day-challenge',
    title: 'Run a “30-day daily.dev challenge” and publish a recap thread',
    platform: PL.X,
    category: C.SocialMedia,
    personas: [P.PowerUser, P.Creator],
    mode: 'proof',
    amount: 15,
  },
  {
    id: 'invite-coworkers-feeds',
    title:
      'Invite coworkers or friends to configure feeds together and share the results',
    platform: PL.DailyDev,
    category: C.Referrals,
    personas: [P.CommunityMember, P.TeamLead],
    mode: 'review',
    amount: 25,
  },
];

const docGivebackActions: GivebackAction[] =
  docActionSpecs.map(createDocAction);

// All catalog actions: the hand-written core set plus the full growth library.
const allGivebackActions: GivebackAction[] = [
  ...baseGivebackActions,
  ...docGivebackActions,
];

// A small pool of real community avatars reused across action cards so the
// catalog reads as a living, crowded campaign. Swapped for per-action
// contributor avatars when the backend lands.
// Per-action community engagement, keyed by action id. Counts and momentum are
// what we put in front of the user; faces are rotated from the shared pool.
interface ActionEngagement {
  contributorsCount: number;
  contributorsLast24h: number;
  isTrending?: boolean;
}

const actionEngagement: Record<string, ActionEngagement> = {
  'share-launch-post': {
    contributorsCount: 1284,
    contributorsLast24h: 96,
    isTrending: true,
  },
  'record-demo-video': {
    contributorsCount: 142,
    contributorsLast24h: 7,
  },
  'invite-dev-friend': {
    contributorsCount: 2310,
    contributorsLast24h: 184,
    isTrending: true,
  },
  'refer-team': {
    contributorsCount: 318,
    contributorsLast24h: 21,
  },
  'submit-product-feedback': {
    contributorsCount: 876,
    contributorsLast24h: 54,
  },
  'join-user-interview': {
    contributorsCount: 64,
    contributorsLast24h: 5,
  },
  'post-community-tip': {
    contributorsCount: 941,
    contributorsLast24h: 73,
    isTrending: true,
  },
  'write-blog-post': {
    contributorsCount: 203,
    contributorsLast24h: 12,
  },
  'create-open-source-note': {
    contributorsCount: 156,
    contributorsLast24h: 9,
  },
  'share-squad-story': {
    contributorsCount: 512,
    contributorsLast24h: 38,
  },
  'complete-onboarding-quiz': {
    contributorsCount: 3640,
    contributorsLast24h: 271,
    isTrending: true,
  },
  'honest-app-store-review': {
    contributorsCount: 1102,
    contributorsLast24h: 61,
  },
  'chrome-store-love': {
    contributorsCount: 988,
    contributorsLast24h: 47,
  },
  'mentor-student': {
    contributorsCount: 89,
    contributorsLast24h: 4,
  },
};

// Deterministic, varied social proof for actions without hand-tuned numbers, so
// the (much larger) catalog still reads as a crowded, living campaign. Love
// actions stay calmer and never get the "Popular" badge.
const deriveEngagement = (
  action: GivebackAction,
  index: number,
): ActionEngagement => {
  const contributorsCount = ((index * 137 + 53) % 1180) + 28;
  const contributorsLast24h = ((index * 17 + 3) % 70) + 1;
  return {
    contributorsCount,
    contributorsLast24h,
    isTrending: !action.isLoveAction && index % 11 === 0,
  };
};

export const givebackActions: GivebackAction[] = allGivebackActions.map(
  (action, index) => {
    const engagement =
      actionEngagement[action.id] ?? deriveEngagement(action, index);

    const start = (index * 2) % communityAvatars.length;
    const contributorAvatars = Array.from(
      { length: 3 },
      (_, offset) =>
        communityAvatars[(start + offset) % communityAvatars.length],
    );

    return {
      ...action,
      contributorsCount: engagement.contributorsCount,
      contributorsLast24h: engagement.contributorsLast24h,
      isTrending: engagement.isTrending,
      contributorAvatars,
    };
  },
);

// The weekly contribution leaderboard. This is the gamified heart of the
// campaign: ranks, streaks, rank movement and titles turn contributing into a
// game and the viewer's own row ("You") gives a clear next rung to climb.
export const givebackLeaderboard: GivebackLeaderboardEntry[] = [
  {
    id: 'lb-ana',
    rank: 1,
    name: 'Ana Pereira',
    handle: '@anabuilds',
    avatar: communityAvatars[4],
    contributionAmount: 320,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 14,
    streakDays: 12,
    rankChange: 1,
    title: 'Team captain',
  },
  {
    id: 'lb-marco',
    rank: 2,
    name: 'Marco Reyes',
    handle: '@marcocodes',
    avatar: communityAvatars[2],
    contributionAmount: 245,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 11,
    streakDays: 9,
    rankChange: 2,
    title: 'Streak master',
  },
  {
    id: 'lb-lena',
    rank: 3,
    name: 'Lena Schmidt',
    handle: '@lenadev',
    avatar: communityAvatars[1],
    contributionAmount: 180,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 9,
    streakDays: 7,
    rankChange: -1,
    title: 'Rising star',
  },
  {
    id: 'lb-diego',
    rank: 4,
    name: 'Diego Santos',
    handle: '@diegobuilds',
    avatar: communityAvatars[0],
    contributionAmount: 150,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 8,
    streakDays: 5,
    rankChange: 3,
  },
  {
    id: 'lb-priya',
    rank: 5,
    name: 'Priya Nair',
    handle: '@priyacodes',
    avatar: communityAvatars[3],
    contributionAmount: 130,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 7,
    streakDays: 6,
    rankChange: 0,
  },
  {
    id: 'lb-tomas',
    rank: 6,
    name: 'Tomas Novak',
    handle: '@tomasdev',
    avatar: communityAvatars[5],
    contributionAmount: 125,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 6,
    streakDays: 4,
    rankChange: 1,
  },
  {
    id: 'lb-yuki',
    rank: 7,
    name: 'Yuki Tanaka',
    handle: '@yukibuilds',
    avatar: communityAvatars[2],
    contributionAmount: 115,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 5,
    streakDays: 8,
    rankChange: -2,
  },
  {
    id: 'lb-you',
    rank: 8,
    // Synced at runtime to the live earned total from your action records (see
    // GivebackContext), so the board and the "Your contribution" card never
    // disagree. This static value is just the matching default.
    name: 'You',
    handle: '@you',
    avatar: communityAvatars[0],
    contributionAmount: 110,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 5,
    streakDays: 3,
    rankChange: 4,
    isCurrentUser: true,
  },
  {
    id: 'lb-sara',
    rank: 9,
    name: 'Sara Cohen',
    handle: '@saradev',
    avatar: communityAvatars[1],
    contributionAmount: 80,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 4,
    streakDays: 2,
    rankChange: 0,
  },
  {
    id: 'lb-omar',
    rank: 10,
    name: 'Omar Farouk',
    handle: '@omarcodes',
    avatar: communityAvatars[3],
    contributionAmount: 70,
    currency: GIVEBACK_CURRENCY,
    actionsCount: 4,
    streakDays: 5,
    rankChange: -1,
  },
];

// Today's shared push: every action chips into one collective bar so the board
// reads as a team effort, not just rivalry.
export const givebackCommunityRally: GivebackCommunityRally = {
  unlockedToday: 3420,
  targetToday: 5000,
  currency: GIVEBACK_CURRENCY,
  contributorsToday: 271,
};

// The "Take action" spotlight reuses the same source of truth as the board, so
// the #1 contributor never disagrees with the top of the leaderboard.
export const givebackTopContributors: GivebackTopContributor[] =
  givebackLeaderboard
    .filter((entry) => !entry.isCurrentUser)
    .slice(0, 3)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      handle: entry.handle,
      avatar: entry.avatar,
      contributionAmount: entry.contributionAmount,
      currency: entry.currency,
      actionsCount: entry.actionsCount,
    }));

export const givebackUserActions: GivebackUserAction[] = [
  {
    actionId: 'share-launch-post',
    status: GivebackUserActionStatus.CountedTowardGoal,
    unlockedDonationAmount: 10,
    pendingDonationAmount: 0,
    approvedDonationAmount: 10,
    rejectedDonationAmount: 0,
    submittedAt: '2026-05-28T10:00:00.000Z',
    reviewedAt: '2026-05-28T13:00:00.000Z',
  },
  {
    actionId: 'record-demo-video',
    status: GivebackUserActionStatus.PendingReview,
    unlockedDonationAmount: 50,
    pendingDonationAmount: 50,
    approvedDonationAmount: 0,
    rejectedDonationAmount: 0,
    submittedAt: '2026-05-30T14:00:00.000Z',
  },
  {
    actionId: 'invite-dev-friend',
    status: GivebackUserActionStatus.Approved,
    unlockedDonationAmount: 15,
    pendingDonationAmount: 0,
    approvedDonationAmount: 15,
    rejectedDonationAmount: 0,
    submittedAt: '2026-05-29T09:00:00.000Z',
    reviewedAt: '2026-05-29T09:05:00.000Z',
  },
  {
    actionId: 'refer-team',
    status: GivebackUserActionStatus.Started,
    unlockedDonationAmount: 0,
    pendingDonationAmount: 0,
    approvedDonationAmount: 0,
    rejectedDonationAmount: 0,
  },
  {
    actionId: 'submit-product-feedback',
    status: GivebackUserActionStatus.NeedsMoreInfo,
    unlockedDonationAmount: 10,
    pendingDonationAmount: 0,
    approvedDonationAmount: 0,
    rejectedDonationAmount: 0,
    submittedAt: '2026-05-27T12:00:00.000Z',
    needsMoreInfoReason: 'Add one concrete example so we can validate it.',
  },
  {
    actionId: 'join-user-interview',
    status: GivebackUserActionStatus.Expired,
    unlockedDonationAmount: 0,
    pendingDonationAmount: 0,
    approvedDonationAmount: 0,
    rejectedDonationAmount: 0,
  },
  {
    actionId: 'post-community-tip',
    status: GivebackUserActionStatus.Rejected,
    unlockedDonationAmount: 15,
    pendingDonationAmount: 0,
    approvedDonationAmount: 0,
    rejectedDonationAmount: 15,
    submittedAt: '2026-05-26T16:00:00.000Z',
    reviewedAt: '2026-05-27T09:00:00.000Z',
    rejectionReason: 'The post was not publicly accessible.',
  },
  {
    actionId: 'share-squad-story',
    status: GivebackUserActionStatus.Submitted,
    unlockedDonationAmount: 20,
    pendingDonationAmount: 20,
    approvedDonationAmount: 0,
    rejectedDonationAmount: 0,
    submittedAt: '2026-06-01T08:30:00.000Z',
  },
  {
    actionId: 'complete-onboarding-quiz',
    status: GivebackUserActionStatus.AutoValidating,
    unlockedDonationAmount: 5,
    pendingDonationAmount: 5,
    approvedDonationAmount: 0,
    rejectedDonationAmount: 0,
    submittedAt: '2026-06-01T11:00:00.000Z',
  },
];

// A long, dynamic ladder (the journey UI only ever shows a window of it). Each
// blueprint becomes a level + reward; the welcome gift at level 1 is free just
// for showing up.
interface LevelBlueprint {
  name: string;
  required: number;
  reward: {
    type: GivebackRewardType;
    title: string;
    description?: string;
    isSecret?: boolean;
  };
}

const levelBlueprints: LevelBlueprint[] = [
  {
    name: 'First spark',
    required: 0,
    reward: {
      type: GivebackRewardType.Other,
      title: '$10 to your causes',
      description:
        'On us, just for joining and picking the causes you care about.',
    },
  },
  {
    name: 'Newcomer',
    required: 25,
    reward: {
      type: GivebackRewardType.Cores,
      title: '25 Cores',
      description: 'A small boost for your first action.',
    },
  },
  {
    name: 'Helping hand',
    required: 50,
    reward: {
      type: GivebackRewardType.Cores,
      title: '50 Cores',
      description: 'A head start for showing up early.',
    },
  },
  {
    name: 'Regular',
    required: 100,
    reward: {
      type: GivebackRewardType.DailyPlus,
      title: '1 month of daily.dev Plus',
      description: 'A thank-you for moving the community forward.',
    },
  },
  {
    name: 'Contributor',
    required: 150,
    reward: {
      type: GivebackRewardType.Badge,
      title: 'Contributor badge',
      description: 'A mark of someone who keeps showing up.',
    },
  },
  {
    name: 'Supporter',
    required: 225,
    reward: { type: GivebackRewardType.Cores, title: '150 Cores' },
  },
  {
    name: 'Changemaker',
    required: 300,
    reward: {
      type: GivebackRewardType.Badge,
      title: 'Changemaker flair',
      isSecret: true,
    },
  },
  {
    name: 'Advocate',
    required: 400,
    reward: { type: GivebackRewardType.Cores, title: '300 Cores' },
  },
  {
    name: 'Trailblazer',
    required: 525,
    reward: {
      type: GivebackRewardType.DailyPlus,
      title: '3 months of Plus',
      isSecret: true,
    },
  },
  {
    name: 'Community pillar',
    required: 675,
    reward: {
      type: GivebackRewardType.Badge,
      title: 'Community pillar frame',
      isSecret: true,
    },
  },
  {
    name: 'Catalyst',
    required: 850,
    reward: { type: GivebackRewardType.Cores, title: '600 Cores' },
  },
  {
    name: 'Champion',
    required: 1050,
    reward: { type: GivebackRewardType.SwagCoupon, title: 'Sticker pack' },
  },
  {
    name: 'Luminary',
    required: 1300,
    reward: {
      type: GivebackRewardType.Badge,
      title: 'Luminary badge',
      isSecret: true,
    },
  },
  {
    name: 'Patron',
    required: 1600,
    reward: {
      type: GivebackRewardType.DailyPlus,
      title: '6 months of Plus',
      isSecret: true,
    },
  },
  {
    name: 'Vanguard',
    required: 1950,
    reward: {
      type: GivebackRewardType.Cores,
      title: '1,200 Cores',
      isSecret: true,
    },
  },
  {
    name: 'Headliner',
    required: 2350,
    reward: { type: GivebackRewardType.SwagCoupon, title: 'T-shirt coupon' },
  },
  {
    name: 'Mentor',
    required: 2800,
    reward: {
      type: GivebackRewardType.Badge,
      title: 'Mentor badge',
      isSecret: true,
    },
  },
  {
    name: 'Icon',
    required: 3350,
    reward: {
      type: GivebackRewardType.Badge,
      title: 'Icon profile frame',
      isSecret: true,
    },
  },
  {
    name: 'Mythic',
    required: 4000,
    reward: {
      type: GivebackRewardType.Other,
      title: 'Mystery drop',
      isSecret: true,
    },
  },
  {
    name: 'Legend',
    required: 5000,
    reward: {
      type: GivebackRewardType.SwagCoupon,
      title: 'Legend swag bundle',
      description: 'For the ones who go all in.',
      isSecret: true,
    },
  },
];

export const givebackLevels: GivebackLevel[] = levelBlueprints.map(
  (blueprint, index) => ({
    id: `level-${index + 1}`,
    levelNumber: index + 1,
    name: blueprint.name,
    requiredApprovedAmount: blueprint.required,
    reward: {
      id: `reward-${index + 1}`,
      type: blueprint.reward.type,
      title: blueprint.reward.title,
      secretTitle: 'Mystery reward',
      description: blueprint.reward.description,
      status:
        blueprint.required === 0
          ? GivebackRewardStatus.Unlocked
          : GivebackRewardStatus.Locked,
      isSecret: blueprint.reward.isSecret ?? false,
    },
  }),
);

export const givebackSponsors: GivebackSponsor[] = [
  {
    id: 'sponsor-vercel',
    name: 'Vercel',
    type: GivebackSponsorType.Company,
    amount: 5000,
    currency: GIVEBACK_CURRENCY,
    url: 'https://vercel.com',
    logoUrl: 'https://svgl.app/library/vercel.svg',
    message: 'Backing the tools and people developers rely on.',
    isFounding: true,
    createdAt: '2026-05-20T09:00:00.000Z',
  },
  {
    id: 'sponsor-sentry',
    name: 'Sentry',
    type: GivebackSponsorType.Company,
    amount: 3000,
    currency: GIVEBACK_CURRENCY,
    url: 'https://sentry.io',
    logoUrl: 'https://svgl.app/library/sentry.svg',
    message: 'Open source moves the world. Happy to chip in.',
    isFounding: true,
    createdAt: '2026-05-21T11:30:00.000Z',
  },
  {
    id: 'sponsor-supabase',
    name: 'Supabase',
    type: GivebackSponsorType.Company,
    amount: 2000,
    currency: GIVEBACK_CURRENCY,
    url: 'https://supabase.com',
    logoUrl: 'https://svgl.app/library/supabase.svg',
    message: 'For the community that builds in public.',
    createdAt: '2026-05-23T14:10:00.000Z',
  },
  {
    id: 'sponsor-postman',
    name: 'Postman',
    type: GivebackSponsorType.Company,
    amount: 1500,
    currency: GIVEBACK_CURRENCY,
    url: 'https://postman.com',
    logoUrl: 'https://svgl.app/library/postman.svg',
    createdAt: '2026-05-24T08:45:00.000Z',
  },
  {
    id: 'sponsor-raycast',
    name: 'Raycast',
    type: GivebackSponsorType.Company,
    amount: 1000,
    currency: GIVEBACK_CURRENCY,
    url: 'https://raycast.com',
    logoUrl: 'https://svgl.app/library/raycast.svg',
    createdAt: '2026-05-25T16:20:00.000Z',
  },
  {
    id: 'sponsor-ido',
    name: 'Ido Shamun',
    type: GivebackSponsorType.Individual,
    amount: 500,
    currency: GIVEBACK_CURRENCY,
    message: 'Proud to kick this off with the community.',
    isFounding: true,
    createdAt: '2026-05-19T07:00:00.000Z',
  },
  {
    id: 'sponsor-acme-studio',
    name: 'Northwind Labs',
    type: GivebackSponsorType.Company,
    amount: 750,
    currency: GIVEBACK_CURRENCY,
    createdAt: '2026-05-27T10:05:00.000Z',
  },
  {
    id: 'sponsor-maya',
    name: 'Maya Rodriguez',
    type: GivebackSponsorType.Individual,
    amount: 250,
    currency: GIVEBACK_CURRENCY,
    message: 'Giving back to the tools that taught me to code.',
    createdAt: '2026-05-28T19:40:00.000Z',
  },
  {
    id: 'sponsor-jonas',
    name: 'Jonas Keller',
    type: GivebackSponsorType.Individual,
    amount: 100,
    currency: GIVEBACK_CURRENCY,
    createdAt: '2026-05-29T12:15:00.000Z',
  },
  {
    id: 'sponsor-priya',
    name: 'Priya Nair',
    type: GivebackSponsorType.Individual,
    amount: 50,
    currency: GIVEBACK_CURRENCY,
    message: 'Every bit counts.',
    createdAt: '2026-05-30T15:55:00.000Z',
  },
];

const givebackSponsoredTotal = givebackSponsors.reduce(
  (sum, sponsor) => sum + sponsor.amount,
  0,
);

export const createMockCampaign = (
  overrides: Partial<GivebackCampaign> = {},
): GivebackCampaign => ({
  id: 'campaign-2026',
  name: 'Giveback',
  slug: 'giveback',
  status: GivebackCampaignStatus.Active,
  goalAmount: 10000,
  currency: GIVEBACK_CURRENCY,
  approvedAmount: 5000,
  pendingAmount: 450,
  sponsoredAmount: givebackSponsoredTotal,
  backersCount: 12480,
  backersLast24h: 214,
  stretchGoals: [
    {
      id: 'stretch-2500',
      amount: 2500,
      title: 'First grants sent',
      description: 'Initial donations reach freeCodeCamp and the EFF.',
    },
    {
      id: 'stretch-5000',
      amount: 5000,
      title: 'Open-source fund',
      description: 'A maintainer fund for the tools developers rely on.',
    },
    {
      id: 'stretch-7500',
      amount: 7500,
      title: 'Scholarships unlocked',
      description: 'Coding scholarships for underrepresented developers.',
    },
    {
      id: 'stretch-10000',
      amount: 10000,
      title: 'Full goal funded',
      description: 'All four community causes fully funded.',
    },
    {
      id: 'stretch-15000',
      amount: 15000,
      title: 'Stretch: we double it',
      description: 'daily.dev matches the next $5k, dollar for dollar.',
    },
  ],
  sponsors: givebackSponsors,
  heroCopy: 'Daily Dev funds the donation. You help unlock it.',
  ...overrides,
});

export const createMockUserProfile = (
  overrides: Partial<GivebackUserProfile> = {},
): GivebackUserProfile => ({
  currentLevel: 3,
  approvedContributionAmount: 85,
  pendingContributionAmount: 25,
  actionsCompletedCount: 4,
  selectedCauseIds: ['cause-python-software-foundation'],
  ...overrides,
});
