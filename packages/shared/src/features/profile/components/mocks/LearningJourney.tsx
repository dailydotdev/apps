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
  BookmarkIcon,
  StarIcon,
  TrendingIcon,
  LinkIcon,
} from '../../../../components/icons';

interface LearningGoalProps {
  title: string;
  progress: number;
  articlesRead: number;
  target: number;
}

const LearningGoal = ({
  title,
  progress,
  articlesRead,
  target,
}: LearningGoalProps): ReactElement => (
  <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3">
    <div className="flex items-center justify-between">
      <span className="font-medium text-text-primary typo-callout">
        {title}
      </span>
      <span className="text-text-tertiary typo-footnote">
        {articlesRead}/{target} articles
      </span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-4 bg-surface-secondary">
      <div
        className="h-full rounded-4 bg-brand-default transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

interface SavedArticleProps {
  title: string;
  source: string;
  readTime: number;
  tags: string[];
}

const SavedArticle = ({
  title,
  source,
  readTime,
  tags,
}: SavedArticleProps): ReactElement => (
  <div className="flex flex-col gap-1.5 rounded-10 border border-border-subtlest-tertiary p-3 transition-colors hover:bg-surface-float">
    <span className="line-clamp-2 font-medium text-text-primary typo-callout">
      {title}
    </span>
    <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
      <span>{source}</span>
      <span>•</span>
      <span>{readTime} min read</span>
    </div>
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-6 bg-surface-float px-2 py-0.5 text-text-quaternary typo-footnote"
        >
          #{tag}
        </span>
      ))}
    </div>
  </div>
);

interface TopicExpertiseProps {
  topic: string;
  level: number;
  articles: number;
}

const TopicExpertise = ({
  topic,
  level,
  articles,
}: TopicExpertiseProps): ReactElement => {
  const levelLabels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const levelColors = [
    'bg-text-quaternary',
    'bg-status-warning',
    'bg-brand-default',
    'bg-status-success',
  ];

  return (
    <div className="flex items-center gap-3 rounded-10 bg-surface-float px-3 py-2">
      <div className="flex flex-1 flex-col gap-1">
        <span className="font-medium text-text-primary typo-callout">
          {topic}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-2 ${
                i < level ? levelColors[level - 1] : 'bg-surface-secondary'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-text-tertiary typo-footnote">
          {levelLabels[level - 1]}
        </span>
        <span className="text-text-quaternary typo-footnote">
          {articles} articles
        </span>
      </div>
    </div>
  );
};

export const LearningJourney = (): ReactElement => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Typography
        type={TypographyType.Body}
        tag={TypographyTag.H2}
        color={TypographyColor.Primary}
        bold
      >
        Learning Journey
      </Typography>

      {/* Current Learning Goals */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <StarIcon size={IconSize.Small} className="text-text-tertiary" />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="uppercase tracking-wider"
          >
            Learning Goals
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          <LearningGoal
            title="Master Rust fundamentals"
            progress={65}
            articlesRead={13}
            target={20}
          />
          <LearningGoal
            title="System Design deep dive"
            progress={40}
            articlesRead={8}
            target={20}
          />
        </div>
      </div>

      {/* Knowledge Areas */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <TrendingIcon size={IconSize.Small} className="text-text-tertiary" />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="uppercase tracking-wider"
          >
            Knowledge Areas
          </Typography>
        </div>
        <div className="grid gap-2 tablet:grid-cols-2">
          <TopicExpertise topic="TypeScript" level={4} articles={156} />
          <TopicExpertise topic="React" level={4} articles={203} />
          <TopicExpertise topic="System Design" level={3} articles={67} />
          <TopicExpertise topic="DevOps" level={2} articles={34} />
          <TopicExpertise topic="Machine Learning" level={2} articles={28} />
          <TopicExpertise topic="Rust" level={1} articles={13} />
        </div>
      </div>

      {/* Reading List / Saved Articles */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkIcon
              size={IconSize.Small}
              className="text-text-tertiary"
            />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="uppercase tracking-wider"
            >
              Reading List
            </Typography>
          </div>
          <a
            href="#"
            className="flex items-center gap-1 text-brand-default typo-footnote hover:underline"
          >
            View all (47)
            <LinkIcon size={IconSize.XSmall} />
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <SavedArticle
            title="Understanding Rust's Ownership Model: A Deep Dive"
            source="rust-lang.org"
            readTime={12}
            tags={['rust', 'memory', 'systems']}
          />
          <SavedArticle
            title="Building Scalable Systems: Lessons from Netflix"
            source="netflixtechblog.com"
            readTime={8}
            tags={['architecture', 'scale', 'microservices']}
          />
          <SavedArticle
            title="The Future of React: Server Components Explained"
            source="react.dev"
            readTime={15}
            tags={['react', 'rsc', 'frontend']}
          />
        </div>
      </div>

      {/* Reading Stats */}
      <div className="flex items-center gap-4 rounded-12 bg-surface-float p-4">
        <div className="flex flex-1 flex-col items-center">
          <span className="font-bold text-text-primary typo-title2">847</span>
          <span className="text-text-tertiary typo-footnote">
            Articles read
          </span>
        </div>
        <div className="h-8 w-px bg-border-subtlest-tertiary" />
        <div className="flex flex-1 flex-col items-center">
          <span className="font-bold text-text-primary typo-title2">142h</span>
          <span className="text-text-tertiary typo-footnote">Reading time</span>
        </div>
        <div className="h-8 w-px bg-border-subtlest-tertiary" />
        <div className="flex flex-1 flex-col items-center">
          <span className="font-bold text-text-primary typo-title2">23</span>
          <span className="text-text-tertiary typo-footnote">
            Topics explored
          </span>
        </div>
      </div>
    </div>
  );
};
