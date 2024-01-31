import React, { ReactElement } from 'react';
import { GitHubIcon, TwitterIcon, LinkIcon } from '../icons';
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
  const elements = order
    .filter((key) => !!links[key])
    .map((key) => (
      <Button
        spanClassName="my-2 font-normal text-ellipsis whitespace-nowrap overflow-hidden flex-1"
        textPosition="justify-start"
        icon={handlers[key].icon}
        buttonSize={ButtonSize.Small}
        className="btn-secondary w-fit max-w-full border-theme-divider-tertiary text-theme-label-tertiary typo-subhead first:ml-4 tablet:first:ml-0"
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
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto tablet:flex-wrap tablet:px-4">
      {elements}
    </div>
  );
}
