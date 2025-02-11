import type { ComponentType } from 'react';
import { LinkedInIcon, RedditIcon, WhatsappIcon } from '../components/icons';
import { TwitterIcon } from '../components/icons/Twitter';

import type { IconProps } from '../components/Icon';

export enum SocialIconType {
  Reddit = 'reddit',
  X = 'x',
  LinkedIn = 'linkedin',
  WhatsApp = 'whatsapp',
}

export const socials = [
  SocialIconType.Reddit,
  SocialIconType.X,
  SocialIconType.WhatsApp,
  SocialIconType.LinkedIn,
];

export const socialIcon: Record<SocialIconType, ComponentType<IconProps>> = {
  [SocialIconType.Reddit]: RedditIcon,
  [SocialIconType.X]: TwitterIcon,
  [SocialIconType.LinkedIn]: LinkedInIcon,
  [SocialIconType.WhatsApp]: WhatsappIcon,
};

export const socialGradient = {
  reddit: 'bg-gradient-to-r !from-[#FF4500] !to-[#FF6B00]',
};

export const socialCTA = {
  x: {
    title:
      'Tired of endless hot takes and scrolling through threads that go nowhere?',
    description:
      "At daily.dev, we've replaced the noise with pure developer gold—no blue checkmarks required.",
  },
  reddit: {
    title: "You've mastered the art of finding hidden gems in the chaos.",
    description:
      "Now imagine a place where tech content is served fresh, minus the endless scrolls of cat memes (unless you're into that).",
  },
};

/**
 * NOTE! document.referrer does not contain a referrer on localhost
 */
export const getSocialReferrer = (): SocialIconType | null => {
  if (!document.referrer) {
    return null;
  }

  const url = new URL(document.referrer);
  const host = url.hostname;

  if (host.includes('reddit.')) {
    return SocialIconType.Reddit;
  }
  if (host.includes('x.') || host.includes('twitter.')) {
    return SocialIconType.X;
  }
  return null;
};
