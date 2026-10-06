import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { ArrowIcon, DiscussIcon, EarthIcon, HashtagIcon } from '../icons';
import { AgentIcon } from '../icons/Agent';
import { MedalIcon } from '../icons/Medal';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIsPhone } from '../../hooks/useViewSize';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureInterestAgent } from '../../lib/featureManagement';
import { webappUrl } from '../../lib/constants';

interface Place {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
}

const places: Place[] = [
  { label: 'Discussions', href: `${webappUrl}discussed`, icon: DiscussIcon },
  { label: 'Tags', href: `${webappUrl}tags`, icon: HashtagIcon },
  { label: 'Sources', href: `${webappUrl}sources`, icon: EarthIcon },
];

const agents: Place = {
  label: 'Agents',
  href: `${webappUrl}agent`,
  icon: AgentIcon,
};

const leaderboard: Place = {
  label: 'Leaderboard',
  href: `${webappUrl}users`,
  icon: MedalIcon,
};

export function ExplorePlaces(): ReactElement {
  const { isLoggedIn } = useAuthContext();
  const isPhone = useIsPhone();
  const { value: showAgents } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isLoggedIn && isPhone,
  });
  const rows = showAgents
    ? [...places, agents, leaderboard]
    : [...places, leaderboard];

  return (
    <nav aria-label="Explore" className="flex flex-col pb-6 pt-1">
      {rows.map(({ label, href, icon: Icon }) => (
        <Link key={label} href={href} passHref>
          <a className="flex h-12 items-center gap-3 px-4 text-text-primary typo-callout hover:bg-surface-hover">
            <Icon size={IconSize.Medium} className="text-text-secondary" />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <ArrowIcon
              size={IconSize.Small}
              className="rotate-90 text-text-tertiary"
            />
          </a>
        </Link>
      ))}
    </nav>
  );
}
