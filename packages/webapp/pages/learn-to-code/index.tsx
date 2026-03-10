import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo } from 'react';
import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { BreadCrumbs } from '@dailydotdev/shared/src/components/header/BreadCrumbs';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { GraduationIcon } from '@dailydotdev/shared/src/components/icons/Graduation';
import { HammerIcon } from '@dailydotdev/shared/src/components/icons/Hammer';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { TrendingIcon } from '@dailydotdev/shared/src/components/icons/Trending';
import { StarIcon } from '@dailydotdev/shared/src/components/icons/Star';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { MOST_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import type { Manifest, ManifestEntry } from '../../data/learn-to-code/types';
import manifest from '../../data/learn-to-code/manifest.json';

function ForceListMode({ children }: { children: ReactNode }): ReactElement {
  const settings = useContext(SettingsContext);

  return (
    <SettingsContext.Provider value={{ ...settings, insaneMode: true }}>
      {children}
    </SettingsContext.Provider>
  );
}

const seoDescription =
  'Learn to code in the AI era. Curated resources, ready-to-use prompts for AI coding tools, and real developer community — everything you need to start building.';

const seoTitles = getPageSeoTitles(
  'Learn to Code — Prompts, Resources & Community',
);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description: seoDescription,
};

const DIMENSION_ICONS: Record<string, ReactElement> = {
  usecase: <HammerIcon size={IconSize.Small} className="text-text-tertiary" />,
  language: (
    <GraduationIcon size={IconSize.Small} className="text-text-tertiary" />
  ),
  technique: (
    <SparkleIcon size={IconSize.Small} className="text-text-tertiary" />
  ),
  audience: <MagicIcon size={IconSize.Small} className="text-text-tertiary" />,
  goal: <StarIcon size={IconSize.Small} className="text-text-tertiary" />,
};

const DIMENSION_ORDER: string[] = [
  'language',
  'usecase',
  'audience',
  'technique',
  'goal',
];

const DIMENSION_SECTION_TITLES: Record<string, string> = {
  language: 'By language',
  usecase: 'By project',
  audience: 'By audience',
  technique: 'By technique',
  goal: 'By goal',
};

const USE_CASES = [
  {
    title: 'Build a Todo App',
    slug: 'build/todo-app',
    subtitle:
      'A classic first project — simple enough to finish today, real enough to learn from.',
    gradient: 'from-accent-cabbage-default/20 to-accent-onion-default/10',
    iconColor: 'text-accent-cabbage-default',
    icon: (
      <HammerIcon
        size={IconSize.Large}
        className="text-accent-cabbage-default"
      />
    ),
  },
  {
    title: 'Automate Your Tasks',
    slug: 'automate-your-workflow',
    subtitle:
      'Stop doing repetitive work manually. Let code handle the boring parts.',
    gradient: 'from-accent-water-default/20 to-accent-blueCheese-default/10',
    iconColor: 'text-accent-water-default',
    icon: (
      <MagicIcon size={IconSize.Large} className="text-accent-water-default" />
    ),
  },
  {
    title: 'Learn Python',
    slug: 'python',
    subtitle:
      'The most beginner-friendly language. Great for data, automation, and AI.',
    gradient: 'from-accent-cheese-default/20 to-accent-avocado-default/10',
    iconColor: 'text-accent-cheese-default',
    icon: (
      <GraduationIcon
        size={IconSize.Large}
        className="text-accent-cheese-default"
      />
    ),
  },
  {
    title: 'Try Vibe Coding',
    slug: 'vibe-coding',
    subtitle:
      'Describe what you want, AI builds it. The fastest path from idea to app.',
    gradient: 'from-accent-onion-default/20 to-accent-bacon-default/10',
    iconColor: 'text-accent-onion-default',
    icon: (
      <SparkleIcon
        size={IconSize.Large}
        className="text-accent-onion-default"
      />
    ),
  },
];

type LearnToCodeHubProps = {
  pages: ManifestEntry[];
};

