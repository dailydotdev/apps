import type { ReactElement } from 'react';
import React from 'react';
import type { GitHubUserRepository } from '../../../../graphql/github';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { StarIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { githubLanguageColors } from '../../../../lib/githubLanguageColors';
import { largeNumberFormat } from '../../../../lib/numberFormat';

interface GithubRepoCardProps {
  repo: GitHubUserRepository;
}

export function GithubRepoCard({ repo }: GithubRepoCardProps): ReactElement {
  const languageColor = repo.language
    ? githubLanguageColors[repo.language]
    : undefined;

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4 transition-colors hover:border-border-subtlest-secondary"
    >
      <div className="flex items-center gap-1.5">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
          className="truncate"
        >
          {repo.name}
        </Typography>
      </div>
      {repo.description && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="line-clamp-2"
        >
          {repo.description}
        </Typography>
      )}
      <div className="mt-auto flex items-center gap-3">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block size-3 rounded-full"
              style={{
                backgroundColor: languageColor ?? 'var(--text-quaternary)',
              }}
            />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Quaternary}
            >
              {repo.language}
            </Typography>
          </span>
        )}
        {repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <StarIcon
              size={IconSize.XXSmall}
              className="text-text-quaternary"
            />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Quaternary}
            >
              {largeNumberFormat(repo.stars)}
            </Typography>
          </span>
        )}
        {repo.forks > 0 && (
          <span className="flex items-center gap-1">
            <svg
              className="size-3 text-text-quaternary"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878H6.75v-.878a2.25 2.25 0 1 0-1.5 0ZM7.25 8.75a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v2.5a2.25 2.25 0 1 1-1.51 0Zm.75 3.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
            </svg>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Quaternary}
            >
              {largeNumberFormat(repo.forks)}
            </Typography>
          </span>
        )}
      </div>
    </a>
  );
}
