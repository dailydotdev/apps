import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';
import { SquadGrid } from '@dailydotdev/shared/src/components/cards/squad/SquadGrid';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { FeedHeroCarousel } from '@dailydotdev/shared/src/components/feeds/hero/FeedHeroCarousel';
import { HighlightCardContent } from '@dailydotdev/shared/src/components/cards/highlight/common';
import { HighlightItem } from '@dailydotdev/shared/src/components/highlights/HighlightItem';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import { SquadPostListItem } from '@dailydotdev/shared/src/components/squads/SquadPostListItem';
import { BriefCardReady } from '@dailydotdev/shared/src/components/cards/brief/BriefCard/BriefCardReady';
import { BriefListItem } from '@dailydotdev/shared/src/components/brief/BriefListItem';
import { OpportunityMatchList } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityMatchList';
import { TagChip } from '@dailydotdev/shared/src/components/tags/TagChip';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import type { PostHighlightFeed } from '@dailydotdev/shared/src/graphql/highlights';
import type { OpportunityMatch } from '@dailydotdev/shared/src/features/opportunity/types';
import { OpportunityMatchStatus } from '@dailydotdev/shared/src/features/opportunity/types';
import { Origin, TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  adWithoutCta,
  cardHandlers,
  highlights,
} from '../../features/feed/feedHero.mocks';
import { sampleNotifications } from '../../components/notifications/_mock';
import { realAgentUpdates, realHeroPosts, realPosts } from '../realData';
import type { WidgetKind, WidgetSize } from './catalog';
import { widgetCatalog } from './catalog';
import { toneClass } from '../data';

const noop = (): void => undefined;

/* ------------------------------------------------------------------ */
/* Fixtures, shaped like production data                               */
/* ------------------------------------------------------------------ */

const briefPost: Post = {
  ...realPosts[0],
  id: 'brief-today',
  type: PostType.Brief,
  title: 'Presidential briefing',
  readTime: 4,
  createdAt: new Date().toISOString(),
  flags: {
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    posts: 41,
    sources: 18,
  },
} as Post;

const squad: Squad = {
  id: 'rust-builders',
  name: 'Rust Builders',
  handle: 'rustbuilders',
  permalink: 'https://app.daily.dev/squads/rustbuilders',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/placeholders/5',
  description:
    'Crates, compilers and the weekly roundup for people shipping Rust.',
  active: true,
  public: true,
  type: SourceType.Squad,
  membersCount: 12_400,
  memberPostingRole: SourceMemberRole.Member,
  memberInviteRole: SourceMemberRole.Member,
  members: { edges: [] },
} as unknown as Squad;

const agentHighlights: PostHighlightFeed[] = realAgentUpdates.map((update) => ({
  id: update.id,
  channel: 'vibes',
  headline: update.headline ?? update.change,
  highlightedAt: update.at,
  post: {
    id: update.id,
    type: PostType.Article,
    commentsPermalink: 'https://app.daily.dev/highlights/vibes',
    summary: update.change,
    source: { name: update.agent, image: update.image ?? '' },
  },
}));

const matches: OpportunityMatch[] = [
  {
    opportunityId: 'op-1',
    status: OpportunityMatchStatus.Pending,
    createdAt: new Date(),
    opportunity: {
      id: 'op-1',
      title: 'Senior Frontend Engineer',
      organization: {
        name: 'Vercel',
        image:
          'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/vercel',
      },
    },
  },
  {
    opportunityId: 'op-2',
    status: OpportunityMatchStatus.CandidateAccepted,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
    opportunity: {
      id: 'op-2',
      title: 'Staff Engineer, Platform',
      organization: {
        name: 'Supabase',
        image:
          'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/supabase',
      },
    },
  },
] as unknown as OpportunityMatch[];

const trendingTags = [
  'claude-code',
  'tanstack',
  'bun',
  'postgres',
  'rust',
  'nextjs',
  'ai-agents',
  'typescript',
];

/* ------------------------------------------------------------------ */
/* The shell: the one header and footer every widget shares            */
/* ------------------------------------------------------------------ */

const Shell = ({
  kind,
  children,
  footer,
  isFlush,
}: {
  kind: WidgetKind;
  children: ReactNode;
  footer?: string;
  /** Production rows bring their own inset (lists that bleed to the edge). */
  isFlush?: boolean;
}): ReactElement => {
  const def = widgetCatalog[kind];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header
        className="flex min-w-0 items-center gap-2"
        style={{ paddingRight: 'var(--stack-inset, 0px)' }}
      >
        <span
          className={classNames(
            'flex size-7 shrink-0 items-center justify-center rounded-8',
            toneClass[def.tone].subtle,
          )}
        >
          {def.icon(IconSize.Size16)}
        </span>
        <span className="truncate font-bold text-text-primary typo-footnote">
          {def.name}
        </span>
      </header>
      <div
        className={classNames(
          'relative mt-3 min-h-0 flex-1 overflow-hidden',
          isFlush && '-mx-4',
          // Production rows are taller than a widget; fade the cut instead of
          // slicing a row flat.
          '[mask-image:linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)]',
        )}
      >
        {children}
      </div>
      {footer && (
        <span className="mt-2 flex h-6 shrink-0 items-center font-bold text-text-tertiary typo-caption1 hover:text-text-primary">
          {footer} →
        </span>
      )}
    </div>
  );
};

