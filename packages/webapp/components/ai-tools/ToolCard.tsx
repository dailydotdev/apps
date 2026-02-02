import React from 'react';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  UpvoteIcon,
  EyeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import type { AITool } from './types';

interface ToolCardProps {
  tool: AITool;
  allTools: AITool[];
}

export const ToolCard = ({ tool, allTools }: ToolCardProps): ReactElement => {
  const alternatives = allTools.filter((t) =>
    tool.alternatives.includes(t.id),
  );

  return (
    <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 hover:border-border-subtlest-secondary">
      {/* Header */}
      <FlexRow className="items-start justify-between">
        <FlexCol className="flex-1 gap-2">
          <div className="flex items-center gap-2">
            <Typography
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
            >
              {tool.name}
            </Typography>
            <span className="rounded-6 bg-theme-float px-2 py-0.5 text-xs font-bold text-text-tertiary">
              v{tool.version}
            </span>
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            by {tool.company}
          </Typography>
        </FlexCol>

        {/* Sentiment Score */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <UpvoteIcon size={IconSize.Small} secondary />
            <Typography
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
            >
              {tool.sentiment.score}%
            </Typography>
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {tool.sentiment.totalReviews.toLocaleString()} reviews
          </Typography>
        </div>
      </FlexRow>

      {/* TLDR */}
      <div className="rounded-12 border border-accent-cabbage-default bg-accent-cabbage-subtlest p-3">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          💡 {tool.tldr}
        </Typography>
      </div>

      {/* Description */}
      <Typography type={TypographyType.Body} color={TypographyColor.Secondary}>
        {tool.description}
      </Typography>

      {/* Pricing & Install */}
      <FlexRow className="gap-4">
        <div className="flex-1 rounded-12 border border-border-subtlest-tertiary p-3">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
            className="mb-1"
          >
            Pricing
          </Typography>
          <div className="flex items-center gap-2">
            {tool.pricing.freeTier && (
              <span className="rounded-6 bg-theme-color-cabbage px-2 py-0.5 text-xs font-bold text-white">
                FREE
              </span>
            )}
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
            >
              {tool.pricing.startingPrice || 'Free'}
            </Typography>
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="mt-1"
          >
            {tool.pricing.details}
          </Typography>
        </div>

        {tool.install && (
          <div className="flex-1 rounded-12 border border-border-subtlest-tertiary p-3">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              bold
              className="mb-1"
            >
              Quick Install
            </Typography>
            <code className="block rounded-8 bg-surface-primary p-2 text-xs text-text-primary">
              {tool.install.command}
            </code>
          </div>
        )}
      </FlexRow>

      {/* Trending Stats */}
      <div className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-theme-float p-3">
        <EyeIcon size={IconSize.Small} className="text-text-tertiary" />
        <Typography type={TypographyType.Callout} color={TypographyColor.Primary}>
          <span className="font-bold">{tool.trending.mentions}</span> mentions{' '}
          <span className="text-text-tertiary">
            ({tool.trending.timeframe})
          </span>
        </Typography>
        <span
          className={`ml-2 text-xs font-bold ${
            tool.trending.change > 0
              ? 'text-theme-status-success'
              : 'text-theme-status-error'
          }`}
        >
          {tool.trending.change > 0 ? '+' : ''}
          {tool.trending.change}%
        </span>
      </div>

      {/* Top Users */}
      <div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          bold
          className="mb-2"
        >
          Top contributors
        </Typography>
        <FlexRow className="gap-3">
          {tool.topUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-theme-bg-tertiary p-2 hover:border-border-subtlest-secondary"
            >
              <LazyImage
                imgSrc={user.avatar}
                imgAlt={user.username}
                className="size-8 rounded-full"
              />
              <div className="flex flex-col">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Primary}
                  bold
                >
                  @{user.username}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Quaternary}
                  className="text-xs"
                >
                  {user.contributions} posts
                </Typography>
              </div>
            </div>
          ))}
        </FlexRow>
      </div>

      {/* Pros & Cons */}
      <FlexRow className="gap-4">
        <div className="flex-1">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
            className="mb-2"
          >
            Pros
          </Typography>
          <div className="flex flex-wrap gap-2">
            {tool.pros.map((pro) => (
              <span
                key={pro}
                className="rounded-6 border border-theme-status-success bg-theme-bg-tertiary px-2 py-1 text-xs text-text-secondary"
              >
                {pro}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
            className="mb-2"
          >
            Cons
          </Typography>
          <div className="flex flex-wrap gap-2">
            {tool.cons.map((con) => (
              <span
                key={con}
                className="rounded-6 border border-theme-status-error bg-theme-bg-tertiary px-2 py-1 text-xs text-text-secondary"
              >
                {con}
              </span>
            ))}
          </div>
        </div>
      </FlexRow>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
            className="mb-2"
          >
            Similar tools
          </Typography>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((alt) => (
              <span
                key={alt.id}
                className="cursor-pointer rounded-8 border border-border-subtlest-tertiary bg-theme-bg-tertiary px-3 py-1 text-sm text-text-secondary hover:border-text-tertiary"
              >
                {alt.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata & Links */}
      <FlexRow className="items-center justify-between border-t border-border-subtlest-tertiary pt-4">
        <div className="flex gap-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Updated: {new Date(tool.metadata.lastUpdate).toLocaleDateString()}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Latest: v{tool.metadata.latestVersion}
          </Typography>
        </div>
        <FlexRow className="gap-2">
          {tool.links.docs && (
            <Button
              variant={ButtonVariant.Tertiary}
              tag="a"
              href={tool.links.docs}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ArrowIcon className="rotate-[-45deg]" />}
            >
              Docs
            </Button>
          )}
          <Button
            variant={ButtonVariant.Primary}
            tag="a"
            href={tool.links.website}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ArrowIcon className="rotate-[-45deg]" />}
          >
            Visit
          </Button>
        </FlexRow>
      </FlexRow>
    </div>
  );
};
