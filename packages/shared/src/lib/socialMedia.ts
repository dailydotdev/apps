import { type ComponentType } from 'react';
import { RedditIcon } from '../components/icons';
import { TwitterIcon } from '../components/icons/Twitter';
import type { IconProps } from '../components/Icon';

export enum SocialIconType {
  Reddit = 'reddit',
  X = 'x',
}

export const socialIcon: Record<SocialIconType, ComponentType<IconProps>> = {
  [SocialIconType.Reddit]: RedditIcon,
  [SocialIconType.X]: TwitterIcon,
};

export const socialGradient = {
  reddit: 'bg-gradient-to-r from-[#FF4500] to-[#FF6B00]',
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
export const getSocialReferrer = (): string | null => {
  if (!document.referrer) {
    return null;
  }

  const url = new URL(document.referrer);
  const host = url.hostname.replace(/^www\./, '').split('.')[0];
  return ['reddit', 'x'].includes(host) ? host : null;
};
