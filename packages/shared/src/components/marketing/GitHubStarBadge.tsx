import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface GitHubStarBadgeProps {
  repository: string;
  className?: string;
}

export const GitHubStarBadge = ({
  repository,
  className,
}: GitHubStarBadgeProps): ReactElement => (
  <a
    href={`https://github.com/${repository}`}
    target="_blank"
    rel="noopener noreferrer"
    className={classNames('inline-flex', className)}
  >
    <img
      alt={`Star ${repository} on GitHub`}
      src={`https://img.shields.io/github/stars/${repository}?style=social&label=${encodeURIComponent(
        `@${repository}`,
      )}`}
      className="h-6"
    />
  </a>
);
