import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import { SquadDirectoryNavbarItem } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbarItem';
import { Chips } from '@dailydotdev/shared/src/components/shell/ShellRow';
import { ShellSquare } from '@dailydotdev/shared/src/components/shell/ShellSquare';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { VolunteeringIcon } from '@dailydotdev/shared/src/components/icons/Volunteering';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  AlertColor,
  AlertDot,
} from '@dailydotdev/shared/src/components/AlertDot';
import type { HelperProfile } from '../data';
import { kindLabel, LfgKind, me, PostStatus } from '../data';
import { noFilters, openPostOf, pendingFor, useProto, userFor } from '../store';
import { daysLeft, LfgRow } from '../ui';
import {
  boardTags,
  boardZones,
  FiltersSheet,
  hasFilters,
  matchesFilters,
  ReputationFilter,
  TimeZoneFilter,
  TopicsFilter,
} from '../filters';
import { PhoneHeader } from '../shell';
import { pageHeaderClassName, Frame } from '../frame';
import { HelperModal } from './Helper';
import { FindYourPeopleWidget, HelperWidget } from './BoardWidgets';

const kinds: ('all' | LfgKind)[] = [
  'all',
  LfgKind.Build,
  LfgKind.Learn,
  LfgKind.Help,
];

const kindName = (kind: 'all' | LfgKind): string =>
  kind === 'all' ? 'Everything' : kindLabel[kind];

type HelperPrefill = Partial<HelperProfile>;