const LearnToCodeHub = ({ pages }: LearnToCodeHubProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();
  const { user } = useContext(AuthContext);

  const feedVariables = useMemo(
    () => ({
      tag: 'beginners',
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
      ],
      period: 30,
    }),
    [],
  );

  if (isLoading) {
    return <></>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Learn to Code',
    description: seoDescription,
    url: 'https://app.daily.dev/learn-to-code',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: pages.map((page, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: page.title,
        url: `https://app.daily.dev/learn-to-code/${page.slug}`,
      })),
    },
  };

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col">
      {/* Ambient gradient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow bg-accent-cabbage-default/[0.07] absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-3xl" />
        <div className="animate-float-slow-reverse bg-accent-onion-default/[0.06] absolute -right-32 top-20 h-80 w-80 rounded-full blur-3xl" />
        <div className="animate-float-slow-delayed bg-accent-water-default/[0.05] absolute -bottom-20 left-1/4 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <PageWrapperLayout className="py-6">
        <BreadCrumbs>
          <GraduationIcon size={IconSize.XSmall} secondary /> Learn to Code
        </BreadCrumbs>

        {/* Hero — warm, inviting, big text */}
        <header className="mb-14 mt-8 flex flex-col gap-4 laptop:mt-10">
          <h1 className="bg-gradient-to-r from-text-primary via-accent-cabbage-bolder to-accent-onion-default bg-clip-text font-bold text-transparent typo-title1 laptop:typo-mega2">
            Learn to code in the AI era
          </h1>
          <p className="max-w-2xl text-text-secondary typo-body laptop:typo-title3">
            Curated resources, ready-to-use prompts, and a real developer
            community. Pick what you want to build and start coding in minutes —
            no experience needed.
          </p>
        </header>

        {/* Popular paths — large, visual cards */}
        <section>
          <h2 className="mb-6 font-bold text-text-primary typo-title2">
            Popular paths
          </h2>
          <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
            {USE_CASES.map((item) => (
              <Link key={item.slug} href={`/learn-to-code/${item.slug}`}>
                <a className="group relative flex flex-col gap-3 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:shadow-2">
                  {/* Gradient glow on hover */}
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-24 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                  />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-14 bg-surface-float">
                      {item.icon}
                    </div>
                    <span className="font-bold text-text-primary typo-title3 group-hover:text-text-link">
                      {item.title}
                    </span>
                  </div>
                  <p className="relative text-text-tertiary typo-body">
                    {item.subtitle}
                  </p>
                  <div className="relative mt-1 flex items-center gap-1 text-text-quaternary transition-colors group-hover:text-text-link">
                    <span className="typo-callout">Get started</span>
                    <ArrowIcon
                      size={IconSize.XSmall}
                      className="rotate-90 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </section>

        {/* All paths grouped by dimension */}
        {DIMENSION_ORDER.map((dimension) => {
          const dimensionPages = pages.filter((p) => p.dimension === dimension);
          if (dimensionPages.length === 0) {
            return null;
          }

          return (
            <section key={dimension} className="mt-14">
              <div className="mb-4 flex items-center gap-2">
                {DIMENSION_ICONS[dimension]}
                <h2 className="font-bold text-text-primary typo-title2">
                  {DIMENSION_SECTION_TITLES[dimension]}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-0 tablet:grid-cols-2 tablet:gap-4 laptopXL:grid-cols-3">
                {dimensionPages.map((page) => (
                  <Link key={page.slug} href={`/learn-to-code/${page.slug}`}>
                    <a className="group flex items-center gap-3 border-b border-border-subtlest-tertiary p-4 transition-colors hover:bg-surface-hover tablet:rounded-12 tablet:border tablet:bg-surface-float">
                      <div className="flex flex-1 flex-col">
                        <span className="font-bold text-text-primary typo-callout group-hover:text-text-link">
                          {page.title}
                        </span>
                      </div>
                      <ArrowIcon
                        size={IconSize.XSmall}
                        className="rotate-90 text-text-quaternary transition-colors group-hover:text-text-link"
                      />
                    </a>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Trending on daily.dev */}
        <section className="mt-14">
          <div className="mb-6 flex items-center gap-2">
            <TrendingIcon
              size={IconSize.Medium}
              className="text-text-tertiary"
            />
            <h2 className="font-bold text-text-primary typo-title2">
              Trending for beginners
            </h2>
          </div>
          <ForceListMode>
            <ActiveFeedNameContext.Provider
              value={{ feedName: OtherFeedPage.ExploreUpvoted }}
            >
              <Feed
                feedName={OtherFeedPage.ExploreUpvoted}
                feedQueryKey={[
                  'learnToCodeTrending',
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

        {/* Most upvoted programming content */}
        <section className="mt-14">
          <div className="mb-6 flex items-center gap-2">
            <UpvoteIcon size={IconSize.Medium} className="text-text-tertiary" />
            <h2 className="font-bold text-text-primary typo-title2">
              Most upvoted programming posts
            </h2>
          </div>
          <ForceListMode>
            <ActiveFeedNameContext.Provider
              value={{ feedName: OtherFeedPage.ExploreUpvoted }}
            >
              <Feed
                feedName={OtherFeedPage.ExploreUpvoted}
                feedQueryKey={[
                  'learnToCodeUpvoted',
                  user?.id ?? 'anonymous',
                  'programming',
                  30,
                ]}
                query={MOST_UPVOTED_FEED_QUERY}
                variables={{
                  tag: 'programming',
                  supportedTypes: [
                    PostType.Article,
                    PostType.VideoYouTube,
                    PostType.Collection,
                  ],
                  period: 30,
                }}
                className="!mx-0 !w-auto"
                disableAds
                disableListFrame
                allowFetchMore={false}
                pageSize={5}
              />
            </ActiveFeedNameContext.Provider>
          </ForceListMode>
        </section>

        {/* FAQ — approachable, expandable cards */}
        <section className="mt-14 pb-6">
          <h2 className="mb-6 font-bold text-text-primary typo-title2">
            Common questions
          </h2>
          <div className="flex flex-col gap-3">
            {[
              {
                q: 'Is it too late to learn to code in 2026?',
                a: "No — it's actually the best time. AI coding tools have dramatically lowered the barrier to entry. You can build real applications by describing what you want in plain English, and learn the underlying concepts as you go.",
              },
              {
                q: 'Should I learn to code or just use AI?',
                a: 'Both. Use AI to build things fast, then learn the concepts behind what it built. Understanding code gives you a lasting edge — you can debug problems, make better architectural decisions, and push AI tools further.',
              },
              {
                q: 'What programming language should I learn first?',
                a: "Python if you want to automate tasks and work with data. JavaScript if you want to build websites and web apps. Both are beginner-friendly and have massive communities. Don't overthink it — the concepts transfer between languages.",
              },
              {
                q: 'Can I learn to code for free?',
                a: 'Yes. freeCodeCamp, The Odin Project, Python.org, and JavaScript.info are all free and excellent. Pair them with a free tier of an AI coding tool like Cursor or Replit and you have everything you need.',
              },
              {
                q: 'What is vibe coding?',
                a: "Vibe coding means building software by describing what you want in natural language and letting AI write the code. Coined by Andrej Karpathy, it's become a popular way for beginners and non-developers to build real applications.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="[&[open]]:shadow-1 group rounded-16 border border-border-subtlest-tertiary bg-background-subtle transition-all duration-200 hover:border-border-subtlest-secondary"
              >
                <summary className="cursor-pointer select-none px-6 py-5 font-bold text-text-primary typo-callout">
                  {faq.q}
                </summary>
                <p className="px-6 pb-5 text-text-secondary typo-body">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </PageWrapperLayout>
    </div>
  );
};

const getLearnToCodeLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

LearnToCodeHub.getLayout = getLearnToCodeLayout;
LearnToCodeHub.layoutProps = {
  screenCentered: false,
  seo,
};
export default LearnToCodeHub;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<LearnToCodeHubProps>
> {
  const { pages } = manifest as Manifest;

  return {
    props: { pages },
    revalidate: 300,
  };
}
