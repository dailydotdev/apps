import React from 'react';
import {
  cloudinaryCharmEmptySquads,
  cloudinaryCharmReadLater,
  cloudinaryCharmNotEnoughTags,
} from '@dailydotdev/shared/src/lib/image';
import type { OgData } from './platformCards';
import { RecommendedOg } from './dailyOgImages';

export const DEFAULT_OG_IMAGE =
  'https://media.daily.dev/image/upload/s--VAY5ToZt--/f_auto/v1724209435/public/daily.dev%20-%20open%20graph';

// The CURRENT column uses the REAL images daily.dev serves today (raw, not
// re-created). Reality check (verified live 2026-06-17): only POSTS get a
// generated card; profile, source, tag, squad, invite, Plus and the app
// default all fall back to the SAME generic image. The marketing homepage
// serves its own og-image.png.
const LANDING_OG = 'https://daily.dev/og-image.png';

// A real, live daily.dev post (so the current post card is the genuine asset).
const POST_OG = 'https://og.daily.dev/api/posts/qojM1enSN';
// The shared variant adds the sharer (real endpoint, ?userid=).
const SHARED_OG = `${POST_OG}?userid=u_123`;
const POST_TITLE = 'How to use traces to avoid breaking changes';
const POST_SOURCE = 'Community Picks';
const POST_COVER =
  'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/2a3c2ca8481678b5c9178cd656700187';
// The post's real source logo (Community Picks) and the real commenter avatar.
const POST_SOURCE_LOGO =
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1655817725/logos/community';
const COMMENT_AVATAR =
  'https://media.daily.dev/image/upload/s--IbwvoTYq--/f_auto/v1772778404/avatars/avatar_giQfoBCN9hYxcvRVo3s95';

// Profile share = the real DevCard "wide" image (ProfileLayout sets og:image to
// /devcards/v2/{userId}.png?type=wide — a generated DevCard, NOT the generic).
const PROFILE_OG =
  'https://api.daily.dev/devcards/v2/28849d86070e4c099c877ab6837c61f0.png?type=wide';
// Real assets for the recommended profile: the user's avatar, their rank-based
// DevCard cover (the bg changes with reputation rank), and real source logos.
const PROFILE_AVATAR =
  'https://media.daily.dev/image/upload/s---xy_OAwk--/f_auto,q_auto/v1703781380/avatars/avatar_28849d86070e4c099c877ab6837c61f0';
const PROFILE_RANK_COVER =
  'https://media.daily.dev/image/upload/s--xDkKz00z--/f_auto/v1707920136/covers/cover_28849d86070e4c099c877ab6837c61f0';
// The user's real "reads the most" sources, straight from their DevCard.
const PROFILE_SOURCES = [
  'https://media.daily.dev/image/upload/s--fk_6ycEi--/f_auto,q_auto/v1780996001/logos/collections',
  'https://media.daily.dev/image/upload/s--stRJbTCn--/f_auto/v1752953684/squads/ad08ba59-6646-487f-a8bd-2147d9e572a6',
  'https://media.daily.dev/image/upload/s--V91DY4ls--/f_auto,q_auto/v1772617267/logos/agents_digest',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
];
// Real WebDev squad share image (its own image is what production serves).
const WEBDEV_OG =
  'https://media.daily.dev/image/upload/s--3B1fh4kU--/f_auto,q_auto/v1/squads/94fc7a56-e6d2-403f-acd6-b988b426574f';
// Real freeCodeCamp source logo.
const FREECODECAMP_LOGO =
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1628412854/logos/freecodecamp';

export interface UseCase {
  id: string;
  /** Human label for the share type. */
  name: string;
  /** What object is being shared and from where. */
  what: string;
  /** ReferralCampaignKey / route that produces it. */
  source: string;
  /** Problems with the current treatment. */
  issues: string[];
  /** What we should change. */
  recommendations: string[];
  current: OgData;
  recommended: OgData;
}

