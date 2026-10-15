import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { IconSize } from '../../../components/Icon';
import { ReputationUserBadge } from '../../../components/ReputationUserBadge';
import { ShieldCheckIcon } from '../../../components/icons/ShieldCheck';
import { GitHubIcon } from '../../../components/icons/GitHub';
import { ReadingStreakIcon } from '../../../components/icons/ReadingStreak';
import { OrganizationIcon } from '../../../components/icons/Organization';
import { JobIcon } from '../../../components/icons/Job';
import { CalendarIcon } from '../../../components/icons/Calendar';
import { UserIcon } from '../../../components/icons/User';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { LfgPerson } from '../types';
import { lfgStreakQueryOptions } from '../queries';
import { formatLfgMemberSince } from '../lib/format';

interface ReceiptItem {
  key: string;
  icon: ReactNode;
  label: string;
  // Only what we check (workplace, GitHub) says verified.
  verified?: boolean;
}

const getReceipts = (
  person: LfgPerson,
  streak: number | null | undefined,
): ReceiptItem[] => {
  const company = person.companies?.[0];

  return [
    {
      key: 'reputation',
      icon: <ReputationUserBadge user={person} disableTooltip />,
      label: 'reputation',
    },
    {
      key: 'joined',
      icon: <CalendarIcon size={IconSize.Size16} />,
      label: `Member since ${formatLfgMemberSince(person.createdAt)}`,
    },
    company && {
      key: 'company',
      icon: <OrganizationIcon size={IconSize.Size16} />,
      label: `Works at ${company.name}`,
      verified: true,
    },
    !!person.experienceYears && {
      key: 'experience',
      icon: <JobIcon size={IconSize.Size16} />,
      label: `${person.experienceYears} ${
        person.experienceYears === 1 ? 'year' : 'years'
      } of work experience`,
    },
    person.verifiedGithub && {
      key: 'github',
      icon: <GitHubIcon size={IconSize.Size16} />,
      label: `GitHub connected (${person.verifiedGithub})`,
      verified: true,
    },
    !!streak && {
      key: 'streak',
      icon: <ReadingStreakIcon size={IconSize.Size16} secondary />,
      label: `${streak}-day reading streak`,
    },
    !!person.title && {
      key: 'title',
      icon: <UserIcon size={IconSize.Size16} />,
      label: person.title,
    },
  ].filter(Boolean) as ReceiptItem[];
};

export const LfgVerifiedMark = (): ReactElement => (
  <span className="flex shrink-0 items-center gap-0.5 text-accent-avocado-default typo-caption1">
    <ShieldCheckIcon size={IconSize.Size16} secondary />
    Verified
  </span>
);

// The details that travel with a person on a post and with a reach-out.
export const LfgReceipts = ({
  person,
  className,
}: {
  person: LfgPerson;
  className?: string;
}): ReactElement => {
  const { user } = useAuthContext();
  const { data: streak } = useQuery(lfgStreakQueryOptions(user, person.id));

  return (
    <ul className={classNames('flex flex-col gap-2', className)}>
      {getReceipts(person, streak).map((item) => (
        <li key={item.key} className="flex items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-2 text-text-secondary typo-footnote">
            <span className="flex shrink-0 text-text-tertiary">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </span>
          {item.verified && <LfgVerifiedMark />}
        </li>
      ))}
    </ul>
  );
};
