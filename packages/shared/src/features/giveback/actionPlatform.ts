import type { ComponentType } from 'react';
import {
  AppleIcon,
  ChromeIcon,
  DailyIcon,
  GitHubIcon,
  HashnodeIcon,
  LinkedInIcon,
  RedditIcon,
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
// `secondary` variant on a light tile, app-store style.
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
};
