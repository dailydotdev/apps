import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../../../../../components/typography/Typography';
import {
  GitHubIcon,
  GitLabIcon,
  ArrowIcon,
  LockIcon,
  SourceIcon,
} from '../../../../../components/icons';
import { IconSize } from '../../../../../components/Icon';
import type { GitIntegrationData, Repository } from './types';
import { LanguageBar } from './LanguageBar';
import { ActivityChart } from './ActivityChart';

interface StatItemProps {
  label: string;
  value: number | string;
}

function StatItem({ label, value }: StatItemProps): ReactElement {
  return (
    <div className="flex flex-1 flex-col rounded-10 border border-border-subtlest-tertiary p-2 text-center">
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {label}
      </Typography>
    </div>
  );
}

interface RepoItemProps {
  repo: Repository;
}

function RepoItem({ repo }: RepoItemProps): ReactElement {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-10 px-2 py-1.5 transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-center gap-2">
        <SourceIcon size={IconSize.XSmall} className="text-text-tertiary" />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Primary}
        >
          {repo.name}
        </Typography>
        {repo.isPrivate && (
          <LockIcon size={IconSize.XSmall} className="text-text-quaternary" />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          {repo.commits.toLocaleString()} commits
        </Typography>
        <div className="hidden items-center gap-0.5 tablet:flex">
          {repo.languages.slice(0, 3).map((lang) => (
            <span
              key={lang.name}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: lang.color }}
              title={lang.name}
            />
          ))}
        </div>
      </div>
    </a>
  );
}

interface GitIntegrationStatsProps {
  data: GitIntegrationData;
  initiallyOpen?: boolean;
}

export function GitIntegrationStats({
  data,
  initiallyOpen = false,
}: GitIntegrationStatsProps): ReactElement {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [showAllRepos, setShowAllRepos] = useState(false);

  const ProviderIcon = data.provider === 'github' ? GitHubIcon : GitLabIcon;
  const providerName = data.provider === 'github' ? 'GitHub' : 'GitLab';

  const repoCount = data.repositories.length;
  const visibleRepos = showAllRepos
    ? data.repositories
    : data.repositories.slice(0, 3);
  const hiddenRepoCount = repoCount - 3;

  return (
    <section className="mt-3 flex flex-col rounded-16 border border-border-subtlest-tertiary">
      {/* Header */}
      <button
        type="button"
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-surface-hover"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <ProviderIcon size={IconSize.Small} className="text-text-tertiary" />
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            bold
          >
            {providerName} Activity
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {repoCount} {repoCount === 1 ? 'repo' : 'repos'}
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          {!isOpen && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="hidden tablet:block"
            >
              {data.aggregatedStats.totalCommits.toLocaleString()} commits
            </Typography>
          )}
          <ArrowIcon
            size={IconSize.XSmall}
            className={classNames(
              'text-text-tertiary transition-transform duration-200',
              { 'rotate-180': !isOpen },
            )}
          />
        </div>
      </button>

      {/* Collapsible content */}
      <div
        className={classNames(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="flex flex-col gap-4 border-t border-border-subtlest-tertiary p-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">
            <StatItem
              label="Commits"
              value={data.aggregatedStats.totalCommits}
            />
            <StatItem
              label="Pull Requests"
              value={data.aggregatedStats.totalPullRequests}
            />
            <StatItem
              label="Reviews"
              value={data.aggregatedStats.totalReviews}
            />
            <StatItem label="Issues" value={data.aggregatedStats.totalIssues} />
          </div>

          {/* Languages */}
          <div className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              Languages
            </Typography>
            <LanguageBar languages={data.aggregatedStats.languages} />
          </div>

          {/* Activity chart */}
          <div className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              Activity (12 weeks)
            </Typography>
            <ActivityChart data={data.aggregatedStats.activityHistory} />
          </div>

          {/* Repositories */}
          <div className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              Linked Repositories
            </Typography>
            <div className="flex flex-col rounded-10 border border-border-subtlest-tertiary">
              {visibleRepos.map((repo, index) => (
                <div
                  key={repo.name}
                  className={classNames({
                    'border-t border-border-subtlest-tertiary': index > 0,
                  })}
                >
                  <RepoItem repo={repo} />
                </div>
              ))}
              {hiddenRepoCount > 0 && !showAllRepos && (
                <button
                  type="button"
                  className="border-t border-border-subtlest-tertiary px-2 py-1.5 text-center transition-colors hover:bg-surface-hover"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllRepos(true);
                  }}
                >
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Link}
                  >
                    +{hiddenRepoCount} more
                  </Typography>
                </button>
              )}
              {showAllRepos && repoCount > 3 && (
                <button
                  type="button"
                  className="border-t border-border-subtlest-tertiary px-2 py-1.5 text-center transition-colors hover:bg-surface-hover"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllRepos(false);
                  }}
                >
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Link}
                  >
                    Show less
                  </Typography>
                </button>
              )}
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center justify-between rounded-10 border border-border-subtlest-tertiary p-2">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Current streak
            </Typography>
            <Typography type={TypographyType.Body} bold>
              {data.aggregatedStats.contributionStreak} days
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}
