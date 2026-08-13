import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  pageBorders,
  ResponsivePageContainer,
} from '@dailydotdev/shared/src/components/utilities';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { defaultOpenGraph } from '../../next-seo';
import { WorldIndexCard } from '../../components/world/WorldIndexCard';
import type {
  WorldNicheSummary,
  WorldRankEntry,
} from '../../graphql/worldIndex';
import { WorldRankPeriod } from '../../graphql/worldIndex';
import type { WorldCategory } from '../../components/world/worldIndexTaxonomy';
import { topicsOfCategory } from '../../components/world/worldIndexTaxonomy';
import {
  useFollowedWorlds,
  useWorldCatalogue,
  useWorldRecentLevelUps,
  useWorldTopicRankPosition,
  useWorldTopicRanking,
} from '../../components/world/useWorldIndex';

const seoTitles = getPageSeoTitles('Worlds');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Reading builds your world. See who reads the same topics you do.',
};

const RANKING_LIMIT = 10;
const SECTION_LIMIT = 8;

interface SectionHeaderProps {
  title: string;
  description: string;
  action?: ReactElement;
}

const SectionHeader = ({
  title,
  description,
  action,
}: SectionHeaderProps): ReactElement => (
  <div className="flex flex-col gap-2 laptop:flex-row laptop:items-end laptop:justify-between">
    <div className="flex flex-col gap-1">
      <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-2xl"
      >
        {description}
      </Typography>
    </div>
    {action}
  </div>
);

interface LadderRowProps {
  rank: number;
  user: WorldRankEntry['user'];
  worldName: string | null;
  articles: number;
  level: number;
  accent: string;
  accentBg: string;
  max: number;
  isOwn?: boolean;
  /** True where the ranking skips, so the jump is drawn instead of implied. */
  afterGap?: boolean;
}

const LadderRow = ({
  rank,
  user,
  worldName,
  articles,
  level,
  accent,
  accentBg,
  max,
  isOwn,
  afterGap,
}: LadderRowProps): ReactElement => (
  <>
    {afterGap && (
      <li
        aria-hidden
        role="presentation"
        className="px-2 text-text-quaternary typo-caption1"
      >
        ···
      </li>
    )}
    {/* The viewer's row is marked with the topic's own colour and full-contrast
        text rather than a grey fill: a tint dark enough to see behind a row is
        a tint that drags the text on it below contrast in one of the themes. */}
    <li
      className={classNames('rounded-10', isOwn && 'border-l-2')}
      style={isOwn ? { borderLeftColor: accent } : undefined}
    >
      <Link href={`/world/${user.username}`} passHref prefetch={false}>
        <a
          className={classNames(
            'flex items-center gap-3 rounded-10 py-2 pr-2',
            isOwn ? 'pl-1.5' : 'pl-2 hover:bg-surface-hover',
          )}
        >
          <Typography
            type={TypographyType.Callout}
            bold
            color={isOwn ? TypographyColor.Primary : TypographyColor.Quaternary}
            className="inline-flex w-8 shrink-0 justify-center tabular-nums"
          >
            {rank}
          </Typography>

          <ProfilePicture
            user={user}
            size={ProfileImageSize.Medium}
            nativeLazyLoading
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Typography type={TypographyType.Footnote} bold truncate>
              {user.name}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              truncate
            >
              {worldName ?? `@${user.username}`}
            </Typography>
          </div>

          <div className="hidden w-36 shrink-0 items-center gap-2 laptop:flex">
            <ProgressBar
              percentage={max ? Math.round((articles / max) * 100) : 0}
              shouldShowBg
              className={{
                wrapper: 'h-1.5 flex-1 rounded-8',
                bar: 'h-1.5 rounded-8',
                barColor: accentBg,
              }}
            />
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="w-10 shrink-0 text-right tabular-nums"
            >
              {articles.toLocaleString()}
            </Typography>
          </div>

          {/* Fixed width, or a two-digit level makes this badge wider than a
              one-digit one and every column to its left starts somewhere
              different from the row above. */}
          <Typography
            type={TypographyType.Caption1}
            bold
            color={TypographyColor.Tertiary}
            className="w-14 shrink-0 rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-center tabular-nums"
          >
            Lv {level}
          </Typography>
        </a>
      </Link>
    </li>
  </>
);

