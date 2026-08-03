import type { ReactElement } from 'react';
import React, { memo } from 'react';
import classNames from 'classnames';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import { ProfileLink } from '@dailydotdev/shared/src/components/profile/ProfileLink';
import { ProfileTooltip } from '@dailydotdev/shared/src/components/profile/ProfileTooltip';
import CommentAuthor from '@dailydotdev/shared/src/components/comments/CommentAuthor';
import { PlusUserBadge } from '@dailydotdev/shared/src/components/PlusUserBadge';
import {
  FlexRow,
  TruncateText,
} from '@dailydotdev/shared/src/components/utilities';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ArrowIcon, InfoIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { Author } from '@dailydotdev/shared/src/graphql/comments';
import { WorldImmersiveToggle } from './WorldMark';
import { WorldSignupCta } from './WorldSignupCta';
import { WorldViewerAction } from './WorldViewerAction';
import type { WorldState } from './worldState';

const STAT_INFO: [string, string][] = [
  ['Articles', 'every article read on daily.dev'],
  ['Districts', 'one per niche read at least once'],
  ['Realms', 'districts that share a subject'],
  ['Span', 'first article read to last'],
];

/* One icon for the four of them. A rail this narrow cannot carry an info button
   per number — and read together the four definitions explain the world, which
   one at a time they do not. */
const StatsLegend = () => (
  <Tooltip
    // Four definitions do not fit the default 18rem, and the content row is a
    // centred flex: without these the list is squeezed and mid-aligned.
    className="!max-w-[21rem] items-start whitespace-normal"
    content={
      <ul className="flex min-w-0 flex-col gap-1">
        {STAT_INFO.map(([term, meaning]) => (
          <li key={term} className="typo-caption1">
            <b className="text-text-primary">{term}:</b>
            <span className="text-text-tertiary"> {meaning}</span>
          </li>
        ))}
      </ul>
    }
    enableMobileClick
  >
    <button
      type="button"
      aria-label="What these numbers mean"
      className="flex flex-none items-center text-text-quaternary hover:text-text-primary"
    >
      <InfoIcon size={IconSize.Size16} />
    </button>
  </Tooltip>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-0 flex-1 flex-col">
    <Typography
      type={TypographyType.Callout}
      bold
      className="tabular-nums"
      truncate
    >
      {value}
    </Typography>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      truncate
    >
      {label}
    </Typography>
  </div>
);

/**
 * Memoised on purpose. The engine pushes a new state object every frame while
 * the replay runs, and none of this reads it — without the boundary the whole
 * identity block, the follow query and the signup card reconcile sixty times a
 * second behind numbers that are the only thing actually changing.
 */
const WorldPanelHeader = memo(function WorldPanelHeader({
  user,
  isImmersive,
  onToggleImmersive,
}: {
  user: PublicProfile;
  isImmersive: boolean;
  onToggleImmersive: () => void;
}): ReactElement {
  /* A profile carries everything a comment author does, but types its handle as
     optional — and the comment components do not. One that has no handle has no
     profile page to link to either, so an empty one is the honest fallback. */
  const author: Author = {
    id: user.id,
    name: user.name,
    image: user.image,
    permalink: user.permalink,
    username: user.username ?? '',
  };

  return (
    <header className="flex flex-col gap-3">
      {/* Both ends hang the same 4px outside the rail's text column: a tertiary
          button's own padding is what lines its label up with the content under
          it, and the icon-only one has none to give. */}
      <div className="-mx-1 flex items-center justify-between gap-2">
        <Link href={`/${user.username || user.id}`} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
          >
            Back to profile
          </Button>
        </Link>
        <WorldImmersiveToggle
          isImmersive={isImmersive}
          onToggleImmersive={onToggleImmersive}
        />
      </div>
      {/* The same block a comment puts its author in — avatar, name, handle,
          and the user card on hover — so a reader meets a person the same way
          wherever they meet them. */}
      <div className="flex w-full flex-row">
        <ProfileTooltip userId={author.id}>
          <ProfileImageLink
            user={author}
            picture={{ width: 40, height: 40, size: ProfileImageSize.Large }}
          />
        </ProfileTooltip>
        <div className="ml-3 flex min-w-0 flex-1 flex-col typo-callout">
          <FlexRow className="h-5 items-center gap-1 text-text-quaternary">
            <CommentAuthor author={author} />
            {!!user.isPlus && <PlusUserBadge user={user} />}
          </FlexRow>
          {!!user.username && (
            <ProfileLink href={user.permalink}>
              <TruncateText
                className="!leading-5 text-text-tertiary typo-footnote"
                title={`@${user.username}`}
              >
                @{user.username}
              </TruncateText>
            </ProfileLink>
          )}
        </div>
      </div>
      <WorldViewerAction user={user} />
    </header>
  );
});