export const USE_CASES: UseCase[] = [
  {
    id: 'article',
    name: 'Article / Post',
    what: 'A developer shares an aggregated article from the feed or post page.',
    source: '/posts/[slug] · ReferralCampaignKey.SharePost',
    issues: [
      'og:title always gets a " | daily.dev" suffix appended, eating ~12 chars of the headline and pushing it over the 60-char sweet spot.',
      'og:description falls back to a truncated, often HTML-stripped excerpt with no consistent value framing.',
      'The generated image leads with the publisher’s cover; daily.dev branding is small and easy to miss.',
      'No og:image:alt / twitter:image:alt is set.',
    ],
    recommendations: [
      'Drop the title suffix for shareable content — site_name already conveys the brand. Reserve the suffix for navigational pages.',
      'Lead the image with the headline + author + reading time over a consistent branded frame; treat the cover as a supporting thumbnail.',
      'Always emit og:image:alt mirroring the post title.',
      'Add twitter:label/data (Author, Reading time) for richer Slack/X-adjacent unfurls.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/posts/how-to-use-traces-to-avoid-breaking-changes',
      title: 'How to use traces to avoid breaking changes | daily.dev',
      description:
        'How distributed traces help you catch breaking changes before they ship…',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: POST_OG,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/posts/how-to-use-traces-to-avoid-breaking-changes',
      title: 'How to use traces to avoid breaking changes',
      description:
        'How distributed traces help you catch breaking changes before they ship — a practical walkthrough.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'How to use traces to avoid breaking changes',
      imageNode: (
        <RecommendedOg
          kind="article"
          title={POST_TITLE}
          name={POST_SOURCE}
          avatarSrc={POST_SOURCE_LOGO}
          meta="7 min read"
          upvotes="21"
          comments="2"
          cover={POST_COVER}
        />
      ),
      squareNode: (
        <RecommendedOg
          square
          kind="article"
          name={POST_SOURCE}
          cover={POST_COVER}
        />
      ),
    },
  },
  {
    id: 'shared-post',
    name: 'Shared post (with attribution)',
    what: 'A user shares a post via their personal share link, attributing the share to them.',
    source:
      '/posts/[id]/share?userid=… · og.daily.dev/api/posts/{id}?userid={uid}',
    issues: [
      'Attribution ("X shared") is small and inconsistent vs. the standard post image.',
      'Same title-suffix and description issues as a normal post.',
      'The sharer’s avatar/identity is not reliably surfaced, weakening the social proof that drives the click.',
    ],
    recommendations: [
      'Make the sharer a first-class element: avatar + "shared by {name}" pill at the top of the image.',
      'Keep the rest of the article template identical so the share feels like a native daily.dev object.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/posts/.../share?userid=u_123',
      title: 'How to use traces to avoid breaking changes | daily.dev',
      description:
        'How distributed traces help you catch breaking changes before they ship…',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: SHARED_OG,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/posts/.../share?userid=u_123',
      title: 'How to use traces to avoid breaking changes',
      description:
        'Ido shared this on daily.dev — how traces catch breaking changes before they ship.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'Ido shared: How to use traces to avoid breaking changes',
      imageNode: (
        <RecommendedOg
          kind="shared"
          sharer="Ido Shamun"
          avatarSrc={PROFILE_AVATAR}
          title={POST_TITLE}
          name={POST_SOURCE}
          meta="7 min read"
          upvotes="21"
          comments="2"
          cover={POST_COVER}
        />
      ),
    },
  },
  {
    id: 'profile',
    name: 'Developer profile',
    what: 'Sharing a user profile / DevCard.',
    source:
      '/[username] · DevCard v2 wide image · ReferralCampaignKey.ShareProfile',
    issues: [
      'The profile shares the DevCard image (/devcards/v2/{id}.png?type=wide) — a different visual language from post shares, and not 1.91:1, so it gets letterboxed/cropped in unfurls.',
      'Bio (og:description) is often empty; falls back to the generic site description.',
      'Title carries the " | daily.dev" suffix.',
    ],
    recommendations: [
      'Use the same template family as posts, in "developer" mode: avatar, name, @handle, headline stat (streak, reputation).',
      'Default description to a generated one-liner ("{name} reads about React, Rust & AI on daily.dev") when bio is empty.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/idoshamun',
      title: 'Ido Shamun (@idoshamun) | daily.dev',
      description:
        'daily.dev is the easiest way to stay updated on the latest programming news…',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: PROFILE_OG,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/idoshamun',
      title: 'Ido Shamun (@idoshamun)',
      description:
        'Ido reads about AI, LLMs & web dev on daily.dev — 20.5k posts read, 1,087-day longest streak.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'Ido Shamun on daily.dev',
      imageNode: (
        <RecommendedOg
          kind="profile"
          title="Ido Shamun"
          subtitle="I’m to blame if something goes wrong here 🙈"
          name="Ido Shamun"
          handle="idoshamun"
          avatarSrc={PROFILE_AVATAR}
          cover={PROFILE_RANK_COVER}
          reputation="168k"
          streak="1,087"
          reads="20.5k"
          tags={['ai', 'llm', 'webdev']}
          sources={PROFILE_SOURCES}
        />
      ),
    },
  },
  {
    id: 'squad',
    name: 'Squad',
    what: 'Sharing a Squad’s public page.',
    source:
      '/squads/[handle] · getSquadOpenGraph() · ReferralCampaignKey.ShareSource',
    issues: [
      'Uses the squad’s own uploaded banner, whose dimensions/quality vary wildly and may not be 1.91:1.',
      'Falls back to the generic brand image when no banner is set — zero context.',
      'No member count / activity signal in the preview to drive joins.',
    ],
    recommendations: [
      'Render a generated, on-brand squad card: squad name + avatar + member count + "active today" signal, with the banner as a backdrop.',
      'Never fall back to the bare generic image — always generate a contextual squad card.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/squads/webdev',
      title: 'WebDev | daily.dev',
      description:
        'The official daily.dev web development community. Led by thought leaders and webdev experts. Join the Squad!',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: WEBDEV_OG,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/squads/webdev',
      title: 'WebDev — a Squad on daily.dev',
      description:
        'The official daily.dev web development community, led by thought leaders and webdev experts.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'WebDev squad on daily.dev',
      imageNode: (
        <RecommendedOg
          kind="squad"
          title="WebDev"
          subtitle="The official daily.dev web development community"
          members="26,606"
          posts="1,069"
          upvotes="12.9k"
          cover={WEBDEV_OG}
        />
      ),
    },
  },
  {
    id: 'squad-invite',
    name: 'Squad invite link',
    what: 'A member invites someone to a private/public Squad.',
    source: '/squads/[handle]/[token]',
    issues: [
      'Title is good ("{inviter} invited you to {squad}") but the image is just the squad banner — the invite framing lives only in text the platform may truncate.',
      'No inviter identity in the image; the personal, social hook is lost.',
    ],
    recommendations: [
      'Bake the invite framing into the image: inviter avatar + "invited you to join {squad}" + member count + CTA chip.',
      'Keep the strong title but ensure the image stands on its own when the title is clipped.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/squads/webdev/abc123token',
      title: 'Ido invited you to WebDev',
      description:
        'The official daily.dev web development community. Led by thought leaders and webdev experts. Join the Squad!',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: WEBDEV_OG,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/squads/webdev/abc123token',
      title: 'Ido invited you to join WebDev on daily.dev',
      description:
        'Join the official daily.dev web development community. It’s free.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'Ido invited you to join WebDev',
      imageNode: (
        <RecommendedOg
          kind="invite"
          sharer="Ido Shamun"
          avatarSrc={PROFILE_AVATAR}
          title="Join WebDev"
          count="26,606"
          countWord="developers"
          cta="Tap to join"
          cover={WEBDEV_OG}
        />
      ),
    },
  },
  {
    id: 'source',
    name: 'Source / Publication',
    what: 'Sharing a publication/source page.',
    source: '/sources/[source]',
    issues: [
      'Uses the bare generic brand image (defaultOpenGraph) — no indication of which source it is.',
      'Title + suffix only; description is the source description if present.',
    ],
    recommendations: [
      'Generate a source card with the source logo, name and "Followed by N developers on daily.dev".',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/sources/freecodecamp',
      title: 'freeCodeCamp | daily.dev',
      description: 'The latest from freeCodeCamp on daily.dev.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: DEFAULT_OG_IMAGE,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/sources/freecodecamp',
      title: 'freeCodeCamp on daily.dev',
      description:
        'Followed by developers across daily.dev. Get every new post in your feed.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'freeCodeCamp on daily.dev',
      imageNode: (
        <RecommendedOg
          kind="generic"
          title="freeCodeCamp"
          subtitle="Learn to code — for free."
          meta="15k followers"
          cover={FREECODECAMP_LOGO}
        />
      ),
    },
  },
  {
    id: 'tag',
    name: 'Tag / Topic feed',
    what: 'Sharing a tag feed (e.g. /tags/react).',
    source: 'ReferralCampaignKey.ShareTag',
    issues: ['Generic brand image; the topic name appears only in text.'],
    recommendations: [
      'Generate a topic card: "#react" + a one-line topic description + a few sample source logos.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/tags/react',
      title: 'react | daily.dev',
      description:
        'Explore the React JavaScript library for building user interfaces.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: DEFAULT_OG_IMAGE,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/tags/react',
      title: '#react on daily.dev',
      description:
        'Explore the React JavaScript library for building user interfaces.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'The #react topic on daily.dev',
      imageNode: (
        <RecommendedOg
          kind="tag"
          title="#react"
          subtitle="Building user interfaces with the React library"
          cta="Explore the feed"
          mascot={cloudinaryCharmNotEnoughTags}
        />
      ),
    },
  },
  {
    id: 'comment',
    name: 'Comment / Discussion',
    what: 'Sharing a specific comment on a post.',
    source: 'ReferralCampaignKey.ShareComment',
    issues: [
      'Reuses the post image; the comment that the user actually wanted to highlight is invisible in the preview.',
    ],
    recommendations: [
      'Generate a discussion card: comment excerpt as the hero, commenter avatar/name, post title as context.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/posts/qojM1enSN#c_456',
      title: 'How to use traces to avoid breaking changes | daily.dev',
      description:
        'Reuses the post image — the highlighted comment is invisible in the preview.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: POST_OG,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/posts/qojM1enSN#c_456',
      title: '“Great article! Thanks for sharing 🙌” — sirajju on daily.dev',
      description:
        'sirajju commented on “How to use traces to avoid breaking changes”. Join the discussion.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'Comment by sirajju on a daily.dev discussion',
      imageNode: (
        <RecommendedOg
          kind="comment"
          title="“Great article! Thanks for sharing 🙌”"
          name="sirajju"
          handle="sirajju"
          avatarSrc={COMMENT_AVATAR}
          meta="on “How to use traces to avoid breaking changes”"
          upvotes="21"
          comments="2"
        />
      ),
    },
  },
  {
    id: 'invite',
    name: 'Invite friends / Referral',
    what: 'Personal referral link (the generic /?cid root link from Invite friends).',
    source: '/?cid=… · ReferralCampaignKey.Generic',
    issues: [
      'The root referral link (app.daily.dev/?cid=…&userid=…) falls back to the generic brand image — no referrer, no incentive, no personalization.',
      'Highest-intent growth surface, weakest preview. (A separate og.daily.dev/api/refs card exists for /join links, but it’s off the unified template and currently returns empty for many users.)',
    ],
    recommendations: [
      'Generate a referral card with the referrer’s avatar + "{name} invited you to daily.dev" + a clear CTA, on the unified template.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/?cid=generic&userid=u_123',
      title: 'daily.dev | Where developers grow together',
      description:
        'daily.dev is the easiest way to stay updated on the latest programming news…',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: DEFAULT_OG_IMAGE,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/?cid=generic&userid=u_123',
      title: 'Ido invited you to daily.dev',
      description:
        'The professional network where developers grow together. Free forever.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'Ido invited you to daily.dev',
      imageNode: (
        <RecommendedOg
          kind="invite"
          sharer="Ido Shamun"
          avatarSrc={PROFILE_AVATAR}
          title="Join me on daily.dev"
          subtitle="The one feed developers actually read"
          cta="Tap to join"
          mascot={cloudinaryCharmEmptySquads}
        />
      ),
    },
  },
  {
    id: 'plus',
    name: 'Plus subscription',
    what: 'Sharing / gifting daily.dev Plus.',
    source: '/plus',
    issues: [
      'Generic brand image; nothing communicates the Plus value or the gift.',
    ],
    recommendations: [
      'Generate a Plus card with the Plus mark, headline benefit and gift framing when applicable.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/plus',
      title: 'Unlock Premium Developer Features with Plus | daily.dev',
      description:
        'daily.dev is the easiest way to stay updated on the latest programming news…',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: DEFAULT_OG_IMAGE,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/plus',
      title: 'daily.dev Plus — your feed, supercharged',
      description:
        'AI summaries, advanced filters, and an ad-free feed. Try Plus free for 14 days.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'daily.dev Plus',
      imageNode: (
        <RecommendedOg
          kind="plus"
          title="daily.dev Plus"
          subtitle="AI summaries, advanced filters, and an ad-free feed"
          cta="Try Plus free"
          mascot={cloudinaryCharmReadLater}
        />
      ),
    },
  },
  {
    id: 'home',
    name: 'Homepage / default',
    what: 'The root URL and any page without a specific override.',
    source: 'next-seo.ts defaultOpenGraph',
    issues: [
      'Single static image; fine as a true fallback but currently does double duty for many specific share types it should not.',
    ],
    recommendations: [
      'Keep as the genuine last-resort fallback only. Every specific surface above should override it.',
    ],
    current: {
      domain: 'app.daily.dev',
      path: '/',
      title: 'daily.dev | Where developers grow together',
      description:
        'daily.dev is the easiest way to stay updated on the latest programming news. Get the best content from the top tech publications on any topic you want.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      image: DEFAULT_OG_IMAGE,
    },
    recommended: {
      domain: 'app.daily.dev',
      path: '/',
      title: 'daily.dev | Where developers grow together',
      description:
        'The professional network for developers. One feed for the best engineering content, every day.',
      cardType: 'summary_large_image',
      siteName: 'daily.dev',
      twitterSite: '@dailydotdev',
      imageAlt: 'daily.dev — where developers grow together',
      image: LANDING_OG,
    },
  },
];
