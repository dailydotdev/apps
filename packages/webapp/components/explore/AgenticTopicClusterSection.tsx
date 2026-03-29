import type { ReactElement } from 'react';
import React from 'react';
import { ChevronRight, Clock3, MessageCircle, Newspaper } from 'lucide-react';

type ClusterStory = {
  id: string;
  publisher: string;
  title: string;
  href: string;
  publishedAt: string;
  readTimeMinutes: number;
  comments: number;
  image?: string;
};

const agenticCluster: {
  topic: string;
  topicHref: string;
  featured: ClusterStory;
  related: ClusterStory[];
} = {
  topic: 'Agentic',
  topicHref: '/explore/agentic',
  featured: {
    id: 'agentic-featured',
    publisher: 'Agentic Digest',
    title: 'How autonomous coding agents are reshaping engineering teams in 2026',
    href: '/posts/agentic-coding-teams-2026',
    publishedAt: '2h ago',
    readTimeMinutes: 7,
    comments: 24,
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/2b2d7af5ca82270ab09f580b2edfeb2f?_a=AQAEuop',
  },
  related: [
    {
      id: 'agentic-related-1',
      publisher: 'Builder Labs',
      title: 'What makes a reliable multi-agent workflow in production?',
      href: '/posts/reliable-multi-agent-workflow',
      publishedAt: '4h ago',
      readTimeMinutes: 5,
      comments: 12,
    },
    {
      id: 'agentic-related-2',
      publisher: 'PromptOps Weekly',
      title: 'The hidden cost of context windows in long-running agent sessions',
      href: '/posts/context-window-cost-agent-sessions',
      publishedAt: '7h ago',
      readTimeMinutes: 6,
      comments: 9,
    },
    {
      id: 'agentic-related-3',
      publisher: 'Infra Now',
      title: 'Observability patterns for autonomous code generation pipelines',
      href: '/posts/observability-agentic-pipelines',
      publishedAt: '11h ago',
      readTimeMinutes: 4,
      comments: 7,
    },
  ],
};

const StoryMeta = ({
  publishedAt,
  readTimeMinutes,
  comments,
}: Pick<ClusterStory, 'publishedAt' | 'readTimeMinutes' | 'comments'>): ReactElement => (
  <p className="mt-2 flex items-center gap-2 text-text-tertiary typo-caption2">
    <span>{publishedAt}</span>
    <span aria-hidden>•</span>
    <span className="inline-flex items-center gap-1">
      <Clock3 className="h-3.5 w-3.5" aria-hidden />
      {readTimeMinutes} min
    </span>
    <span aria-hidden>•</span>
    <span className="inline-flex items-center gap-1">
      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
      {comments}
    </span>
  </p>
);

const AgenticTopicClusterSection = (): ReactElement => {
  return (
    <section
      id="agentic-topic-cluster"
      aria-labelledby="agentic-topic-cluster-heading"
      className="rounded-20 border border-border-subtlest-tertiary bg-background-default p-4 laptop:p-5"
    >
      <header className="mb-4">
        <a
          href={agenticCluster.topicHref}
          className="focus-visible-outline inline-flex items-center gap-2 rounded-8 text-accent-blueCheese-default transition-colors hover:text-text-link"
        >
          <h2
            id="agentic-topic-cluster-heading"
            className="font-bold leading-tight typo-title2"
          >
            {agenticCluster.topic}
          </h2>
          <ChevronRight className="h-5 w-5" aria-hidden />
        </a>
      </header>

      <div className="grid gap-4 laptop:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] laptop:gap-x-8">
        <article className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
          <a
            href={agenticCluster.featured.href}
            className="focus-visible-outline group block rounded-12"
          >
            <img
              src={agenticCluster.featured.image}
              alt={agenticCluster.featured.title}
              className="h-52 w-full rounded-12 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <p className="mt-3 inline-flex items-center gap-1.5 text-text-tertiary typo-caption1">
              <Newspaper className="h-3.5 w-3.5" aria-hidden />
              {agenticCluster.featured.publisher}
            </p>
            <h3 className="mt-2 text-text-primary typo-title3">
              {agenticCluster.featured.title}
            </h3>
            <StoryMeta
              publishedAt={agenticCluster.featured.publishedAt}
              readTimeMinutes={agenticCluster.featured.readTimeMinutes}
              comments={agenticCluster.featured.comments}
            />
          </a>
        </article>

        <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-2">
          {agenticCluster.related.map((story, index) => (
            <article
              key={story.id}
              className={`rounded-12 p-2 ${
                index < agenticCluster.related.length - 1
                  ? 'border-b border-border-subtlest-tertiary'
                  : ''
              }`}
            >
              <a
                href={story.href}
                className="focus-visible-outline group block rounded-8"
              >
                <p className="text-text-tertiary typo-caption1">{story.publisher}</p>
                <h3 className="mt-1 text-text-primary transition-colors typo-callout group-hover:text-text-link">
                  {story.title}
                </h3>
                <StoryMeta
                  publishedAt={story.publishedAt}
                  readTimeMinutes={story.readTimeMinutes}
                  comments={story.comments}
                />
              </a>
            </article>
          ))}
        </div>
      </div>

      <footer className="mt-4">
        <a
          href={agenticCluster.topicHref}
          className="focus-visible-outline flex w-full items-center justify-center gap-2 rounded-full border border-border-subtlest-tertiary bg-surface-float px-4 py-2.5 font-bold text-text-primary transition-colors typo-callout hover:bg-surface-hover"
        >
          See more headlines and perspectives
          <ChevronRight className="h-4 w-4" aria-hidden />
        </a>
      </footer>
    </section>
  );
};

export default AgenticTopicClusterSection;