/** Same reason: nothing in the signup card reads the day. */
const WorldPanelSignup = memo(WorldSignupCta);

interface WorldPanelProps {
  user: PublicProfile;
  state: WorldState;
  isImmersive: boolean;
  onToggleImmersive: () => void;
  onFocus: (key: string) => void;
  onLeaveRealm: () => void;
}

/**
 * The lab's left rail: who this world belongs to and what is in it. Every
 * number here is a fact the engine pushed — the panel does no counting of its
 * own, because the engine is counting the day the scrubber is standing on and
 * the panel is not.
 */
export function WorldPanel({
  user,
  state,
  isImmersive,
  onToggleImmersive,
  onFocus,
  onLeaveRealm,
}: WorldPanelProps): ReactElement {
  const { open, rank = [] } = state;

  return (
    <aside
      data-world-overlay
      className={classNames(
        'pointer-events-auto absolute inset-y-0 left-0 z-1 flex w-80 flex-col gap-3',
        'overflow-y-auto border-r border-border-subtlest-tertiary bg-background-default p-4',
      )}
    >
      <WorldPanelHeader
        user={user}
        isImmersive={isImmersive}
        onToggleImmersive={onToggleImmersive}
      />

      {/* Four across, on one line. DataTile is the right component for a stats
          page and the wrong one for a rail this narrow — its card and its own
          info icon are together taller than these four numbers need to be. */}
      <div className="flex items-center gap-2 border-y border-border-subtlest-tertiary py-3">
        <Stat
          label={state.articles === 1 ? 'Article' : 'Articles'}
          value={formatDataTileValue(state.articles ?? 0)}
        />
        <Stat
          label={state.districts === 1 ? 'District' : 'Districts'}
          value={formatDataTileValue(state.districts ?? 0)}
        />
        <Stat
          label={state.realms === 1 ? 'Realm' : 'Realms'}
          value={formatDataTileValue(state.realms ?? 0)}
        />
        <Stat label="Span" value={state.span ?? '—'} />
        <StatsLegend />
      </div>

      {/* Natural height, not flex-1: the rail scrolls as a whole, and a ranking
          that grew to fill it left the signup card underneath the list. */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            {open ? 'Districts' : 'Realms'}
          </Typography>
          {!!open && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<ArrowIcon className="-rotate-90" />}
              onClick={onLeaveRealm}
            >
              Back to the world
            </Button>
          )}
        </div>
        {!!open && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
            truncate
          >
            {open.name} · {open.theme}
          </Typography>
        )}
        <div className="flex flex-col gap-0.5">
          {rank.map((row) => (
            <button
              type="button"
              key={row.key}
              onClick={() => onFocus(row.key)}
              className={classNames(
                'flex flex-col gap-1 rounded-10 px-2 py-1.5 text-left hover:bg-surface-hover',
                row.selected && 'bg-surface-float',
              )}
            >
              <span className="flex w-full items-center gap-2">
                <i
                  className="h-2 w-2 flex-none rounded-2"
                  style={{ background: row.color }}
                />
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Footnote}
                  className="min-w-0 flex-1"
                  truncate
                >
                  {row.name}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  L{row.level}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="w-10 text-right tabular-nums"
                >
                  {formatDataTileValue(row.reads)}
                </Typography>
              </span>
              <span
                className="h-0.5 rounded-2 opacity-64"
                style={{ background: row.color, width: `${row.share}%` }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Last, and only for a reader with no account: the ranking is what they
          came for, and the pitch reads better under a world they have already
          spent a minute in than over the top of it. */}
      <WorldPanelSignup />
    </aside>
  );
}
