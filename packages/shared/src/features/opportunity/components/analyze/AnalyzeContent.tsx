import type { ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
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
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

type AnalyzeContentProps = {
  loadingStep: number;
};

const ReachHeroSection = ({
  totalCount,
  isLoading,
}: {
  totalCount: number;
  isLoading: boolean;
}) => {
  const [animatedCount, setAnimatedCount] = React.useState(0);

  React.useEffect(() => {
    if (isLoading || totalCount === 0) {
      return undefined;
    }

    const duration = 1200;
    const steps = 40;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setAnimatedCount(totalCount);
        clearInterval(timer);
      } else {
        // Ease-out effect: start fast, slow down at end
        const progress = currentStep / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setAnimatedCount(Math.floor(totalCount * easedProgress));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isLoading, totalCount]);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float p-8">
        <div className="flex flex-col items-center gap-3">
          <ElementPlaceholder className="h-16 w-56 rounded-8" />
          <ElementPlaceholder className="h-6 w-72 rounded-8" />
          <ElementPlaceholder className="mt-2 h-4 w-48 rounded-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-16 border border-brand-subtlest bg-brand-float">
      <div className="relative flex flex-col items-center gap-1 px-6 py-8">
        {/* Main number with emphasis */}
        <div className="flex items-baseline gap-1">
          <Typography
            type={TypographyType.Tera}
            color={TypographyColor.Brand}
            bold
            className="tabular-nums tracking-tight"
          >
            {animatedCount.toLocaleString()}
          </Typography>
          <Typography type={TypographyType.Giga3} color={TypographyColor.Brand} bold>
            +
          </Typography>
        </div>

        <Typography type={TypographyType.Title2} bold className="text-center">
          relevant developers in your reach
        </Typography>

        {/* Exclusive reach stat */}
        <div className="mt-4 flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-background-default px-4 py-2">
          <div className="size-2 rounded-full bg-brand-default" />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            <span className="font-bold text-brand-default">30%</span> exclusively
            reachable on daily.dev
          </Typography>
        </div>
      </div>
    </div>
  );
};

type AggregationCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  accentColor: 'avocado' | 'water' | 'cabbage';
  children: React.ReactNode;
  isLoading?: boolean;
  delay?: number;
};

const accentColorMap = {
  avocado: {
    iconBg: 'bg-accent-avocado-subtlest',
    iconColor: 'text-accent-avocado-default',
  },
  water: {
    iconBg: 'bg-accent-water-subtlest',
    iconColor: 'text-accent-water-default',
  },
  cabbage: {
    iconBg: 'bg-accent-cabbage-subtlest',
    iconColor: 'text-accent-cabbage-default',
  },
};

const AggregationCard = ({
  title,
  subtitle,
  icon,
  accentColor,
  children,
  isLoading,
  delay = 0,
}: AggregationCardProps) => {
  const colors = accentColorMap[accentColor];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
        <div className="flex items-center gap-3">
          <ElementPlaceholder className="size-9 rounded-10" />
          <div className="flex flex-col gap-1">
            <ElementPlaceholder className="h-4 w-24 rounded-4" />
            <ElementPlaceholder className="h-3 w-32 rounded-4" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <ElementPlaceholder className="h-5 w-full rounded-6" />
          <ElementPlaceholder className="h-5 w-3/4 rounded-6" />
          <ElementPlaceholder className="h-5 w-2/3 rounded-6" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 opacity-0"
      style={{
        animation: `slideUp 0.4s ease-out ${delay}ms forwards`,
      }}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div
          className={classNames(
            'flex size-9 items-center justify-center rounded-10',
            colors.iconBg,
            colors.iconColor,
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <Typography type={TypographyType.Callout} bold>
            {title}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {subtitle}
          </Typography>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

const iconSize = 24;

// CSS keyframe animation injected via style tag
const AnimationStyles = () => (
  <style>{`
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}</style>
);

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
      <AnimationStyles />
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
                  <div
                    key={company.name}
                    className="flex items-center gap-2.5"
                  >
                    <img
                      src={`${apiUrl}/icon?url=${encodeURIComponent(company.favicon)}&size=${iconSize}`}
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
          <ShieldIcon secondary className="size-4 text-accent-avocado-default" />
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

