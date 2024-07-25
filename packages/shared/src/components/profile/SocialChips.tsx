import React, { ReactElement } from 'react';
import {
  GitHubIcon,
  TwitterIcon,
  LinkIcon,
  LinkedInIcon,
  YoutubeIcon,
  StackOverflowIcon,
  RedditIcon,
  RoadmapIcon,
  MastodonIcon,
  ThreadsIcon,
  CodePenIcon,
} from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { withHttps, withoutProtocol } from '../../lib/links';

export interface SocialChipsProps {
  links: {
    github?: string;
    twitter?: string;
    portfolio?: string;
    roadmap?: string;
    threads?: string;
    codepen?: string;
    reddit?: string;
    stackoverflow?: string;
    youtube?: string;
    linkedin?: string;
    mastodon?: string;
  };
}

const handlers: Record<
  keyof SocialChipsProps['links'],
  {
    icon: ReactElement;
    href: (x: string) => string;
    label: (x: string) => string;
  }
> = {
  github: {
    icon: <GitHubIcon />,
    href: (x) => `https://github.com/${x}`,
    label: (x) => `@${x}`,
  },
  twitter: {
    icon: <TwitterIcon />,
    href: (x) => `https://x.com/${x}`,
    label: (x) => `@${x}`,
  },
  portfolio: {
    icon: <LinkIcon />,
    href: (x) => withHttps(x),
    // Strip protocol from url
    label: (x) => withoutProtocol(x),
  },
  linkedin: {
    icon: <LinkedInIcon />,
    href: (x) => `https://linkedin.com/in/${x}`,
    label: (x) => x,
  },
  youtube: {
    icon: <YoutubeIcon />,
    href: (x) => `https://youtube.com/@${x}`,
    label: (x) => `@${x}`,
  },
  stackoverflow: {
    icon: <StackOverflowIcon />,
    href: (x) => `https://stackoverflow.com/users/${x}`,
    label: (x) => x.split('/')[1] || x,
  },
  reddit: {
    icon: <RedditIcon />,
    href: (x) => `https://reddit.com/user/${x}`,
    label: (x) => `u/${x}`,
  },
  roadmap: {
    icon: <RoadmapIcon />,
    href: (x) => `https://roadmap.sh/u/${x}`,
    label: (x) => x,
  },
  mastodon: {
    icon: <MastodonIcon />,
    href: (x) => x,
    label: (x) => withoutProtocol(x),
  },
  threads: {
    icon: <ThreadsIcon />,
    href: (x) => `https://threads.net/@${x}`,
    label: (x) => `@${x}`,
  },
  codepen: {
    icon: <CodePenIcon />,
    href: (x) => `https://codepen.io/${x}`,
    label: (x) => x,
  },
};
const order: (keyof SocialChipsProps['links'])[] = [
  'github',
  'linkedin',
  'portfolio',
  'twitter',
  'youtube',
  'stackoverflow',
  'reddit',
  'roadmap',
  'codepen',
  'mastodon',
  'threads',
];

export function SocialChips({ links }: SocialChipsProps): ReactElement {
  const elements = order
    .filter((key) => !!links[key])
    .map((key) => (
      <Button
        icon={handlers[key].icon}
        size={ButtonSize.Small}
        variant={ButtonVariant.Subtle}
        tag="a"
        target="_blank"
        rel="noopener"
        href={handlers[key].href(links[key])}
        key={key}
        data-testid={key}
      >
        {handlers[key].label(links[key])}
      </Button>
    ));

  if (!elements.length) {
    return <></>;
  }

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 laptop:flex-wrap">
      {elements}
    </div>
  );
}
