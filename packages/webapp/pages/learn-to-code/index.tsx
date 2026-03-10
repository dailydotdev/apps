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
import type {
  HubData,
  IconKey,
  Manifest,
  ManifestEntry,
} from '../../data/learn-to-code/types';
import manifest from '../../data/learn-to-code/manifest.json';
import hubData from '../../data/learn-to-code/hub.json';

function ForceListMode({ children }: { children: ReactNode }): ReactElement {
  const settings = useContext(SettingsContext);

  return (
    <SettingsContext.Provider value={{ ...settings, insaneMode: true }}>
      {children}
    </SettingsContext.Provider>
  );
}

const ICON_MAP: Record<
  IconKey,
  (size: IconSize, className: string) => ReactElement
> = {
  sparkle: (size, className) => (
    <SparkleIcon size={size} className={className} />
  ),
  magic: (size, className) => <MagicIcon size={size} className={className} />,
  graduation: (size, className) => (
    <GraduationIcon size={size} className={className} />
  ),
  hammer: (size, className) => <HammerIcon size={size} className={className} />,
  star: (size, className) => <StarIcon size={size} className={className} />,
  trending: (size, className) => (
    <TrendingIcon size={size} className={className} />
  ),
  terminal: () => <></>,
  alert: () => <></>,
  share: () => <></>,
  upvote: (size, className) => <UpvoteIcon size={size} className={className} />,
};

const hub = hubData as HubData;

const seoTitles = getPageSeoTitles(hub.seo.title);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description: hub.seo.description,
};

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

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Learn to Code with AI',
      description: hub.seo.description,
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
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: hub.faq.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
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
      ],
    },
  ];

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

        {/* Hero */}
        <header className="mb-14 mt-8 flex flex-col gap-4 laptop:mt-10">
          <h1 className="bg-gradient-to-r from-text-primary via-accent-cabbage-bolder to-accent-onion-default bg-clip-text font-bold text-transparent typo-title1 laptop:typo-mega2">
            {hub.hero.heading}
          </h1>
          <p className="max-w-2xl text-text-secondary typo-body laptop:typo-title3">
            {hub.hero.subtitle}
          </p>
        </header>

        {/* Popular paths */}
        <section>
          <h2 className="mb-6 font-bold text-text-primary typo-title2">
            Popular paths
          </h2>
          <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
            {hub.popularPaths.map((item) => (
              <Link key={item.slug} href={`/learn-to-code/${item.slug}`}>
                <a className="group relative flex flex-col gap-3 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:shadow-2">
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-24 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                  />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-14 bg-surface-float">
                      {ICON_MAP[item.iconKey]?.(
                        IconSize.Large,
                        `text-${item.accentColor}`,
                      )}
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
        {hub.dimensions.order.map((dimension) => {
          const dimensionPages = pages.filter((p) => p.dimension === dimension);
          if (dimensionPages.length === 0) {
            return null;
          }

          const iconKey = hub.dimensions.icons[dimension];

          return (
            <section key={dimension} className="mt-14">
              <div className="mb-4 flex items-center gap-2">
                {iconKey &&
                  ICON_MAP[iconKey]?.(IconSize.Small, 'text-text-tertiary')}
                <h2 className="font-bold text-text-primary typo-title2">
                  {hub.dimensions.titles[dimension]}
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

        {/* FAQ */}
        <section className="mt-14 pb-6">
          <h2 className="mb-6 font-bold text-text-primary typo-title2">
            Common questions
          </h2>
          <div className="flex flex-col gap-3">
            {hub.faq.map((faq) => (
              <details
                key={faq.question}
                className="[&[open]]:shadow-1 group rounded-16 border border-border-subtlest-tertiary bg-background-subtle transition-all duration-200 hover:border-border-subtlest-secondary"
              >
                <summary className="cursor-pointer select-none px-6 py-5 font-bold text-text-primary typo-callout">
                  {faq.question}
                </summary>
                <p className="px-6 pb-5 text-text-secondary typo-body">
                  {faq.answer}
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
