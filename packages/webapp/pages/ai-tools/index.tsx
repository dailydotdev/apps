import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import {
  ResponsivePageContainer,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import ProtectedPage from '../../components/ProtectedPage';
import { getLayout } from '../../components/layouts/MainLayout';
import { TrendingSection } from '../../components/ai-tools/TrendingSection';
import { ToolCard } from '../../components/ai-tools/ToolCard';
import {
  mockTools,
  trendingInsights,
} from '../../components/ai-tools/mockData';

const AITools = (): ReactElement => {
  return (
    <ProtectedPage>
      <div className="mx-auto w-full max-w-[64rem]">
        <LayoutHeader
          className={classNames('!mb-0 gap-2 border-b px-4', pageBorders)}
        >
          <div className="flex flex-1 flex-col gap-1">
            <Typography
              type={TypographyType.Title2}
              bold
              color={TypographyColor.Primary}
            >
              AI Coding Tools
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Your go-to resource for AI coding assistants, with real-time
              insights from the developer community
            </Typography>
          </div>
        </LayoutHeader>

        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-8 py-6">
          {/* Trending Section */}
          <TrendingSection insights={trendingInsights} />

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-theme-bg-tertiary rounded-12 border border-border-subtlest-tertiary p-4 text-center">
              <Typography
                type={TypographyType.Title1}
                bold
                color={TypographyColor.Primary}
              >
                {mockTools.length}
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Tools tracked
              </Typography>
            </div>
            <div className="bg-theme-bg-tertiary rounded-12 border border-border-subtlest-tertiary p-4 text-center">
              <Typography
                type={TypographyType.Title1}
                bold
                color={TypographyColor.Primary}
              >
                5.2K
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Mentions today
              </Typography>
            </div>
            <div className="bg-theme-bg-tertiary rounded-12 border border-border-subtlest-tertiary p-4 text-center">
              <Typography
                type={TypographyType.Title1}
                bold
                color={TypographyColor.Primary}
              >
                23K+
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Community reviews
              </Typography>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Typography
                type={TypographyType.Title3}
                bold
                color={TypographyColor.Primary}
              >
                All Tools
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Sorted by trending
              </Typography>
            </div>

            <div className="flex flex-col gap-4">
              {mockTools
                .sort((a, b) => b.trending.mentions - a.trending.mentions)
                .map((tool) => (
                  <ToolCard key={tool.id} tool={tool} allTools={mockTools} />
                ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-6 text-center">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              🚧 This is a demo preview with mocked data. Real-time data
              integration coming soon!
            </Typography>
          </div>
        </ResponsivePageContainer>
      </div>
    </ProtectedPage>
  );
};

const seo: NextSeoProps = {
  title: 'AI Coding Tools - Real-time insights from developers',
  description:
    'Discover the best AI coding tools with real-time insights, community reviews, and detailed comparisons.',
  nofollow: false,
  noindex: false,
};

AITools.getLayout = getLayout;
AITools.layoutProps = { seo };

export default AITools;
