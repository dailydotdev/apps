import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { FeedCardContext } from '@dailydotdev/shared/src/features/posts/FeedCardContext';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Author } from '@dailydotdev/shared/src/graphql/comments';
import { cardHandlers, highlights } from '../features/feed/feedHero.mocks';
import { sampleNotifications } from '../components/notifications/_mock';
import {
  realAgentUpdates,
  realHeroPosts,
  realPosts,
} from '../hero-cover/realData';
import { briefing } from '../hero-cover/widgets/briefing';
import { Scroll } from '../hero-cover/widgets/scroll';
import {
  Action,
  ArtworkBackdrop,
  ago,
  continuePost,
  LiveDot,
  messages,
  momentum,
  PlayButton,
  rowHoverClassName,
  podcastArt,
  ReadingProgress,
  savedPosts,
  Sparkline,
  squadPosts,
  Stack,
  trending,
  WidgetLabel,
} from '../hero-cover/widgets/production';
import { streakLadder, tierArt } from '../milestone-rewards/data';

/* ------------------------------------------------------------------ */
/* The promoted grammar                                                 */
/* ------------------------------------------------------------------ */

export type Brand = { name: string; logo?: string };

const allPosts = [...realPosts, ...realHeroPosts];
const brand = (name: string): Brand => ({
  name,
  logo:
    allPosts.find((post) => post.source?.name === name)?.source?.image ??
    realAgentUpdates.find((update) => update.agent === name)?.image,
});

export const brands = {
  motherDuck: brand('MotherDuck'),
  tigris: brand('Tigris'),
  wise: brand('Wise'),
  github: brand('GitHub Changelog'),
};

/**
 * The one mark every promoted item carries, in every widget: the brand's
 * logo and "Promoted by", in the quiet meta voice, where the item's own
 * meta would sit. The same words the feed's boosted cards use.
 */
export const PromotedBy = ({
  brand: by,
  className,
}: {
  brand: Brand;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex min-w-0 items-center gap-1 text-text-tertiary typo-caption1',
      className,
    )}
  >
    {by.logo && (
      <img src={by.logo} alt="" className="size-3.5 rounded-4 object-cover" />
    )}
    <span className="truncate">Promoted by {by.name}</span>
  </span>
);

type PromoItem = {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Set on the paid row: it gets the mark and a quiet surface of its own. */
  promotedBy?: Brand;
};

/**
 * A widget list with paid rows mixed in. A promoted row keeps the list's
 * own shape, so it reads as one more item, and sits on a faint surface with
 * the "Promoted by" mark in place of its meta, so it never passes as organic.
 */
const PromoList = ({ items }: { items: PromoItem[] }): ReactElement => (
  <ul className="flex flex-col gap-1">
    {items.map((item) => (
      <li
        key={item.id}
        className={classNames(
          '-mx-2 flex items-start gap-2.5 rounded-12 px-2 py-1.5',
          rowHoverClassName,
          item.promotedBy && 'bg-surface-float',
        )}
      >
        {item.leading}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
            {item.title}
          </span>
          {item.promotedBy ? (
            <PromotedBy brand={item.promotedBy} />
          ) : (
            item.meta && (
              <span className="truncate text-text-tertiary typo-caption1">
                {item.meta}
              </span>
            )
          )}
        </div>
        {item.trailing}
      </li>
    ))}
  </ul>
);

const Logo = ({
  src,
  isRound,
  className,
}: {
  src?: string;
  isRound?: boolean;
  className?: string;
}): ReactElement => (
  <img
    src={src}
    alt=""
    className={classNames(
      'shrink-0 object-cover',
      isRound ? 'rounded-max' : 'rounded-8',
      className ?? 'size-8',
    )}
  />
);

const Thumb = ({ src }: { src?: string }): ReactElement => (
  <img src={src} alt="" className="size-12 shrink-0 rounded-10 object-cover" />
);

