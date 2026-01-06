import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyType,
  TypographyTag,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { IconSize } from '../../../../components/Icon';
import {
  GitHubIcon,
  StarIcon,
  MergeIcon,
  LinkIcon,
} from '../../../../components/icons';

interface ContributionProps {
  repo: string;
  owner: string;
  description: string;
  stars: number;
  prs: number;
  contributorRole: 'maintainer' | 'contributor' | 'author';
}

const ContributionCard = ({
  repo,
  owner,
  description,
  stars,
  prs,
  contributorRole,
}: ContributionProps): ReactElement => {
  const roleStyles = {
    maintainer: 'bg-status-success text-white',
    contributor: 'bg-brand-default text-white',
    author: 'bg-accent-bacon-default text-white',
  };

  return (
    <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <GitHubIcon size={IconSize.Small} className="text-text-tertiary" />
          <div className="flex flex-col">
            <span className="font-medium text-text-primary typo-callout">
              {repo}
            </span>
            <span className="text-text-quaternary typo-footnote">{owner}</span>
          </div>
        </div>
        <span
          className={`rounded-6 px-2 py-0.5 typo-footnote ${roleStyles[contributorRole]}`}
        >
          {contributorRole}
        </span>
      </div>
      <p className="line-clamp-2 text-text-secondary typo-footnote">
        {description}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-text-tertiary">
          <StarIcon size={IconSize.XSmall} />
          <span className="typo-footnote">{stars.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-text-tertiary">
          <MergeIcon size={IconSize.XSmall} />
          <span className="typo-footnote">{prs} PRs merged</span>
        </div>
      </div>
    </div>
  );
};

interface StatBoxProps {
  value: string | number;
  label: string;
  icon: ReactElement;
}

const StatBox = ({ value, label, icon }: StatBoxProps): ReactElement => (
  <div className="flex flex-1 flex-col items-center gap-1 rounded-10 bg-surface-float p-3">
    <span className="text-text-tertiary">{icon}</span>
    <span className="font-bold text-text-primary typo-title3">{value}</span>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </div>
);

export const OpenSourceImpact = (): ReactElement => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Body}
          tag={TypographyTag.H2}
          color={TypographyColor.Primary}
          bold
        >
          Open Source Impact
        </Typography>
        <a
          href="https://github.com/username"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-text-tertiary typo-footnote hover:text-text-primary"
        >
          <GitHubIcon size={IconSize.XSmall} />
          <span>@idoshamun</span>
          <LinkIcon size={IconSize.XSmall} />
        </a>
      </div>

      {/* Impact Stats */}
      <div className="flex gap-2">
        <StatBox
          value="2.4K"
          label="Total Stars"
          icon={<StarIcon size={IconSize.Small} />}
        />
        <StatBox
          value="156"
          label="PRs Merged"
          icon={<MergeIcon size={IconSize.Small} />}
        />
        <StatBox
          value="12"
          label="Projects"
          icon={<GitHubIcon size={IconSize.Small} />}
        />
      </div>

      {/* Top Contributions */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Top Contributions
        </Typography>
        <div className="flex flex-col gap-2">
          <ContributionCard
            repo="daily.dev"
            owner="dailydotdev"
            description="The homepage developers deserve - get curated dev news personalized to you"
            stars={18500}
            prs={47}
            contributorRole="maintainer"
          />
          <ContributionCard
            repo="react"
            owner="facebook"
            description="The library for web and native user interfaces"
            stars={220000}
            prs={3}
            contributorRole="contributor"
          />
          <ContributionCard
            repo="awesome-typescript"
            owner="idoshamun"
            description="A curated list of awesome TypeScript resources and libraries"
            stars={850}
            prs={0}
            contributorRole="author"
          />
        </div>
      </div>

      {/* Contribution Activity */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          This Year
        </Typography>
        <div className="flex items-center gap-3 rounded-12 bg-surface-float p-3">
          <div className="bg-status-success/20 flex h-12 w-12 items-center justify-center rounded-10">
            <span className="font-bold text-status-success typo-title2">
              847
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-text-primary typo-callout">
              Contributions in 2024
            </span>
            <span className="text-text-secondary typo-footnote">
              Top 5% most active contributor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
