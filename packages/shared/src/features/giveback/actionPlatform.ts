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
  Icon: ComponentType<IconProps>;
  name: string;
}

// Real platform logos so each action reads as a growth move on a known surface
// (post on X, video on YouTube, ship on GitHub...). Rendered with the colored
// `secondary` variant on a light tile, app-store style. Surfaces without a
// dedicated brand glyph reuse the closest semantic icon (reviews → star,
// blogs → globe, events → calendar...).
export const actionPlatformVisual: Record<
  GivebackActionPlatform,
  ActionPlatformVisual
> = {
  [GivebackActionPlatform.X]: { Icon: TwitterIcon, name: 'X' },
  [GivebackActionPlatform.YouTube]: { Icon: YoutubeIcon, name: 'YouTube' },
  [GivebackActionPlatform.Hashnode]: { Icon: HashnodeIcon, name: 'Hashnode' },
  [GivebackActionPlatform.GitHub]: { Icon: GitHubIcon, name: 'GitHub' },
  [GivebackActionPlatform.Reddit]: { Icon: RedditIcon, name: 'Reddit' },
  [GivebackActionPlatform.LinkedIn]: { Icon: LinkedInIcon, name: 'LinkedIn' },
  [GivebackActionPlatform.AppStore]: { Icon: AppleIcon, name: 'App Store' },
  [GivebackActionPlatform.ChromeWebStore]: {
    Icon: ChromeIcon,
    name: 'Chrome Web Store',
  },
  [GivebackActionPlatform.DailyDev]: { Icon: DailyIcon, name: 'daily.dev' },
  [GivebackActionPlatform.EdgeAddons]: { Icon: EdgeIcon, name: 'Edge Add-ons' },
  [GivebackActionPlatform.FirefoxAddons]: {
    Icon: BrowserGroupIcon,
    name: 'Firefox Add-ons',
  },
  [GivebackActionPlatform.GooglePlay]: {
    Icon: AndroidIcon,
    name: 'Google Play',
  },
  [GivebackActionPlatform.Trustpilot]: { Icon: StarIcon, name: 'Trustpilot' },
  [GivebackActionPlatform.G2]: { Icon: StarIcon, name: 'G2' },
  [GivebackActionPlatform.Capterra]: { Icon: StarIcon, name: 'Capterra' },
  [GivebackActionPlatform.ProductHunt]: {
    Icon: TrendingIcon,
    name: 'Product Hunt',
  },
  [GivebackActionPlatform.Directory]: { Icon: SitesIcon, name: 'Directories' },
  [GivebackActionPlatform.Medium]: { Icon: FeatherIcon, name: 'Medium' },
  [GivebackActionPlatform.Dev]: { Icon: TerminalIcon, name: 'DEV' },
  [GivebackActionPlatform.Blog]: { Icon: EarthIcon, name: 'Blog' },
  [GivebackActionPlatform.Newsletter]: { Icon: MailIcon, name: 'Newsletter' },
  [GivebackActionPlatform.Notion]: { Icon: DocsIcon, name: 'Notion' },
  [GivebackActionPlatform.Website]: { Icon: BrowserGroupIcon, name: 'Website' },
  [GivebackActionPlatform.HackerNews]: { Icon: HotIcon, name: 'Hacker News' },
  [GivebackActionPlatform.StackOverflow]: {
    Icon: StackOverflowIcon,
    name: 'Stack Overflow',
  },
  [GivebackActionPlatform.Discord]: { Icon: DiscordIcon, name: 'Discord' },
  [GivebackActionPlatform.Slack]: { Icon: SlackIcon, name: 'Slack' },
  [GivebackActionPlatform.Telegram]: { Icon: TelegramIcon, name: 'Telegram' },
  [GivebackActionPlatform.IndieHackers]: {
    Icon: MegaphoneIcon,
    name: 'Indie Hackers',
  },
  [GivebackActionPlatform.Forum]: { Icon: DiscussIcon, name: 'Forums' },
  [GivebackActionPlatform.Twitch]: { Icon: PlayIcon, name: 'Twitch' },
  [GivebackActionPlatform.Podcast]: { Icon: MicrophoneIcon, name: 'Podcast' },
  [GivebackActionPlatform.Event]: { Icon: CalendarIcon, name: 'Events' },
  [GivebackActionPlatform.Wiki]: { Icon: EarthIcon, name: 'Wikipedia' },
};
