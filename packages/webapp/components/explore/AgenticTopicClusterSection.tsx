import type { ReactElement } from 'react';
import React from 'react';
import { ChevronRight, Newspaper } from 'lucide-react';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { RelativeTime } from '@dailydotdev/shared/src/components/utilities/RelativeTime';
import { EXPLORE_CATEGORIES } from './exploreCategories';
import type { ExploreCategoryId } from './exploreCategories';
import type { ExploreStory } from './ExploreNewsLayout';

interface ClusterStory {
  id: string;
  publisher: string;
  publisherImage?: string;
  title: string;
  href: string;
  publishedAt?: string;
  readTimeMinutes?: number | null;
  comments: number;
  image?: string;
}

type TopicCluster = {
  id: string;
  topic: string;
  topicHref: string;
  featured: ClusterStory;
  related: ClusterStory[];
};

const TOPIC_CATEGORIES = (() => {
  const agenticIndex = EXPLORE_CATEGORIES.findIndex(
    (category) => category.id === 'agentic',
  );

  return EXPLORE_CATEGORIES.slice(agenticIndex + 1);
})();

const getStoryTitle = (story: ExploreStory): string =>
  story.title?.trim() ||
  story.sharedPost?.title?.trim() ||
  story.summary?.trim() ||
  'Untitled story';

const mapToClusterStory = (story: ExploreStory): ClusterStory => ({
  id: story.id,
  publisher:
    (story.source?.name === 'Community Picks' && story.author?.name) ||
    story.source?.name ||
    story.author?.name ||
    'Community',
  publisherImage:
    (story.source?.name === 'Community Picks'
      ? story.author?.image
      : story.source?.image) ||
    story.author?.image ||
    undefined,
  title: getStoryTitle(story),
  href: story.commentsPermalink,
  publishedAt: story.createdAt || undefined,
  readTimeMinutes: story.readTime ?? null,
  comments: story.numComments ?? 0,
  image: story.image || undefined,
});

const StoryMeta = ({
  publisher,
  publisherImage,
  publishedAt,
}: Pick<ClusterStory, 'publisher' | 'publisherImage' | 'publishedAt'>): ReactElement => (
  <p
    className="mt-2 flex items-center gap-1 text-text-tertiary typo-caption2"
    style={{ fontSize: '15px' }}
  >
    {publisherImage ? (
      <img
        src={publisherImage}
        alt={publisher}
        className="h-4 w-4 rounded-full object-cover"
      />
    ) : (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-float text-[10px] font-bold uppercase text-text-tertiary">
        {publisher.charAt(0)}
      </span>
    )}
    <span>{publisher}</span>
    {publishedAt && (
      <>
        <span aria-hidden>•</span>
        <RelativeTime dateTime={publishedAt} />
      </>
    )}
  </p>
);

const TopicClusterCard = ({ cluster }: { cluster: TopicCluster }): ReactElement => {
  return (
    <section
      id={`${cluster.id}-topic-cluster`}
      aria-labelledby={`${cluster.id}-topic-cluster-heading`}
      className="w-full border-b border-border-subtlest-tertiary p-3"
    >
      <header className="mb-4">
        <a
          href={cluster.topicHref}
          className="focus-visible-outline inline-flex items-center gap-2 rounded-8 text-text-primary transition-colors"
        >
          <h2
            id={`${cluster.id}-topic-cluster-heading`}
            className="font-bold typo-title3"
          >
            {cluster.topic}
          </h2>
        </a>
      </header>
      <div className="grid gap-4 laptop:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] laptop:gap-x-8">
        <article className="rounded-12 p-0">
          <a
            href={cluster.featured.href}
            className="focus-visible-outline group block rounded-12"
          >
            {cluster.featured.image ? (
              <img
                src={cluster.featured.image}
                alt={cluster.featured.title}
                className="h-52 w-full rounded-12 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="flex h-52 w-full items-center justify-center rounded-12 border border-border-subtlest-tertiary bg-surface-float text-text-tertiary typo-callout">
                No image available
              </div>
            )}
            <h3
              className="mt-2 text-text-primary typo-callout"
              style={{ fontSize: '17px' }}
            >
              {cluster.featured.title}
            </h3>
            <StoryMeta
              publisher={cluster.featured.publisher}
              publisherImage={cluster.featured.publisherImage}
              publishedAt={cluster.featured.publishedAt}
            />
          </a>
        </article>

        <div className="space-y-4 p-0">
          {cluster.related.map((story) => (
            <article key={story.id} className="p-0">
              <a
                href={story.href}
                className="focus-visible-outline group block rounded-8"
              >
                <h3
                  className="mt-1 text-text-primary transition-colors typo-callout"
                  style={{ fontSize: '17px' }}
                >
                  {story.title}
                </h3>
                <StoryMeta
                  publisher={story.publisher}
                  publisherImage={story.publisherImage}
                  publishedAt={story.publishedAt}
                />
              </a>
            </article>
          ))}
          <Button
            tag="a"
            variant={ButtonVariant.Float}
            href={cluster.topicHref}
            className="w-full"
          >
            <span className="inline-flex items-center gap-2">
              {`More ${cluster.topic} posts`}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

const AgenticTopicClusterSection = ({
  storiesByCategory,
}: {
  storiesByCategory?: Partial<Record<ExploreCategoryId, ExploreStory[]>>;
}): ReactElement => {
  const topicClusters = TOPIC_CATEGORIES.map((category) => {
    const categoryStories = storiesByCategory?.[category.id] ?? [];
    const mappedStories = categoryStories.map(mapToClusterStory);
    const featured = mappedStories[0] ?? {
      id: `${category.id}-featured-fallback`,
      publisher: `${category.label} Digest`,
      title: `Latest ${category.label} stories`,
      href: category.path,
      publishedAt: undefined,
      readTimeMinutes: 5,
      comments: 0,
      image: undefined,
    };
    const related = mappedStories.slice(1, 4);

    return {
      id: category.id,
      topic: category.label,
      topicHref: category.path,
      featured,
      related,
    };
  });

  return (
    <div className="flex w-full flex-col gap-6">
      {topicClusters.map((cluster) => (
        <TopicClusterCard key={cluster.id} cluster={cluster} />
      ))}
    </div>
  );
};

export default AgenticTopicClusterSection;
