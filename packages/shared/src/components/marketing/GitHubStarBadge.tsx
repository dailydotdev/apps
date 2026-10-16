import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface GitHubStarBadgeProps {
  repository: string;
  className?: string;
}

const getDayStamp = (date: Date): string =>
  [date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear() % 100]
    .map((part) => part.toString().padStart(2, '0'))
    .join('');

export const GitHubStarBadge = ({
  repository,
  className,
}: GitHubStarBadgeProps): ReactElement => {
  const params = new URLSearchParams({
    style: 'social',
    label: `@${repository}`,
    v: getDayStamp(new Date()),
  });

  return (
    <a
      href={`https://github.com/${repository}`}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames('inline-flex', className)}
    >
      <img
        alt={`Star ${repository} on GitHub`}
        src={`https://img.shields.io/github/stars/${repository}?${params}`}
        className="h-6"
      />
    </a>
  );
};
