import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useUserGithubRepos } from '../../hooks/useUserGithubRepos';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { GitHubIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { GithubRepoCard } from './GithubRepoCard';

interface ProfileUserGithubReposProps {
  user: PublicProfile;
}

export function ProfileUserGithubRepos({
  user,
}: ProfileUserGithubReposProps): ReactElement | null {
  const { repos, hasGithub, isLoading } = useUserGithubRepos(user);

  if (!hasGithub || (!isLoading && repos.length === 0)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center gap-2">
        <GitHubIcon size={IconSize.XSmall} className="text-text-tertiary" />
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          GitHub Repositories
        </Typography>
      </div>
      <div className="grid grid-cols-1 gap-3 laptop:grid-cols-2">
        {isLoading
          ? ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map(
              (key) => (
                <div
                  key={key}
                  className="h-28 animate-pulse rounded-16 bg-surface-float"
                />
              ),
            )
          : repos.map((repo) => <GithubRepoCard key={repo.id} repo={repo} />)}
      </div>
    </div>
  );
}
