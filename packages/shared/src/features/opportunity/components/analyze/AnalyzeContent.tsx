import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { OpportunityPreviewStatus } from '../../types';
import { JobInfo } from './JobInfo';
import {
  ShieldIcon,
  HashtagIcon,
  UserIcon,
  DevCardIcon,
} from '../../../../components/icons';
import { apiUrl } from '../../../../lib/config';
import { Image, ImageType } from '../../../../components/image/Image';
import { ReachHeroSection } from './ReachHeroSection';
import { AggregationCard, AggregationCardStyles } from './AggregationCard';

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

  // Show aggregation data after step 2 completes
  const showAggregation = loadingStep >= 2 && (isReady || tags.length > 0);
  // Show reach hero after step 3 completes
  const showReachHero = loadingStep >= 3;

  return (
    <div className="flex flex-1 justify-center overflow-auto bg-background-subtle p-4 laptop:p-8">
      <AggregationCardStyles />
      <div className="flex w-full max-w-3xl flex-col gap-6">
        {/* Reach Hero Section */}
        {showReachHero && (
          <ReachHeroSection totalCount={totalCount} isLoading={!isReady} />
        )}

        {/* Aggregation Cards */}
        {showAggregation && (
          <div className="grid gap-4 tablet:grid-cols-3">
            <AggregationCard
              title="Interested in"
              subtitle="Based on reading activity"
              icon={<HashtagIcon />}
              accentColor="avocado"
              isLoading={!isReady}
              delay={0}
            >
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 6).map((tag) => (
                  <Typography
                    key={tag}
                    type={TypographyType.Footnote}
                    color={TypographyColor.Secondary}
                    className="rounded-6 bg-surface-float px-2 py-1"
                  >
                    {tag}
                  </Typography>
                ))}
              </div>
            </AggregationCard>

            <AggregationCard
              title="Currently at"
              subtitle="Verified work history"
              icon={<UserIcon />}
              accentColor="water"
              isLoading={!isReady}
              delay={80}
            >
              <div className="flex flex-col gap-2.5">
                {companies.slice(0, 4).map((company) => (
                  <div key={company.name} className="flex items-center gap-2.5">
                    <img
                      src={`${apiUrl}/icon?url=${encodeURIComponent(
                        company.favicon,
                      )}&size=${iconSize}`}
                      className="size-5 rounded-4 bg-surface-float object-contain"
                      alt={company.name}
                    />
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Secondary}
                      truncate
                    >
                      {company.name}
                    </Typography>
                  </div>
                ))}
              </div>
            </AggregationCard>

            <AggregationCard
              title="Active in"
              subtitle="Where they engage daily"
              icon={<DevCardIcon />}
              accentColor="cabbage"
              isLoading={!isReady}
              delay={160}
            >
              <div className="flex flex-col gap-2.5">
                {squads.slice(0, 4).map((squad) => (
                  <div key={squad.id} className="flex items-center gap-2.5">
                    <Image
                      src={squad.image}
                      alt={squad.name}
                      type={ImageType.Squad}
                      className="size-5 rounded-6 object-cover"
                      loading="lazy"
                    />
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Secondary}
                      truncate
                    >
                      {squad.name}
                    </Typography>
                  </div>
                ))}
              </div>
            </AggregationCard>
          </div>
        )}

        {/* Job Summary */}
        <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-border-subtlest-tertiary" />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="uppercase tracking-wider"
            >
              Parsed from your job description
            </Typography>
            <div className="h-px flex-1 bg-border-subtlest-tertiary" />
          </div>
          <JobInfo loadingStep={loadingStep} />
        </div>

        {/* Trust Footer */}
        <div className="flex items-center justify-center gap-2 rounded-12">
          <ShieldIcon
            secondary
            className="size-4 text-accent-avocado-default"
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            No scraping. No spam. Only real intent.
          </Typography>
        </div>
      </div>
    </div>
  );
};
