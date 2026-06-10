import type { ComponentType } from 'react';
// AndroidIcon is not re-exported by the icons barrel, so import it directly.
import { AndroidIcon } from '../../components/icons/Android';
import {
  AppleIcon,
  BrowserGroupIcon,
  CalendarIcon,
  ChromeIcon,
  DailyIcon,
  DiscordIcon,
  DiscussIcon,
  DocsIcon,
  EarthIcon,
  EdgeIcon,
  FeatherIcon,
  GitHubIcon,
  HashnodeIcon,
  HotIcon,
  LinkIcon,
  LinkedInIcon,
  MailIcon,
  MegaphoneIcon,
  MicrophoneIcon,
  PlayIcon,
  RedditIcon,
  SitesIcon,
  SlackIcon,
  StackOverflowIcon,
  StarIcon,
  TelegramIcon,
  TerminalIcon,
  TrendingIcon,
  TwitterIcon,
  YoutubeIcon,
} from '../../components/icons';
import type { IconProps } from '../../components/Icon';

interface ActionPlatformVisual {
  name: string;
  // Real brand logo rendered as an `<img>` on the card (preferred for branded
  // surfaces). When absent, the card renders the internal `Icon` instead. If the
  // remote logo ever fails to load, the card also falls back to `Icon`, so a
  // tile can never render broken or blank.
  logoUrl?: string;
  // Internal glyph used either as the primary visual for generic surfaces
  // (blogs, newsletters, forums, events...) that have no single brand, or as the
  // offline fallback for branded surfaces.
  Icon: ComponentType<IconProps>;
  // Some internal brand glyphs ship only a hardcoded-white SVG (no color or
  // `currentColor` variant), invisible on the light tile. Flag those so the card
  // can force the fallback glyph to a dark silhouette.
  forceDark?: boolean;
}

// Most brand logos come from Simple Icons' on-demand CDN (single, predictable
// slug -> official brand-colored glyph). A few brands Simple Icons drops for
// trademark reasons (LinkedIn, Slack, Edge) come from SVGL, the same open logo
// library the sponsor wall uses.
const simpleIcon = (slug: string): string =>
  `https://cdn.simpleicons.org/${slug}`;
const svglIcon = (slug: string): string =>
  `https://svgl.app/library/${slug}.svg`;

const fallbackVisual: ActionPlatformVisual = { name: 'Link', Icon: LinkIcon };

// Real platform logos so each action reads as a growth move on a known surface
// (post on X, video on YouTube, ship on GitHub...). Keyed by the platform slug
// the backend stores on the action metadata. Branded surfaces get their actual
// logo; surfaces without a dedicated brand reuse the closest semantic glyph
// (reviews -> star, blogs -> globe, events -> calendar...).
const actionPlatformVisual: Record<string, ActionPlatformVisual> = {
  x: { name: 'X', logoUrl: simpleIcon('x'), Icon: TwitterIcon },
  youtube: {
    name: 'YouTube',
    logoUrl: simpleIcon('youtube'),
    Icon: YoutubeIcon,
  },
  hashnode: {
    name: 'Hashnode',
    logoUrl: simpleIcon('hashnode'),
    Icon: HashnodeIcon,
    forceDark: true,
  },
  github: { name: 'GitHub', logoUrl: simpleIcon('github'), Icon: GitHubIcon },
  reddit: { name: 'Reddit', logoUrl: simpleIcon('reddit'), Icon: RedditIcon },
  linkedin: {
    name: 'LinkedIn',
    logoUrl: svglIcon('linkedin'),
    Icon: LinkedInIcon,
  },
  app_store: {
    name: 'App Store',
    logoUrl: simpleIcon('appstore'),
    Icon: AppleIcon,
    forceDark: true,
  },
  chrome_web_store: {
    name: 'Chrome Web Store',
    logoUrl: simpleIcon('googlechrome'),
    Icon: ChromeIcon,
  },
  daily_dev: {
    name: 'daily.dev',
    logoUrl: simpleIcon('dailydotdev'),
    Icon: DailyIcon,
    forceDark: true,
  },
  edge_addons: {
    name: 'Edge Add-ons',
    logoUrl: svglIcon('edge'),
    Icon: EdgeIcon,
  },
  firefox_addons: {
    name: 'Firefox Add-ons',
    logoUrl: simpleIcon('firefoxbrowser'),
    Icon: BrowserGroupIcon,
  },
  google_play: {
    name: 'Google Play',
    logoUrl: simpleIcon('googleplay'),
    Icon: AndroidIcon,
  },
  trustpilot: {
    name: 'Trustpilot',
    logoUrl: simpleIcon('trustpilot'),
    Icon: StarIcon,
  },
  g2: { name: 'G2', logoUrl: simpleIcon('g2'), Icon: StarIcon },
  // Capterra has no logo on either CDN, so it keeps the semantic review glyph.
  capterra: { name: 'Capterra', Icon: StarIcon },
  product_hunt: {
    name: 'Product Hunt',
    logoUrl: simpleIcon('producthunt'),
    Icon: TrendingIcon,
  },
  directory: { name: 'Directories', Icon: SitesIcon },
  medium: { name: 'Medium', logoUrl: simpleIcon('medium'), Icon: FeatherIcon },
  dev: { name: 'DEV', logoUrl: simpleIcon('devdotto'), Icon: TerminalIcon },
  blog: { name: 'Blog', Icon: EarthIcon },
  newsletter: { name: 'Newsletter', Icon: MailIcon },
  notion: { name: 'Notion', logoUrl: simpleIcon('notion'), Icon: DocsIcon },
  website: { name: 'Website', Icon: EarthIcon },
  hacker_news: {
    name: 'Hacker News',
    logoUrl: simpleIcon('ycombinator'),
    Icon: HotIcon,
  },
  stack_overflow: {
    name: 'Stack Overflow',
    logoUrl: simpleIcon('stackoverflow'),
    Icon: StackOverflowIcon,
  },
  discord: {
    name: 'Discord',
    logoUrl: simpleIcon('discord'),
    Icon: DiscordIcon,
  },
  slack: { name: 'Slack', logoUrl: svglIcon('slack'), Icon: SlackIcon },
  telegram: {
    name: 'Telegram',
    logoUrl: simpleIcon('telegram'),
    Icon: TelegramIcon,
  },
  indie_hackers: {
    name: 'Indie Hackers',
    logoUrl: simpleIcon('indiehackers'),
    Icon: MegaphoneIcon,
  },
  forum: { name: 'Forums', Icon: DiscussIcon },
  twitch: { name: 'Twitch', logoUrl: simpleIcon('twitch'), Icon: PlayIcon },
  podcast: { name: 'Podcast', Icon: MicrophoneIcon },
  event: { name: 'Events', Icon: CalendarIcon },
  wiki: {
    name: 'Wikipedia',
    logoUrl: simpleIcon('wikipedia'),
    Icon: EarthIcon,
  },
};

// Every platform is mapped, but unknown/missing slugs fall back to a neutral
// link glyph so a card can never render a blank tile.
export const getActionPlatformVisual = (
  platform: string | null,
): ActionPlatformVisual =>
  (platform && actionPlatformVisual[platform.toLowerCase()]) || fallbackVisual;
