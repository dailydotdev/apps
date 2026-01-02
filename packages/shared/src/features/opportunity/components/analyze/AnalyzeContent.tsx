import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { OpportunityPreviewStatus } from '../../types';
import { JobInfo } from './JobInfo';
import { apiUrl } from '../../../../lib/config';
import { Image, ImageType } from '../../../../components/image/Image';
import { ReachHeroSection } from './ReachHeroSection';
import { InsightCard } from './InsightCard';
import { Chip } from '../../../../components/cards/common/PostTags';

type AnalyzeContentProps = {
  loadingStep: number;
};

const iconSize = 24;

export const AnalyzeContent = ({ loadingStep }: AnalyzeContentProps) => {
  const data = useOpportunityPreviewContext();
  const isReady = data?.result?.status === OpportunityPreviewStatus.READY;
  const totalCount = data?.result?.totalCount ?? 0;
  const tags = data?.result?.tags ?? [];
  const companies = data?.result?.companies ?? [];
  const squads = data?.result?.squads ?? [];

  const showAggregation = loadingStep >= 2 && (isReady || tags.length > 0);
  const showReachHero = loadingStep >= 2;

  return (
    <div className="flex flex-1 justify-center overflow-auto bg-background-subtle p-4 laptop:p-6">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        {/* Hero Section - Matching Stats */}
        {showReachHero && (
          <ReachHeroSection totalCount={totalCount} isLoading={!isReady} />
        )}

        {/* Candidate Insights */}
        {showAggregation && (
          <div className="grid gap-4 tablet:grid-cols-3">
            {/* Tags */}
            <InsightCard
              label="Interested in"
              tooltip="Topics these developers actively read and engage with on daily.dev"
              isLoading={!isReady}
            >
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 6).map((tag) => (
                  <Chip key={tag} className="!my-0">
                    #{tag}
                  </Chip>
                ))}
                {tags.length > 6 && (
                  <Chip className="!my-0">+{tags.length - 6}</Chip>
                )}
              </div>
            </InsightCard>

            {/* Companies */}
            <InsightCard
              label="Currently working at"
              tooltip="Companies where matched developers currently work"
              isLoading={!isReady}
            >
              <div className="flex flex-wrap gap-1.5">
                {companies.slice(0, 4).map((company) => (
                  <Chip key={company.name} className="!my-0 gap-1.5">
                    <img
                      src={`${apiUrl}/icon?url=${encodeURIComponent(
                        company.favicon || '',
                      )}&size=${iconSize}`}
                      className="size-4 rounded-full bg-surface-float object-contain"
                      alt={company.name}
                    />
                    <span>{company.name}</span>
                  </Chip>
                ))}
              </div>
            </InsightCard>

            {/* Squads */}
            <InsightCard
              label="Active in"
              tooltip="Communities where these developers engage and share knowledge"
              isLoading={!isReady}
            >
              <div className="flex flex-wrap gap-1.5">
                {squads.slice(0, 4).map((squad) => (
                  <Chip key={squad.id} className="!my-0 gap-1.5">
                    <Image
                      src={squad.image}
                      alt={squad.name}
                      type={ImageType.Squad}
                      className="size-4 rounded-full object-cover"
                      loading="lazy"
                    />
                    <span>{squad.name}</span>
                  </Chip>
                ))}
              </div>
            </InsightCard>
          </div>
        )}

        {/* Job Summary */}
        <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="mb-3"
          >
            Parsed from your job post
          </Typography>
          <JobInfo loadingStep={loadingStep} />
        </div>
      </div>
    </div>
  );
};