/** Widgets whose production UI is itself a card: no shell, no second frame. */
export const isCardWidget = (kind: WidgetKind, size: WidgetSize): boolean =>
  size !== 's' &&
  ['featured', 'digest', 'squads', 'ad', 'briefing'].includes(kind);

const productionKinds: WidgetKind[] = [
  'featured',
  'digest',
  'ad',
  'squads',
  'briefing',
  'happening',
  'agents',
  'notifications',
  'bookmarks',
  'jobs',
  'trending',
];

/** Rendered from the production component, not from a sketch. */
export const hasProductionUI = (kind: WidgetKind): boolean =>
  productionKinds.includes(kind);

/** Features with no production UI yet: the shell over our own sketch. */
export const isNewFeature = (kind: WidgetKind): boolean =>
  [
    'podcast',
    'dms',
    'whatsnew',
    'arena',
    'events',
    'continue',
    'promo',
    'mybrief',
  ].includes(kind);

/* ------------------------------------------------------------------ */
/* Production content per widget                                       */
/* ------------------------------------------------------------------ */

const Fill = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex h-full min-h-0 flex-1 flex-col [&>*]:h-full [&>*]:min-h-0 [&>*]:flex-1">
    {children}
  </div>
);

/**
 * The real component behind each widget, or null when the feature has no
 * production UI yet and the catalog's sketch should be used.
 */
export const ProductionContent = ({
  kind,
  size,
}: {
  kind: WidgetKind;
  size: WidgetSize;
}): ReactElement | null => {
  switch (kind) {
    case 'featured':
      if (size === 'l') {
        return (
          <Fill>
            <FeedHeroCarousel
              posts={realHeroPosts}
              layout="wide"
              {...cardHandlers}
            />
          </Fill>
        );
      }
      if (size === 'm') {
        return (
          <Fill>
            <ArticleGrid post={realHeroPosts[0]} {...cardHandlers} />
          </Fill>
        );
      }
      return (
        <Shell kind={kind} isFlush>
          <div className="px-4">
            <SquadPostListItem post={realHeroPosts[0]} onLinkClick={noop} />
          </div>
        </Shell>
      );
    case 'digest':
      return (
        <Fill>
          <ArticleGrid post={realPosts[5]} {...cardHandlers} />
        </Fill>
      );
    case 'ad':
      return (
        <Fill>
          <AdGrid ad={adWithoutCta} index={0} feedIndex={0} />
        </Fill>
      );
    case 'squads':
      if (size === 's') {
        return (
          <Shell kind={kind}>
            <SquadList squad={squad} shouldShowCount />
          </Shell>
        );
      }
      return (
        <Fill>
          <SquadGrid source={squad} />
        </Fill>
      );
    case 'briefing':
      if (size === 's') {
        return (
          <Shell kind={kind}>
            <BriefListItem
              title="Presidential briefing"
              post={briefPost}
              readTime={4}
              postsCount={41}
              sourcesCount={18}
              origin={Origin.Feed}
              targetId={TargetId.Feed}
            />
          </Shell>
        );
      }
      return (
        <Fill>
          <BriefCardReady
            post={briefPost}
            title="Presidential briefing"
            targetId={TargetId.Feed}
          />
        </Fill>
      );
    case 'happening':
      return (
        <Shell kind={kind} footer="Read all" isFlush>
          {/* The production rows, with the card's own title and footer
              hidden: every widget shares the shell's header instead. */}
          <div className="flex h-full flex-col [&>div:last-child]:hidden [&>header]:hidden">
            <HighlightCardContent
              highlights={highlights}
              variant="grid"
              compact
            />
          </div>
        </Shell>
      );
    case 'agents':
      return (
        <Shell kind={kind} footer="View all" isFlush>
          <div className="flex flex-col">
            {agentHighlights.map((highlight, index) => (
              <HighlightItem
                key={highlight.id}
                highlight={highlight}
                defaultExpanded={size === 'l' && index === 0}
              />
            ))}
          </div>
        </Shell>
      );
    case 'notifications':
      return (
        <Shell kind={kind} footer="All notifications" isFlush>
          <div className="flex flex-col">
            {sampleNotifications.slice(0, 4).map((notification) => (
              <NotificationItem
                key={notification.referenceId}
                {...notification}
              />
            ))}
          </div>
        </Shell>
      );
    case 'bookmarks':
      return (
        <Shell kind={kind} footer="All bookmarks" isFlush>
          <div className="flex flex-col px-4">
            {[realPosts[3], realPosts[8], realPosts[11], realPosts[14]].map(
              (post) => (
                <SquadPostListItem
                  key={post.id}
                  post={post}
                  onLinkClick={noop}
                />
              ),
            )}
          </div>
        </Shell>
      );
    case 'jobs':
      return (
        <Shell kind={kind} footer="All jobs">
          <OpportunityMatchList matches={matches} title="" />
        </Shell>
      );
    case 'trending':
      return (
        <Shell kind={kind} footer="All tags">
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <TagChip key={tag} tag={tag} size="md" />
            ))}
          </div>
        </Shell>
      );
    default:
      return null;
  }
};