export const BoardScreen = (): ReactElement => {
  const { state, setFilters, navigate, openComposer, track } = useProto();
  // Undefined while closed; the Help tab opens it with the board's filters.
  const [helperPrefill, setHelperPrefill] = useState<HelperPrefill>();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { filters } = state;
  const zones = boardZones(state);
  const tags = boardTags(state);
  const isFiltered = hasFilters(filters);
  const isHelp = filters.kind === LfgKind.Help;
  const isHelping = !!state.helpers[me.id];
  const myPost = openPostOf(state, me.id);

  const posts = state.posts
    .filter(
      (post) =>
        post.status === PostStatus.Open &&
        (filters.kind === 'all' || post.kind === filters.kind) &&
        matchesFilters(filters, post, userFor(state, post.authorId)),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  useEffect(() => {
    if (!posts.length && filters.kind !== 'all') {
      track('empty-kind');
    }
  }, [posts.length, filters.kind, track]);

  const newPost = () => navigate({ name: 'create' });
  const clearFilters = () => setFilters(noFilters);
  // Only what's narrowed carries over, so an alert you already set keeps
  // the rest.
  const openHelping = () =>
    setHelperPrefill({
      ...(filters.tags.length > 0 && { tags: filters.tags }),
      ...(filters.timezones.length > 0 && { timezones: filters.timezones }),
      ...(filters.minReputation > 0 && {
        minReputation: filters.minReputation,
      }),
    });

  return (
    <>
      <PhoneHeader
        title="Looking for group"
        actions={
          <>
            {isHelp && (
              <ShellSquare aria-label="Open to helping" onClick={openHelping}>
                <VolunteeringIcon size={IconSize.Small} secondary={isHelping} />
              </ShellSquare>
            )}
            <ShellSquare
              aria-label="Filters"
              onClick={() => setSheetOpen(true)}
            >
              <FilterIcon size={IconSize.Small} />
              {isFiltered && (
                <AlertDot
                  className="right-1.5 top-1.5"
                  color={AlertColor.Cabbage}
                />
              )}
            </ShellSquare>
            <ShellSquare aria-label="New post" onClick={newPost}>
              <PlusIcon size={IconSize.Small} />
            </ShellSquare>
          </>
        }
        row={
          <Chips
            items={kinds.map((kind) => ({
              key: kind,
              label: kindName(kind),
              active: filters.kind === kind,
              onClick: () => setFilters({ kind }),
            }))}
          />
        }
      />

      <header className={pageHeaderClassName}>
        <ul className="flex items-center gap-2">
          {kinds.map((kind) => (
            <SquadDirectoryNavbarItem
              key={kind}
              buttonSize={ButtonSize.Small}
              isActive={filters.kind === kind}
              label={kindName(kind)}
              ariaLabel={`Show ${kindName(kind)}`}
              onClick={() => setFilters({ kind })}
            />
          ))}
        </ul>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 py-2">
          <div className="flex items-center gap-2">
            <TimeZoneFilter
              zones={zones}
              value={filters.timezones}
              onChange={(timezones) => setFilters({ timezones })}
            />
            <TopicsFilter
              tags={tags}
              value={filters.tags}
              onChange={(value) => setFilters({ tags: value })}
            />
            <ReputationFilter
              value={filters.minReputation}
              onChange={(minReputation) => setFilters({ minReputation })}
            />
            {isFiltered && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isHelp && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<VolunteeringIcon secondary={isHelping} />}
                onClick={openHelping}
              >
                Open to helping
              </Button>
            )}
            <Button
              type="button"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={newPost}
            >
              New post
            </Button>
          </div>
        </div>
      </header>

      <Frame
        side={
          <>
            <FindYourPeopleWidget />
            {myPost ? (
              <SquadWidget
                title="Your post"
                action={
                  <Button
                    type="button"
                    variant={ButtonVariant.Subtle}
                    size={ButtonSize.Small}
                    onClick={() => navigate({ name: 'post', id: myPost.id })}
                  >
                    Open
                  </Button>
                }
              >
                <Typography
                  type={TypographyType.Callout}
                  className="mt-2 line-clamp-2"
                >
                  {myPost.title}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="mt-1 tabular-nums"
                >
                  {pendingFor(state, myPost.id).length} waiting ·{' '}
                  {daysLeft(myPost.expiresAt)} days left
                </Typography>
                <Button
                  type="button"
                  className="mt-3 w-full"
                  variant={ButtonVariant.Subtle}
                  size={ButtonSize.Small}
                  onClick={() =>
                    navigate({ name: 'messages', tab: 'requests' })
                  }
                >
                  Review responses
                </Button>
              </SquadWidget>
            ) : (
              <SquadWidget title="Looking for someone?">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="mt-1"
                >
                  Post what you need. People who match get a heads-up, and your
                  avatar wears the LFG badge while it&apos;s up.
                </Typography>
                <Button
                  type="button"
                  className="mt-3 w-full"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  icon={<PlusIcon />}
                  onClick={newPost}
                >
                  New post
                </Button>
              </SquadWidget>
            )}
            <HelperWidget onOpen={() => setHelperPrefill({})} />
          </>
        }
      >
        <div className="flex flex-col gap-6 px-4 pb-6 pt-3 tablet:px-6 laptop:pt-5">
          {posts.length > 0 && (
            <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
              {posts.map((post) => (
                <LfgRow
                  key={post.id}
                  post={post}
                  state={state}
                  onOpen={() => navigate({ name: 'post', id: post.id })}
                  onReachOut={() => openComposer(post.id)}
                />
              ))}
            </div>
          )}
          {posts.length === 0 && isFiltered && (
            <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
              <Typography type={TypographyType.Body} bold>
                Nothing matches these filters
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="max-w-80"
              >
                {isHelp
                  ? 'Widen them, or get a heads-up when someone asks for help that fits.'
                  : 'Try more time zones or topics, or a lower reputation.'}
              </Typography>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
                {isHelp && (
                  <Button
                    type="button"
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Small}
                    icon={<VolunteeringIcon secondary={isHelping} />}
                    onClick={openHelping}
                  >
                    Open to helping
                  </Button>
                )}
              </div>
            </div>
          )}
          {posts.length === 0 && !isFiltered && (
            <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
              <Typography type={TypographyType.Body} bold>
                {filters.kind === 'all'
                  ? 'Nothing matches yet'
                  : `No ${kindLabel[filters.kind]} posts yet`}
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="max-w-80"
              >
                {isHelp
                  ? 'Be the first to ask. People open to helping with your topics get a heads-up, so it reaches them even if nobody is browsing.'
                  : "Be the first. People who follow your post's tags get a heads-up, so it reaches them even if nobody is browsing."}
              </Typography>
              <Button
                type="button"
                className="mt-3"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
                onClick={newPost}
              >
                New post
              </Button>
            </div>
          )}
        </div>
      </Frame>
      {isSheetOpen && (
        <FiltersSheet
          filters={filters}
          zones={zones}
          tags={tags}
          onChange={setFilters}
          onClose={() => setSheetOpen(false)}
        />
      )}
      {helperPrefill && (
        <HelperModal
          prefill={helperPrefill}
          onClose={() => setHelperPrefill(undefined)}
        />
      )}
    </>
  );
};