const withPromoted = (
  items: PromoItem[],
  at: number,
  promoted: PromoItem,
): PromoItem[] => [...items.slice(0, at), promoted, ...items.slice(at)];

/* ------------------------------------------------------------------ */
/* One promoted variation per widget                                    */
/* ------------------------------------------------------------------ */

const asAuthor = (by: Brand): Author =>
  ({
    id: by.name,
    name: by.name,
    username: by.name.toLowerCase().replace(/\s+/g, ''),
    image: by.logo ?? '',
  } as Author);

/** A boosted post in the card's own production treatment. */
const Boosted = ({ post, by }: { post: Post; by: Brand }): ReactElement => (
  <FeedCardContext.Provider value={{ boostedBy: asAuthor(by) }}>
    <div className="flex h-full min-h-0 flex-1 flex-col [&>*]:h-full [&>*]:max-h-none [&>*]:min-h-0 [&>*]:flex-1">
      <ArticleGrid post={post} {...cardHandlers} />
    </div>
  </FeedCardContext.Provider>
);

export const PromotedTopStory = (): ReactElement => (
  <Boosted post={realPosts[9]} by={brands.motherDuck} />
);

export const PromotedDigest = (): ReactElement => (
  <Boosted post={realPosts[12]} by={brands.tigris} />
);

export const PromotedHappening = (): ReactElement => (
  <Stack>
    <WidgetLabel kind="happening" leading={<LiveDot />} link="Read all">
      Happening now
    </WidgetLabel>
    <Scroll>
      <PromoList
        items={withPromoted(
          highlights.map((item) => ({
            id: item.id,
            title: item.headline,
            meta: ago(item.highlightedAt),
          })),
          2,
          {
            id: 'promoted-happening',
            title: 'MotherDuck brings DuckDB to the browser, no server needed',
            promotedBy: brands.motherDuck,
          },
        )}
      />
    </Scroll>
  </Stack>
);

export const PromotedAgents = (): ReactElement => (
  <Stack>
    <WidgetLabel kind="agents" link="View all" />
    <Scroll>
      <PromoList
        items={withPromoted(
          realAgentUpdates.map((update) => ({
            id: update.id,
            leading: <Logo src={update.image} className="mt-0.5 size-6" />,
            title: update.headline,
            meta: update.agent,
          })),
          1,
          {
            id: 'promoted-agent',
            leading: (
              <Logo src={brands.github.logo} className="mt-0.5 size-6" />
            ),
            title: 'Copilot coding agent now opens pull requests from issues',
            promotedBy: brands.github,
          },
        )}
      />
    </Scroll>
  </Stack>
);

export const PromotedNotifications = (): ReactElement => {
  const rows = sampleNotifications
    .filter((notification) => notification.avatars?.[0]?.image)
    .slice(0, 6)
    .map((notification, index) => ({
      id: notification.referenceId ?? `${index}`,
      leading: (
        <Logo
          src={notification.avatars?.[0]?.image}
          isRound
          className="mt-0.5 size-8"
        />
      ),
      title: (
        <span
          className="font-normal [&_b]:font-bold"
          // Mock data shaped like the API's notification title HTML.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: notification.title }}
        />
      ),
      meta: notification.createdAt ? ago(notification.createdAt) : undefined,
    }));
  return (
    <Stack>
      <WidgetLabel
        kind="notifications"
        badge={4}
        isSquareBadge
        link="View all"
      />
      <Scroll>
        <PromoList
          items={withPromoted(rows, 2, {
            id: 'promoted-notification',
            leading: (
              <Logo src={brands.tigris.logo} className="mt-0.5 size-8" />
            ),
            title: (
              <span className="font-normal">
                <b className="font-bold">Tigris</b> invited you to its storage
                launch week
              </span>
            ),
            promotedBy: brands.tigris,
          })}
        />
      </Scroll>
    </Stack>
  );
};

