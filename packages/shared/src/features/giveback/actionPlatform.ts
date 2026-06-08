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
import { GivebackActionPlatform } from './types';

interface ActionPlatformVisual {
  name: string;
  /**
   * Real brand logo rendered as an `<img>` on the card (preferred for branded
   * surfaces). When absent, the card renders the internal `Icon` instead. If
   * the remote logo ever fails to load, the card also falls back to `Icon`, so
   * a tile can never render broken or blank.
   */
  logoUrl?: string;
  /**
   * Internal glyph used either as the primary visual for generic surfaces
   * (blogs, newsletters, forums, events...) that have no single brand, or as
   * the offline fallback for branded surfaces.
   */
  Icon: ComponentType<IconProps>;
  /**
   * Some internal brand glyphs ship only a hardcoded-white SVG (no color or
   * `currentColor` variant), invisible on the light tile. Flag those so the
   * card can force the fallback glyph to a dark silhouette.
   */
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

// Real platform logos so each action reads as a growth move on a known surface
// (post on X, video on YouTube, ship on GitHub...). Branded surfaces get their
// actual logo; surfaces without a dedicated brand reuse the closest semantic
// glyph (reviews -> star, blogs -> globe, events -> calendar...).
export const actionPlatformVisual: Record<
  GivebackActionPlatform,
  ActionPlatformVisual
> = {
  [GivebackActionPlatform.X]: {
    name: 'X',
    logoUrl: simpleIcon('x'),
    Icon: TwitterIcon,
  },
  [GivebackActionPlatform.YouTube]: {
    name: 'YouTube',
    logoUrl: simpleIcon('youtube'),
    Icon: YoutubeIcon,
  },
  [GivebackActionPlatform.Hashnode]: {
    name: 'Hashnode',
    logoUrl: simpleIcon('hashnode'),
    Icon: HashnodeIcon,
    forceDark: true,
  },
  [GivebackActionPlatform.GitHub]: {
    name: 'GitHub',
    logoUrl: simpleIcon('github'),
    Icon: GitHubIcon,
  },
  [GivebackActionPlatform.Reddit]: {
    name: 'Reddit',
    logoUrl: simpleIcon('reddit'),
    Icon: RedditIcon,
  },
  [GivebackActionPlatform.LinkedIn]: {
    name: 'LinkedIn',
    logoUrl: svglIcon('linkedin'),
    Icon: LinkedInIcon,
  },
  [GivebackActionPlatform.AppStore]: {
    name: 'App Store',
    logoUrl: simpleIcon('appstore'),
    Icon: AppleIcon,
    forceDark: true,
  },
  [GivebackActionPlatform.ChromeWebStore]: {
    name: 'Chrome Web Store',
    logoUrl: simpleIcon('googlechrome'),
    Icon: ChromeIcon,
  },
  [GivebackActionPlatform.DailyDev]: {
    name: 'daily.dev',
    logoUrl: simpleIcon('dailydotdev'),
    Icon: DailyIcon,
    forceDark: true,
  },
  [GivebackActionPlatform.EdgeAddons]: {
    name: 'Edge Add-ons',
    logoUrl: svglIcon('edge'),
    Icon: EdgeIcon,
  },
  [GivebackActionPlatform.FirefoxAddons]: {
    name: 'Firefox Add-ons',
    logoUrl: simpleIcon('firefoxbrowser'),
    Icon: BrowserGroupIcon,
  },
  [GivebackActionPlatform.GooglePlay]: {
    name: 'Google Play',
    logoUrl: simpleIcon('googleplay'),
    Icon: AndroidIcon,
  },
  [GivebackActionPlatform.Trustpilot]: {
    name: 'Trustpilot',
    logoUrl: simpleIcon('trustpilot'),
    Icon: StarIcon,
  },
  [GivebackActionPlatform.G2]: {
    name: 'G2',
    logoUrl: simpleIcon('g2'),
    Icon: StarIcon,
  },
  // Capterra has no logo on either CDN, so it keeps the semantic review glyph.
  [GivebackActionPlatform.Capterra]: { name: 'Capterra', Icon: StarIcon },
  [GivebackActionPlatform.ProductHunt]: {
    name: 'Product Hunt',
    logoUrl: simpleIcon('producthunt'),
    Icon: TrendingIcon,
  },
  [GivebackActionPlatform.Directory]: { name: 'Directories', Icon: SitesIcon },
  [GivebackActionPlatform.Medium]: {
    name: 'Medium',
    logoUrl: simpleIcon('medium'),
    Icon: FeatherIcon,
  },
  [GivebackActionPlatform.Dev]: {
    name: 'DEV',
    logoUrl: simpleIcon('devdotto'),
    Icon: TerminalIcon,
  },
  [GivebackActionPlatform.Blog]: { name: 'Blog', Icon: EarthIcon },
  [GivebackActionPlatform.Newsletter]: { name: 'Newsletter', Icon: MailIcon },
  [GivebackActionPlatform.Notion]: {
    name: 'Notion',
    logoUrl: simpleIcon('notion'),
    Icon: DocsIcon,
  },
  [GivebackActionPlatform.Website]: { name: 'Website', Icon: EarthIcon },
  [GivebackActionPlatform.HackerNews]: {
    name: 'Hacker News',
    logoUrl: simpleIcon('ycombinator'),
    Icon: HotIcon,
  },
  [GivebackActionPlatform.StackOverflow]: {
    name: 'Stack Overflow',
    logoUrl: simpleIcon('stackoverflow'),
    Icon: StackOverflowIcon,
  },
  [GivebackActionPlatform.Discord]: {
    name: 'Discord',
    logoUrl: simpleIcon('discord'),
    Icon: DiscordIcon,
  },
  [GivebackActionPlatform.Slack]: {
    name: 'Slack',
    logoUrl: svglIcon('slack'),
    Icon: SlackIcon,
  },
  [GivebackActionPlatform.Telegram]: {
    name: 'Telegram',
    logoUrl: simpleIcon('telegram'),
    Icon: TelegramIcon,
  },
  [GivebackActionPlatform.IndieHackers]: {
    name: 'Indie Hackers',
    logoUrl: simpleIcon('indiehackers'),
    Icon: MegaphoneIcon,
  },
  [GivebackActionPlatform.Forum]: { name: 'Forums', Icon: DiscussIcon },
  [GivebackActionPlatform.Twitch]: {
    name: 'Twitch',
    logoUrl: simpleIcon('twitch'),
    Icon: PlayIcon,
  },
  [GivebackActionPlatform.Podcast]: { name: 'Podcast', Icon: MicrophoneIcon },
  [GivebackActionPlatform.Event]: { name: 'Events', Icon: CalendarIcon },
  [GivebackActionPlatform.Wiki]: {
    name: 'Wikipedia',
    logoUrl: simpleIcon('wikipedia'),
    Icon: EarthIcon,
  },
};