const RowsPlaceholder = ({ rows }: { rows: number }): ReactElement => (
  <div className="flex flex-col gap-2 p-2">
    {Array.from({ length: rows }, (_, index) => (
      <ElementPlaceholder key={index} className="h-11 w-full rounded-10" />
    ))}
  </div>
);

const CardsPlaceholder = ({ cards }: { cards: number }): ReactElement => (
  <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
    {Array.from({ length: cards }, (_, index) => (
      <ElementPlaceholder key={index} className="h-44 w-full rounded-16" />
    ))}
  </div>
);

function WorldIndexPage(): ReactElement {
  const { isV2 } = useLayoutVariant();
  const { user, isLoggedIn } = useAuthContext();
  const {
    bySlug,
    categories,
    isPending: isCataloguePending,
  } = useWorldCatalogue();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [topicSlug, setTopicSlug] = useState<string | null>(null);
  const [period, setPeriod] = useState<WorldRankPeriod>(WorldRankPeriod.Week);

  const category = useMemo(
    () => categories.find((item) => item.id === categoryId) ?? categories[0],
    [categories, categoryId],
  );
  const topics = useMemo(
    () => (category ? topicsOfCategory(category, bySlug) : []),
    [category, bySlug],
  );
  const topic = useMemo(
    () => topics.find((item) => item.slug === topicSlug) ?? topics[0],
    [topics, topicSlug],
  );

  /* The catalogue arrives after the first render, so the opening topic is
     settled once it lands rather than guessed from a slug that may not exist. */
  useEffect(() => {
    if (!categoryId && categories.length) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const { entries, isPending: isRankingPending } = useWorldTopicRanking({
    nicheId: topic?.id,
    period,
    limit: RANKING_LIMIT,
  });
  const position = useWorldTopicRankPosition({ nicheId: topic?.id, period });
  const { items: levelUps, isPending: isLevelUpsPending } =
    useWorldRecentLevelUps(SECTION_LIMIT);
  const { items: followed, isPending: isFollowedPending } =
    useFollowedWorlds(SECTION_LIMIT);

  const maxArticles = entries.length ? entries[0].articles : 0;
  const isOwnRanked = entries.some((entry) => entry.user.id === user?.id);
  /* Only when the ranking's page does not already hold the viewer, and only
     when the ranking states a placing for them at all. */
  const ownRow =
    isLoggedIn && user && position?.rank != null && !isOwnRanked
      ? {
          rank: position.rank,
          articles: position.articles,
          level: position.level,
          user,
        }
      : null;

  const onCategoryChange = (next: WorldCategory): void => {
    setCategoryId(next.id);
    setTopicSlug(null);
  };

  const rankingDescription =
    period === WorldRankPeriod.Week
      ? `Ranked by ${
          topic?.title ?? 'topic'
        } articles read in the last seven days. The count starts over every week, so a good week is enough to place.`
      : `Ranked by every ${
          topic?.title ?? 'topic'
        } article read. Someone who only reads one topic can beat someone who reads a bit of everything.`;

  return (
    <>
      {isV2 && <PageHeader title="Worlds" />}
      <div className="mx-auto w-full max-w-[72rem]">
        {!isV2 && (
          <LayoutHeader
            className={classNames('!mb-0 gap-2 border-b px-4', pageBorders)}
          >
            <Typography type={TypographyType.Title3} bold className="flex-1">
              Worlds
            </Typography>
          </LayoutHeader>
        )}

        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-8 pb-10">
          {/* ---------- pick a topic ---------- */}
          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Browse by category"
              description="Six categories, forty topics. Pick one to see who reads it most."
            />

            {isCataloguePending ? (
              <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3 laptop:grid-cols-6">
                {Array.from({ length: 6 }, (_, index) => (
                  <ElementPlaceholder
                    key={index}
                    className="h-24 w-full rounded-12"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3 laptop:grid-cols-6">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === category?.id}
                    onClick={() => onCategoryChange(item)}
                    className={classNames(
                      'flex flex-col gap-2 rounded-12 border p-3 text-left transition-colors',
                      item.id === category?.id
                        ? 'border-border-subtlest-secondary bg-surface-float'
                        : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
                    )}
                  >
                    <span
                      className="h-1 w-full rounded-6"
                      style={{ backgroundColor: item.accent }}
                    />
                    <Typography type={TypographyType.Footnote} bold>
                      {item.name}
                    </Typography>
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Quaternary}
                    >
                      {item.worldName}
                    </Typography>
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Tertiary}
                      className="mt-auto tabular-nums"
                    >
                      {item.topics.filter((slug) => bySlug.has(slug)).length}{' '}
                      topics
                    </Typography>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ---------- the ranking ---------- */}
          <section className="flex flex-col gap-4">
            <SectionHeader
              title={topic ? `Top in ${topic.title}` : 'Top readers'}
              description={rankingDescription}
              action={
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                    pressed={period === WorldRankPeriod.Week}
                    onClick={() => setPeriod(WorldRankPeriod.Week)}
                  >
                    This week
                  </Button>
                  <Button
                    type="button"
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                    pressed={period === WorldRankPeriod.All}
                    onClick={() => setPeriod(WorldRankPeriod.All)}
                  >
                    All time
                  </Button>
                </div>
              }
            />

            <div className="flex gap-2 overflow-x-auto pb-1">
              {topics.map((item: WorldNicheSummary) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
                  pressed={item.id === topic?.id}
                  onClick={() => setTopicSlug(item.slug)}
                  className="shrink-0"
                >
                  {item.title}
                </Button>
              ))}
            </div>

            <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float">
              <div className="flex flex-wrap items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-3">
                <Typography type={TypographyType.Footnote} bold>
                  {topic?.title ?? ''}
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  in {category?.name ?? ''}
                </Typography>
                {/* An all-time count whichever period is showing, because it
                    is the only one the API keeps. Said plainly, so it does not
                    read as a weekly number that never moves. */}
                {!!topic && (
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="ml-auto tabular-nums"
                  >
                    {topic.readers.toLocaleString()} readers all time
                  </Typography>
                )}
              </div>

              {isRankingPending || isCataloguePending ? (
                <RowsPlaceholder rows={6} />
              ) : (
                <ol className="flex flex-col gap-0.5 p-2">
                  {entries.map((entry) => (
                    <LadderRow
                      key={entry.user.id}
                      rank={entry.rank}
                      user={entry.user}
                      worldName={entry.worldName}
                      articles={entry.articles}
                      level={entry.level}
                      accent={category?.accent ?? ''}
                      accentBg={category?.accentBg ?? ''}
                      max={maxArticles}
                      isOwn={entry.user.id === user?.id}
                    />
                  ))}

                  {!!ownRow && (
                    <LadderRow
                      rank={ownRow.rank}
                      user={ownRow.user}
                      worldName={null}
                      articles={ownRow.articles}
                      level={ownRow.level}
                      accent={category?.accent ?? ''}
                      accentBg={category?.accentBg ?? ''}
                      max={maxArticles}
                      isOwn
                      afterGap
                    />
                  )}

                  {!entries.length && (
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Tertiary}
                      className="px-2 py-6 text-center"
                    >
                      Nobody has read enough of this topic yet. Be the first.
                    </Typography>
                  )}
                </ol>
              )}
            </div>
          </section>

          {/* ---------- fresh, and mostly small worlds ---------- */}
          {(isLevelUpsPending || !!levelUps.length) && (
            <section className="flex flex-col gap-4">
              <SectionHeader
                title="Just leveled up"
                description="Topics that reached a new level today. Small worlds level up far more often than big ones, so this list changes daily."
              />

              {isLevelUpsPending ? (
                <CardsPlaceholder cards={4} />
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {levelUps.map((entry) => (
                    <WorldIndexCard
                      key={`${entry.world.user.id}-${entry.niche.id}`}
                      world={entry.world}
                      event={`${entry.niche.title} hit level ${entry.level}`}
                      className="w-64 shrink-0 tablet:w-80"
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ---------- people already known to the viewer ---------- */}
          {isLoggedIn && (isFollowedPending || !!followed.length) && (
            <section className="flex flex-col gap-4">
              <SectionHeader
                title="People you follow"
                description="Worlds built by the people you follow and everyone in your squads."
              />

              {isFollowedPending ? (
                <CardsPlaceholder cards={4} />
              ) : (
                <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-4">
                  {followed.map((world) => (
                    <WorldIndexCard key={world.user.id} world={world} />
                  ))}
                </div>
              )}
            </section>
          )}
        </ResponsivePageContainer>
      </div>
    </>
  );
}

const getWorldIndexLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

WorldIndexPage.getLayout = getWorldIndexLayout;
WorldIndexPage.layoutProps = { screenCentered: false, seo };

export default WorldIndexPage;