export const PromotedMessages = (): ReactElement => (
  <Stack>
    <WidgetLabel kind="dms" badge={3} isSquareBadge link="Open" isLinkPrimary />
    <Scroll>
      <ul className="flex flex-col gap-3">
        <li className="-mx-2 flex items-start gap-2.5 rounded-12 bg-surface-float px-2 py-2">
          <Logo src={brands.wise.logo} className="size-8" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1">
              <span className="truncate font-bold text-text-primary typo-footnote">
                Wise
              </span>
              <ShieldCheckIcon
                size={IconSize.Size16}
                className="shrink-0 text-accent-water-default"
              />
            </span>
            <span className="line-clamp-2 text-text-primary typo-caption1">
              Paying contractors abroad? Your first transfer is on us.
            </span>
            <PromotedBy brand={brands.wise} className="mt-0.5" />
          </div>
        </li>
        {messages.map((message) => (
          <li key={message.from} className="flex items-start gap-2.5">
            <Logo src={message.avatar} isRound className="size-8" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span
                className={classNames(
                  'truncate text-text-primary typo-footnote',
                  message.isUnread && 'font-bold',
                )}
              >
                {message.from}
              </span>
              <span className="line-clamp-2 text-text-tertiary typo-caption1">
                {message.text}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Scroll>
  </Stack>
);

const postItem = (post: Post): PromoItem => ({
  id: post.id,
  title: post.title,
  meta: `${post.source?.name} · ${post.readTime}m read`,
  trailing: <Thumb src={post.image} />,
});

export const PromotedSquad = (): ReactElement => (
  <Stack>
    <WidgetLabel kind="squads" link="Open squad">
      Rust Builders
    </WidgetLabel>
    <Scroll>
      <PromoList
        items={withPromoted(squadPosts.map(postItem), 0, {
          ...postItem(realPosts[33]),
          id: 'promoted-squad-post',
          promotedBy: brands.wise,
        })}
      />
    </Scroll>
  </Stack>
);

export const PromotedReadingList = (): ReactElement => (
  <Stack>
    <WidgetLabel
      kind="bookmarks"
      afterName={
        <span className="font-bold tabular-nums text-text-tertiary typo-caption1">
          23
        </span>
      }
      link="View all"
    />
    <Scroll>
      <PromoList
        items={withPromoted(savedPosts.map(postItem), 2, {
          id: 'promoted-save',
          title: 'Why we moved our analytics to DuckDB',
          trailing: (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-10 bg-background-subtle text-text-primary">
              <BookmarkIcon size={IconSize.Small} />
            </span>
          ),
          promotedBy: brands.motherDuck,
        })}
      />
    </Scroll>
  </Stack>
);

/** A widget that is presented, not interrupted: the sponsor rides the header. */
const PresentedBy = ({ by }: { by: Brand }): ReactElement => (
  <span className="flex shrink-0 items-center gap-1 text-text-tertiary typo-caption1">
    <span>·</span>
    {by.logo && (
      <img src={by.logo} alt="" className="size-3.5 rounded-4 object-cover" />
    )}
    <span>{by.name}</span>
  </span>
);

export const PromotedBrief = (): ReactElement => (
  <Stack>
    <WidgetLabel
      kind="mybrief"
      afterName={<PresentedBy by={brands.motherDuck} />}
      link="Listen"
    >
      Your brief
    </WidgetLabel>
    <Scroll>
      <span className="mb-3 block font-bold text-text-primary typo-title3">
        {briefing.headline}
      </span>
      <PromoList
        items={withPromoted(
          briefing.stack.map((line) => ({
            id: line.text,
            title: <span className="font-normal">{line.text}</span>,
            meta: line.why,
          })),
          2,
          {
            id: 'promoted-brief-line',
            title: (
              <span className="font-normal">
                MotherDuck now runs DuckDB queries in your browser tab, free for
                side projects.
              </span>
            ),
            promotedBy: brands.motherDuck,
          },
        )}
      />
    </Scroll>
  </Stack>
);

export const PromotedPodcast = (): ReactElement => (
  <div className="relative -m-4 flex h-[calc(100%+2rem)] flex-col overflow-hidden rounded-16 p-4">
    <ArtworkBackdrop image={podcastArt} />
    <div className="relative flex h-full flex-col">
      <WidgetLabel kind="podcast" link="All episodes" isOnMedia />
      <img
        src={podcastArt}
        alt=""
        className="mx-auto mt-3 aspect-square w-3/4 rounded-12 object-cover shadow-3"
      />
      <span className="mt-4 line-clamp-2 font-bold text-white typo-callout">
        Ep. 42: Shipping production code with agents
      </span>
      <span className="mt-2 flex w-fit items-center gap-1.5 rounded-max bg-white/[0.16] py-0.5 pl-0.5 pr-2 text-white typo-caption1">
        {brands.tigris.logo && (
          <img
            src={brands.tigris.logo}
            alt=""
            className="size-4 rounded-max object-cover"
          />
        )}
        Sponsored by Tigris
      </span>
      <div className="mt-auto flex items-center gap-3 pt-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="relative h-1 rounded-max bg-white/[0.24]">
            <div className="h-full w-1/3 rounded-max bg-white" />
            {/* Where the host reads the sponsor, marked on the timeline. */}
            <span className="absolute -top-0.5 left-[58%] size-2 rounded-max bg-accent-cheese-default" />
          </div>
          <span className="tabular-nums text-white/[0.64] typo-caption1">
            25 min left · sponsor read at 22:10
          </span>
        </div>
        <PlayButton />
      </div>
    </div>
  </div>
);

export const PromotedTrending = (): ReactElement => {
  const [top, ...rest] = trending;
  const rows = rest.map((item, index) => ({ ...item, index: index + 1 }));
  return (
    <Stack>
      <WidgetLabel kind="trending" link="All tags" />
      <div className="relative -mx-4 mt-2 flex shrink-0 flex-col px-4 pb-16">
        <Sparkline
          values={momentum(0)}
          isArea
          className="absolute inset-x-0 bottom-0 h-24 w-full"
        />
        <span className="relative truncate font-bold text-text-primary typo-title2">
          #{top.tag}
        </span>
        <span className="relative mt-1 font-bold text-accent-avocado-default typo-title3">
          +{top.change}%
        </span>
      </div>
      <Scroll isUnderHeader={false} className="mt-0">
        <ol className="flex flex-col">
          {rows.slice(0, 1).map((item) => (
            <TickerRow key={item.tag} item={item} />
          ))}
          <li className="-mx-2 flex items-center gap-3 rounded-12 bg-surface-float px-2 py-2.5">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-bold text-text-primary typo-footnote">
                #duckdb
              </span>
              <PromotedBy brand={brands.motherDuck} />
            </div>
            <Logo src={brands.motherDuck.logo} className="size-6" />
          </li>
          {rows.slice(1).map((item) => (
            <TickerRow key={item.tag} item={item} />
          ))}
        </ol>
      </Scroll>
    </Stack>
  );
};

const TickerRow = ({
  item,
}: {
  item: (typeof trending)[number] & { index: number };
}): ReactElement => (
  <li className="flex items-center gap-3 border-t border-border-subtlest-tertiary py-3 tabular-nums first:border-t-0">
    <span className="min-w-0 flex-1 truncate font-bold text-text-primary typo-footnote">
      #{item.tag}
    </span>
    <Sparkline values={momentum(item.index)} className="h-5 w-14" />
    <span className="w-12 text-right font-bold text-accent-avocado-default typo-caption1">
      +{item.change}%
    </span>
  </li>
);

export const PromotedContinue = (): ReactElement => (
  <div className="relative -m-4 flex h-[calc(100%+2rem)] flex-col overflow-hidden rounded-16 p-4">
    <ArtworkBackdrop image={continuePost.image} />
    <div className="relative flex h-full min-h-0 flex-col">
      <WidgetLabel kind="continue" isOnMedia />
      <img
        src={continuePost.image}
        alt=""
        className="mt-3 aspect-video w-full rounded-12 object-cover shadow-3"
      />
      <span className="mt-3 line-clamp-2 font-bold text-white typo-callout">
        {continuePost.title}
      </span>
      <div className="mt-3 flex items-center gap-3">
        <ReadingProgress />
        <Action>Resume</Action>
      </div>
      {/* The finish line is where intent peaks: one paid "read next". */}
      <div className="mt-auto flex items-center gap-3 rounded-12 bg-white/[0.08] p-2.5">
        <img
          src={realPosts[14].image}
          alt=""
          className="size-10 shrink-0 rounded-8 object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-white/[0.64] typo-caption2">Read next</span>
          <span className="line-clamp-1 font-bold text-white typo-caption1">
            Ship .NET 11 to the edge in one command
          </span>
          <span className="flex items-center gap-1 text-white/[0.64] typo-caption2">
            {brands.tigris.logo && (
              <img
                src={brands.tigris.logo}
                alt=""
                className="size-3 rounded-4 object-cover"
              />
            )}
            Promoted by Tigris
          </span>
        </div>
      </div>
    </div>
  </div>
);

/** A sponsored quest: the brand pays for one of today's goals and its prize. */
export const PromotedStreak = (): ReactElement => {
  const tier =
    [...streakLadder].reverse().find((rung) => rung.day <= 849) ??
    streakLadder[0];
  return (
    <div className="relative -m-4 flex h-[calc(100%+2rem)] flex-col overflow-hidden rounded-16 p-4">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 100% at 80% 0%, rgba(236,82,122,0.38) 0%, rgba(236,82,122,0.22) 42%, rgba(15,18,24,0) 78%), linear-gradient(200deg, rgba(177,75,215,0.18) 0%, rgba(15,18,24,0) 60%)',
        }}
      />
      <div className="relative flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold tabular-nums leading-none text-text-primary typo-mega2">
              849
            </span>
            <span className="mt-1 font-bold text-accent-bacon-default typo-footnote">
              day streak · {tier.label}
            </span>
          </div>
          <img
            src={tierArt(tier.tier)}
            alt={tier.label}
            className="size-20 object-contain"
            style={{
              filter: 'drop-shadow(0 6px 18px rgba(236, 82, 122, 0.4))',
            }}
          />
        </div>
        <span className="text-text-quaternary typo-footnote">Daily quests</span>
        <div className="-mt-2 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-text-primary typo-footnote">
              Read 3 posts
            </span>
            <span className="text-text-tertiary typo-caption1">
              2 of 3 · 50 XP
            </span>
          </div>
          <div className="-mx-2 flex flex-col gap-2 rounded-12 bg-surface-float px-2 py-2.5">
            <div className="flex items-center gap-2.5">
              <Logo src={brands.motherDuck.logo} className="size-8" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold text-text-primary typo-footnote">
                  Read 2 posts tagged #duckdb
                </span>
                <span className="text-text-tertiary typo-caption1">
                  100 XP + a MotherDuck hoodie
                </span>
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-max bg-background-subtle">
              <div className="h-full w-1/2 rounded-max bg-gradient-to-r from-accent-bacon-default to-accent-cabbage-default" />
            </div>
            <PromotedBy brand={brands.motherDuck} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PromotedBriefing = (): ReactElement => (
  <Stack>
    <WidgetLabel
      kind="briefing"
      afterName={<PresentedBy by={brands.tigris} />}
      link="Read"
    >
      Presidential briefing
    </WidgetLabel>
    <Scroll>
      <span className="mb-3 block font-bold text-text-primary typo-title3">
        {briefing.headline}
      </span>
      <PromoList
        items={withPromoted(
          briefing.stack.slice(0, 4).map((line) => ({
            id: line.text,
            title: line.text,
            meta: line.why,
          })),
          3,
          {
            id: 'promoted-briefing',
            title: 'Tigris: S3-compatible storage that follows your users',
            promotedBy: brands.tigris,
          },
        )}
      />
    </Scroll>
  </Stack>
);
