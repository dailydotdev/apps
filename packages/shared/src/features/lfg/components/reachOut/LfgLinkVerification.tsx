import type { ReactElement } from 'react';
import React from 'react';
import { IconSize } from '../../../../components/Icon';
import { ShieldCheckIcon } from '../../../../components/icons/ShieldCheck';

// What the API checks when a reach-out is sent: a link to a repo on the
// sender's connected GitHub.
export const isOwnGithubRepo = (
  url: string,
  githubUsername?: string | null,
): boolean => {
  if (!githubUsername) {
    return false;
  }

  try {
    const { hostname, pathname } = new URL(url.trim());
    const [owner, repo] = pathname.split('/').filter(Boolean);

    return (
      hostname.replace(/^www\./, '') === 'github.com' &&
      !!repo &&
      owner?.toLowerCase() === githubUsername.toLowerCase()
    );
  } catch {
    return false;
  }
};

export const isHttpUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value.trim());

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

export const LfgVerifiedLink = ({
  isOwn,
}: {
  // The viewer's own link, or someone else's.
  isOwn: boolean;
}): ReactElement => (
  <span className="flex items-center gap-1 text-accent-avocado-default typo-caption1">
    <ShieldCheckIcon size={IconSize.Size16} secondary />
    Verified: a repo on {isOwn ? 'your' : 'their'} connected GitHub
  </span>
);

export const LfgUnverifiedLink = ({
  isOwn,
  hasGithub,
}: {
  isOwn: boolean;
  hasGithub: boolean;
}): ReactElement => {
  const whose = isOwn ? 'your' : 'their';
  let copy = `Not verified. ${
    isOwn ? "You haven't" : "They haven't"
  } connected GitHub.`;

  if (hasGithub) {
    copy = `Not verified. Only repos on ${whose} connected GitHub get the badge.`;
  }

  return <span className="text-text-quaternary typo-caption1">{copy}</span>;
};
