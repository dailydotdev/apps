import React, { ReactElement } from 'react';
import GitHubIcon from '../icons/GitHub';
import TwitterIcon from '../icons/Twitter';
import LinkIcon from '../icons/Link';
import { Button, ButtonSize } from '../buttons/Button';

export interface SocialChipsProps {
  links: { github?: string; twitter?: string; portfolio?: string };
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
    href: (x) => `https://twitter.com/${x}`,
    label: (x) => `@${x}`,
  },
  portfolio: {
    icon: <LinkIcon />,
    href: (x) => x,
    // Strip protocol from url
    label: (x) => x.replace(/(^\w+:|^)\/\//, ''),
  },
};
const order: (keyof SocialChipsProps['links'])[] = [
  'github',
  'twitter',
  'portfolio',
];

export function SocialChips({ links }: SocialChipsProps): ReactElement {
  return (
    <div className="flex overflow-x-auto tablet:flex-wrap gap-2 items-center pt-4 pb-6 pl-4 no-scrollbar">
      {order.map(
        (key) =>
          links[key] && (
            <Button
              spanClassName="w-fit my-2 font-normal"
              textPosition="justify-start"
              icon={handlers[key].icon}
              buttonSize={ButtonSize.Small}
              className="btn-secondary border-theme-divider-tertiary typo-subhead text-theme-label-tertiary w-fit"
              tag="a"
              target="_blank"
              rel="noopener"
              href={handlers[key].href(links[key])}
              key={key}
            >
              {handlers[key].label(links[key])}
            </Button>
          ),
      )}
    </div>
  );
}
