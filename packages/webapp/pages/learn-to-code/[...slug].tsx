import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import Head from 'next/head';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header/BreadCrumbs';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { GraduationIcon } from '@dailydotdev/shared/src/components/icons/Graduation';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons/Copy';
import { DiscordIcon } from '@dailydotdev/shared/src/components/icons/Discord';
import { RedditIcon } from '@dailydotdev/shared/src/components/icons/Reddit';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons/Play';
import { DocsIcon } from '@dailydotdev/shared/src/components/icons/Docs';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { MOST_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons';
import { AlertIcon } from '@dailydotdev/shared/src/components/icons/Alert';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import type {
  HowItWorksStep,
  LeafPageData,
  Manifest,
  Prompt,
  RecommendedPath,
  TroubleshootingItem,
} from '../../data/learn-to-code/types';
import type { DynamicSeoProps } from '../../components/common';
import manifest from '../../data/learn-to-code/manifest.json';

function ForceListMode({ children }: { children: ReactNode }): ReactElement {
  const settings = useContext(SettingsContext);

  return (
    <SettingsContext.Provider value={{ ...settings, insaneMode: true }}>
      {children}
    </SettingsContext.Provider>
  );
}

const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  'claude-code': 'Claude Code',
  generic: 'Any AI Tool',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  stretch: 'Stretch',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-accent-avocado-default',
  intermediate: 'bg-accent-cheese-default',
  stretch: 'bg-accent-onion-default',
};

const RESOURCE_TYPE_ICONS: Record<string, ReactElement> = {
  video: <PlayIcon size={IconSize.Small} className="text-text-tertiary" />,
  article: <DocsIcon size={IconSize.Small} className="text-text-tertiary" />,
  course: (
    <GraduationIcon size={IconSize.Small} className="text-text-tertiary" />
  ),
  docs: <BookmarkIcon size={IconSize.Small} className="text-text-tertiary" />,
};

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  course: 'Course',
  docs: 'Docs',
};

const PLATFORM_ICONS: Record<string, ReactElement> = {
  reddit: <RedditIcon size={IconSize.Small} className="text-text-tertiary" />,
  discord: <DiscordIcon size={IconSize.Small} className="text-text-tertiary" />,
  dailydev: (
    <GraduationIcon size={IconSize.Small} className="text-text-tertiary" />
  ),
  other: <EarthIcon size={IconSize.Small} className="text-text-tertiary" />,
};

const PLATFORM_LABELS: Record<string, string> = {
  dailydev: 'daily.dev',
  reddit: 'Reddit',
  discord: 'Discord',
  other: 'Web',
};

const DEFAULT_HOW_IT_WORKS: HowItWorksStep[] = [
  {
    title: 'Pick a free AI tool',
    subtitle: 'Cursor, Claude Code, or any tool you like — all work great',
  },
  {
    title: 'Copy a prompt below',
    subtitle:
      "Each prompt tells the AI exactly what to build — you don't need to know the syntax",
  },
  {
    title: 'Paste and watch it build',
    subtitle:
      'The AI writes the code, you see real results — then learn what it did and why',
  },
];

const DEFAULT_PREREQUISITES: string[] = [
  'A laptop or desktop computer',
  'About 30 minutes of free time',
  'One free AI tool (see recommendations below)',
  'Zero coding experience required',
];

const DEFAULT_TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    problem: "It broke and I don't know why",
    fix: 'Paste the full error into AI chat. Copy the exact error text, not a paraphrase. AI is exceptionally good at explaining what went wrong.',
  },
  {
    problem: "The code doesn't do what I expected",
    fix: 'Describe what you want vs what happened. Be specific: "I expected X but got Y" gets better results than "it\'s wrong."',
  },
  {
    problem: "I feel like I'm not actually learning",
    fix: "That's normal. Modify one thing in the AI-generated code yourself. Then another. Understanding comes from changing code, not just reading it.",
  },
  {
    problem: 'The AI keeps going in circles',
    fix: "Start fresh. Delete the broken code and re-prompt from scratch with a clearer description. Don't try to fix bad code forever.",
  },
  {
    problem: "I can't deploy it",
    fix: 'This is the hardest step for everyone. Follow the deployment prompt step by step and paste every error into AI chat.',
  },
];

const DEFAULT_LEARNING_RULE =
  'AI gets you to code faster. But understanding what it built is what makes you a developer. After each prompt, ask: "Explain this code to me line by line." That single habit is the difference between vibe coding and actually learning.';

const DEFAULT_SHIP_CTA = {
  title: 'You built it — now ship it',
  body: 'Deploy your project and share the link. Post what you built on daily.dev and tag it #LearnToCode — other beginners seeing "someone like me built this" is the most powerful motivation there is.',
};

interface LeafPageParams extends ParsedUrlQuery {
  slug: string[];
}

type LearnToCodeLeafProps = DynamicSeoProps & {
  pageData: LeafPageData;
};

function PromptCard({ prompt }: { prompt: Prompt }): ReactElement {
  const { displayToast } = useToastNotification();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.body);
    setCopied(true);
    displayToast('Prompt copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group/card rounded-24 border border-border-subtlest-tertiary bg-background-subtle transition-all duration-200 hover:border-border-subtlest-secondary hover:shadow-2">
      <div className="flex flex-col gap-4 p-6">
        {/* Header with step number and copy button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-float font-bold text-text-tertiary typo-callout">
              {prompt.step}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-bold text-text-primary typo-title3">
                {prompt.title}
              </span>
              {(prompt.difficulty || prompt.timeEstimate) && (
                <div className="flex items-center gap-2">
                  {prompt.difficulty && (
                    <span className="text-text-quaternary typo-caption1">
                      {DIFFICULTY_LABELS[prompt.difficulty]}
                    </span>
                  )}
                  {prompt.difficulty && prompt.timeEstimate && (
                    <span className="text-text-quaternary typo-caption1">
                      ·
                    </span>
                  )}
                  {prompt.timeEstimate && (
                    <span className="text-text-quaternary typo-caption1">
                      {prompt.timeEstimate}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <Button
            variant={copied ? ButtonVariant.Primary : ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<CopyIcon />}
            onClick={handleCopy}
            className={`shrink-0 ${
              copied
                ? 'bg-accent-avocado-default'
                : 'hover:shadow-1 transition-all duration-200'
            }`}
          >
            {copied ? 'Copied!' : 'Copy prompt'}
          </Button>
        </div>

        {/* The prompt text */}
        <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
          <p className="whitespace-pre-wrap text-text-secondary typo-body">
            {prompt.body}
          </p>
        </div>

        {/* Expected output */}
        {prompt.expectedOutput && (
          <div className="border-l-2 border-accent-avocado-default pl-4">
            <p className="text-text-tertiary typo-footnote">
              <span className="font-bold text-text-secondary">
                What you should see:
              </span>{' '}
              {prompt.expectedOutput}
            </p>
          </div>
        )}

        {/* Comprehension prompt */}
        {prompt.comprehensionPrompt && (
          <div className="border-l-2 border-accent-water-default pl-4">
            <p className="text-text-tertiary typo-footnote">
              <span className="font-bold text-text-secondary">
                Now understand it:
              </span>{' '}
              {prompt.comprehensionPrompt}
            </p>
          </div>
        )}

        {/* Challenge */}
        {prompt.challenge && (
          <div className="border-l-2 border-accent-onion-default pl-4">
            <p className="text-text-tertiary typo-footnote">
              <span className="font-bold text-text-secondary">
                Try it yourself:
              </span>{' '}
              {prompt.challenge}
            </p>
          </div>
        )}

        {/* Stuck tip */}
        {prompt.stuckTip && (
          <p className="text-text-quaternary typo-footnote">
            <span className="font-bold text-text-tertiary">Stuck?</span>{' '}
            {prompt.stuckTip}
          </p>
        )}

        {/* Tool compatibility tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-text-quaternary typo-caption1">
            Works with:
          </span>
          {prompt.tools.map((tool) => (
            <span
              key={tool}
              className="rounded-10 bg-surface-float px-2.5 py-1 text-text-quaternary typo-caption1"
            >
              {TOOL_LABELS[tool]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendedPathCard({
  path,
}: {
  path: RecommendedPath;
}): ReactElement {
  return (
    <Link href={`/learn-to-code/${path.slug}`}>
      <a className="group flex flex-col gap-2 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:shadow-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary typo-title3 group-hover:text-text-link">
            {path.title}
          </span>
          <ArrowIcon
            size={IconSize.Small}
            className="rotate-90 text-text-quaternary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-text-link"
          />
        </div>
        <p className="text-text-tertiary typo-body">{path.reason}</p>
      </a>
    </Link>
  );
}

const LearnToCodeLeaf = ({ pageData }: LearnToCodeLeafProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();
  const { user } = useContext(AuthContext);

  const feedTag = pageData?.tags?.[0];
  const isSubHub =
    pageData?.dimension === 'audience' && !!pageData?.recommendedPaths?.length;

  const feedVariables = useMemo(
    () => ({
      tag: feedTag,
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
      ],
      period: 30,
    }),
    [feedTag],
  );

  if (isLoading || !pageData) {
    return <></>;
  }

  const { pages } = manifest as Manifest;
  const relatedPages = pageData.relatedSlugs
    .map((slug) => pages.find((p) => p.slug === slug))
    .filter(Boolean);

  const howItWorks = pageData.howItWorks ?? DEFAULT_HOW_IT_WORKS;
  const prerequisites = pageData.prerequisites ?? DEFAULT_PREREQUISITES;
  const troubleshooting = pageData.troubleshooting ?? DEFAULT_TROUBLESHOOTING;
  const learningRule = pageData.learningRule ?? DEFAULT_LEARNING_RULE;
  const shipCta = pageData.shipCta ?? DEFAULT_SHIP_CTA;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://app.daily.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Learn to Code',
        item: 'https://app.daily.dev/learn-to-code',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: pageData.title,
        item: `https://app.daily.dev/learn-to-code/${pageData.slug}`,
      },
    ],
  };

  const pageLd = isSubHub
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageData.title,
        description: pageData.description,
        url: `https://app.daily.dev/learn-to-code/${pageData.slug}`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: pageData.recommendedPaths.map((path, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: path.title,
            url: `https://app.daily.dev/learn-to-code/${path.slug}`,
          })),
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `Learn ${pageData.title}`,
        description: pageData.description,
        url: `https://app.daily.dev/learn-to-code/${pageData.slug}`,
        step: (pageData.prompts || []).map((prompt) => ({
          '@type': 'HowToStep',
          position: prompt.step,
          name: prompt.title,
          text: prompt.body,
        })),
      };

  const jsonLd = [pageLd, breadcrumbLd];

  return (
    <div className="relative mx-auto flex w-full max-w-[69.25rem] flex-col">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <PageWrapperLayout className="py-6">
        <BreadCrumbs>
          <Link href="/learn-to-code">
            <a>
              <GraduationIcon size={IconSize.XSmall} secondary /> Learn to Code
            </a>
          </Link>
        </BreadCrumbs>

        {/* Hero */}
        <header className="mb-8 mt-8 flex flex-col gap-4 laptop:mt-10">
          <h1 className="font-bold text-text-primary typo-title1 laptop:typo-mega2">
            {pageData.title}
          </h1>
          <p className="max-w-2xl text-text-secondary typo-body laptop:typo-title3">
            {pageData.description}
          </p>
          {pageData.outcomes && pageData.outcomes.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              <span className="font-bold text-text-tertiary typo-footnote">
                After this path, you&apos;ll be able to:
              </span>
              <ul className="flex flex-col gap-1.5">
                {pageData.outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-start gap-2 text-text-secondary typo-callout"
                  >
                    <span className="mt-0.5 shrink-0 text-text-quaternary">
                      ✓
                    </span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* Leaf-page-only sections: How this works + What you need */}
        {!isSubHub && (
          <>
            <section className="mb-10 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6 laptop:p-8">
              <h2 className="mb-6 font-bold text-text-primary typo-title3">
                How this works
              </h2>
              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
                {howItWorks.map((step, index) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-cabbage-subtlest font-bold text-accent-cabbage-default typo-callout">
                      {index + 1}
                    </span>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="font-bold text-text-primary typo-callout">
                        {step.title}
                      </span>
                      <span className="text-text-quaternary typo-footnote">
                        {step.subtitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mb-10 grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <div className="rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6">
                <h3 className="mb-4 font-bold text-text-primary typo-callout">
                  What you need to start
                </h3>
                <ul className="flex flex-col gap-3">
                  {prerequisites.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-text-secondary typo-body"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-avocado-subtlest text-accent-avocado-default typo-caption2">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {pageData.projectDescription && (
                <div className="rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6">
                  <h3 className="mb-4 font-bold text-text-primary typo-callout">
                    What you&apos;ll build
                  </h3>
                  <p className="text-text-secondary typo-body">
                    {pageData.projectDescription}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Two-column layout: primary + sidebar */}
        <div className="flex flex-1 flex-col laptop:flex-row">
          {/* Primary column */}
          <div className="flex w-full min-w-0 flex-1 flex-col laptop:w-0 laptop:border-r laptop:border-border-subtlest-tertiary laptop:pr-8">
            {/* Sub-hub: Recommended paths */}
            {isSubHub && (
              <section>
                <div className="mb-6 flex items-start gap-3">
                  <ArrowIcon
                    size={IconSize.Medium}
                    className="shrink-0 rotate-90 text-text-tertiary"
                  />
                  <div className="flex-1">
                    <h2 className="font-bold text-text-primary typo-title2">
                      Recommended paths
                    </h2>
                    <p className="text-text-tertiary typo-footnote">
                      Curated learning paths that match your background. Pick
                      one and start building today.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {pageData.recommendedPaths.map((path) => (
                    <RecommendedPathCard key={path.slug} path={path} />
                  ))}
                </div>
              </section>
            )}

            {/* AI Learning Rule */}
            {!isSubHub && pageData.prompts && pageData.prompts.length > 0 && (
              <div className="mb-8 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-6">
                <p className="text-text-secondary typo-callout">
                  <span className="font-bold text-text-primary">
                    The #1 rule for learning with AI:
                  </span>{' '}
                  {learningRule}
                </p>
              </div>
            )}

            {/* Leaf page: Start Building — prompts */}
            {!isSubHub && pageData.prompts && pageData.prompts.length > 0 && (
              <section>
                <div className="mb-6 flex items-start gap-3">
                  <TerminalIcon
                    size={IconSize.Medium}
                    className="shrink-0 text-text-tertiary"
                  />
                  <div className="flex-1">
                    <h2 className="font-bold text-text-primary typo-title2">
                      Start building
                    </h2>
                    <p className="text-text-tertiary typo-footnote">
                      Copy these prompts into your AI coding tool — each step
                      builds on the last. Steps 1–2 are easy wins. Steps 3–5
                      will stretch you — that&apos;s where the real learning
                      happens.
                    </p>
                  </div>
                </div>

                {/* Difficulty progression bar */}
                <div
                  className="mb-6 flex items-center gap-1"
                  role="list"
                  aria-label="Step difficulty progression"
                >
                  {(pageData.prompts || []).map((prompt) => {
                    const difficulty = prompt.difficulty || 'beginner';

                    return (
                      <div
                        key={prompt.step}
                        role="listitem"
                        className="flex flex-1 flex-col items-center gap-1.5"
                        aria-label={`Step ${prompt.step}: ${DIFFICULTY_LABELS[difficulty]}`}
                      >
                        <div
                          className={`h-1 w-full rounded-full ${DIFFICULTY_COLORS[difficulty]}`}
                        />
                        <span className="text-text-quaternary typo-caption2">
                          {prompt.step}. {DIFFICULTY_LABELS[difficulty]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-5">
                  {pageData.prompts.map((prompt) => (
                    <PromptCard key={prompt.step} prompt={prompt} />
                  ))}
                </div>

                {/* Ship & Share CTA */}
                <div className="mt-8 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6">
                  <div className="flex items-start gap-3">
                    <ShareIcon
                      size={IconSize.Medium}
                      className="shrink-0 text-text-tertiary"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-text-primary typo-callout">
                        {shipCta.title}
                      </span>
                      <p className="text-text-tertiary typo-footnote">
                        {shipCta.body}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* When things go wrong */}
            {!isSubHub && (
              <section className="mt-14">
                <div className="mb-6 flex items-start gap-3">
                  <AlertIcon
                    size={IconSize.Medium}
                    className="shrink-0 text-text-tertiary"
                  />
                  <div className="flex-1">
                    <h2 className="font-bold text-text-primary typo-title2">
                      When things go wrong
                    </h2>
                    <p className="text-text-tertiary typo-footnote">
                      Getting stuck is normal — every developer does.
                      Here&apos;s how to get unstuck fast.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {troubleshooting.map((item) => (
                    <div
                      key={item.problem}
                      className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5 transition-all duration-200 hover:border-border-subtlest-secondary"
                    >
                      <h3 className="font-bold text-text-primary typo-callout">
                        &ldquo;{item.problem}&rdquo;
                      </h3>
                      <p className="mt-2 text-text-secondary typo-body">
                        {item.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AI tips */}
            {pageData.aiTips && pageData.aiTips.length > 0 && (
              <section className="mt-14">
                <div className="mb-6 flex items-start gap-3">
                  <SparkleIcon
                    size={IconSize.Medium}
                    className="shrink-0 text-text-tertiary"
                  />
                  <div className="flex-1">
                    <h2 className="font-bold text-text-primary typo-title2">
                      How to use AI effectively
                    </h2>
                    <p className="text-text-tertiary typo-footnote">
                      AI is a tutor, not a crutch — these tips help you actually
                      learn
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {pageData.aiTips.map((tip) => (
                    <div
                      key={tip}
                      className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5"
                    >
                      <p className="text-text-secondary typo-body">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Understand What You Built — concepts */}
            <section className="mt-14">
              <div className="mb-6 flex items-start gap-3">
                <GraduationIcon
                  size={IconSize.Medium}
                  className="shrink-0 text-text-tertiary"
                />
                <div className="flex-1">
                  <h2 className="font-bold text-text-primary typo-title2">
                    Understand what you built
                  </h2>
                  <p className="text-text-tertiary typo-footnote">
                    Key concepts behind the code — this turns copy-pasting into
                    real learning
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {pageData.concepts.map((concept, index) => (
                  <div
                    key={concept.name}
                    className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5 transition-all duration-200 hover:border-border-subtlest-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-float font-bold text-text-tertiary typo-caption1">
                        {index + 1}
                      </span>
                      <h3 className="font-bold text-text-primary typo-callout">
                        {concept.name}
                      </h3>
                    </div>
                    <p className="mt-2 pl-9 text-text-secondary typo-body">
                      {concept.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending feed */}
            {feedTag && (
              <section className="mt-14 pb-6">
                <div className="mb-6 flex items-center gap-3">
                  <UpvoteIcon
                    size={IconSize.Medium}
                    className="text-text-tertiary"
                  />
                  <h2 className="font-bold text-text-primary typo-title2">
                    Trending in {feedTag}
                  </h2>
                </div>
                <ForceListMode>
                  <ActiveFeedNameContext.Provider
                    value={{ feedName: OtherFeedPage.TagsMostUpvoted }}
                  >
                    <Feed
                      feedName={OtherFeedPage.TagsMostUpvoted}
                      feedQueryKey={[
                        'learnToCodeRelated',
                        user?.id ?? 'anonymous',
                        Object.values(feedVariables),
                      ]}
                      query={MOST_UPVOTED_FEED_QUERY}
                      variables={feedVariables}
                      className="!mx-0 !w-auto"
                      disableAds
                      disableListFrame
                      allowFetchMore={false}
                      pageSize={5}
                    />
                  </ActiveFeedNameContext.Provider>
                </ForceListMode>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex w-full flex-col gap-6 px-0 pt-8 laptop:w-[21.25rem] laptop:max-w-[21.25rem] laptop:px-4 laptop:pt-0">
            {/* Tools widget */}
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 font-bold text-text-primary typo-callout">
                <TerminalIcon
                  size={IconSize.Small}
                  className="text-text-tertiary"
                />
                Recommended tools
              </h3>
              {pageData.tools.map((tool) => (
                <a
                  key={tool.url}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary typo-footnote group-hover:text-text-link">
                      {tool.name}
                    </span>
                    <OpenLinkIcon
                      size={IconSize.XSmall}
                      className="text-text-quaternary"
                    />
                  </div>
                  <p className="text-text-tertiary typo-caption1">
                    {tool.description}
                  </p>
                </a>
              ))}
            </div>

            {/* Resources widget */}
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 font-bold text-text-primary typo-callout">
                <DocsIcon
                  size={IconSize.Small}
                  className="text-text-tertiary"
                />
                Go deeper
              </h3>
              {pageData.resources.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover"
                >
                  {RESOURCE_TYPE_ICONS[resource.type]}
                  <div className="flex flex-1 flex-col">
                    <span className="font-bold text-text-primary typo-footnote group-hover:text-text-link">
                      {resource.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-text-quaternary typo-caption2">
                        {RESOURCE_TYPE_LABELS[resource.type]}
                      </span>
                      {resource.free && (
                        <span className="text-text-quaternary typo-caption2">
                          · Free
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Communities widget */}
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 font-bold text-text-primary typo-callout">
                <EarthIcon
                  size={IconSize.Small}
                  className="text-text-tertiary"
                />
                Community
              </h3>
              {pageData.communities.map((community) => (
                <a
                  key={community.url}
                  href={community.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover"
                >
                  {PLATFORM_ICONS[community.platform]}
                  <div className="flex flex-col">
                    <span className="font-bold text-text-primary typo-footnote group-hover:text-text-link">
                      {community.name}
                    </span>
                    <span className="text-text-quaternary typo-caption2">
                      {PLATFORM_LABELS[community.platform]}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Related pages widget */}
            {relatedPages.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="font-bold text-text-primary typo-callout">
                  Continue learning
                </h3>
                {relatedPages.map((page) => (
                  <Link key={page.slug} href={`/learn-to-code/${page.slug}`}>
                    <a className="group flex items-center justify-between rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-hover">
                      <span className="font-bold text-text-primary typo-footnote group-hover:text-text-link">
                        {page.title}
                      </span>
                      <ArrowIcon
                        size={IconSize.XSmall}
                        className="rotate-90 text-text-quaternary"
                      />
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </PageWrapperLayout>
    </div>
  );
};

const getLeafPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

LearnToCodeLeaf.getLayout = getLeafPageLayout;
LearnToCodeLeaf.layoutProps = {
  screenCentered: false,
};
export default LearnToCodeLeaf;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const { pages } = manifest as Manifest;
  const paths = pages.map((page) => ({
    params: { slug: page.slug.split('/') },
  }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<LeafPageParams>): Promise<
  GetStaticPropsResult<LearnToCodeLeafProps>
> {
  const slugParts = params?.slug;
  if (!slugParts || slugParts.length === 0) {
    return { notFound: true, revalidate: 3600 };
  }

  const slug = slugParts.join('/');

  try {
    const dataModule = await import(`../../data/learn-to-code/${slug}.json`);
    const pageData = dataModule.default as LeafPageData;

    const seoTitles = getPageSeoTitles(
      `Learn ${pageData.title} with AI — Copy-Paste Prompts, Build Real Projects`,
    );

    return {
      props: {
        pageData,
        seo: {
          ...defaultSeo,
          ...seoTitles,
          openGraph: {
            ...defaultOpenGraph,
            ...seoTitles.openGraph,
          },
          description: pageData.description,
        } as NextSeoProps,
      },
      revalidate: 3600,
    };
  } catch {
    return { notFound: true, revalidate: 3600 };
  }
}
