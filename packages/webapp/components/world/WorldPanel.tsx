import type { ReactElement } from 'react';
import React, { memo, useState } from 'react';
import classNames from 'classnames';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
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
import {
  ArrowIcon,
  InfoIcon,
  SettingsIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';
import { pluralize } from '@dailydotdev/shared/src/lib/strings';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { Author } from '@dailydotdev/shared/src/graphql/comments';
import type { WorldDistrict } from '../../graphql/world';
import { WorldCustomizeRail } from './WorldCustomize';
import { WorldGuide } from './WorldGuide';
import { WorldImmersiveToggle } from './WorldMark';
import { WorldShare } from './WorldShare';
import { WorldNudge } from './WorldNudge';
import { WorldSignupCta } from './WorldSignupCta';
import { WorldViewerAction } from './WorldViewerAction';
import { levelProgress, REALM_DIV } from './ladder';
import type { WorldDraft } from './useWorldDraft';
import type { WorldRankRow, WorldState } from './worldState';

/* One icon for all of them, in the stat row, because that is where a reader
   looks when a number on a panel means nothing to them. It used to hover a list
   of five definitions; it now opens the guide, which holds those definitions
   plus the two things a tooltip had no room for and the world states nowhere
   else: what the levels are, and what clicking anything does. */
const StatsLegend = ({ onOpen }: { onOpen: () => void }) => (
  <Tooltip content="How this world works">
    <button
      type="button"
      aria-label="How this world works"
      className="flex flex-none items-center text-text-quaternary hover:text-text-primary"
      onClick={onOpen}
    >
      <InfoIcon size={IconSize.Size16} />
    </button>
  </Tooltip>
);

/* What the bare "L7" on a row is measured against. A realm and a district are
   scored on the same ladder with the realm's thresholds stretched by REALM_DIV,
   so which one a row is decides the divisor, and `open` is what says which:
   because the rail lists realms at world scale and districts inside one.
   The level comes back out of `levelProgress` rather than off the row so the
   badge and the sentence explaining it can never disagree. */
const levelHint = (row: WorldRankRow, isDistrict: boolean): string => {
  const { level, toNext } = levelProgress(
    row.reads,
    isDistrict ? 1 : REALM_DIV,
  );

  if (toNext <= 0) {
    return `Level ${level} · the top of the ladder`;
  }

  /* Said the way the plates on the world say it, because they are the other
     place this number shows up and two phrasings of one fact read as two. */
  return `Level ${level} · ${formatDataTileValue(toNext)} ${pluralize(
    'article',
    toNext,
  )} to L${level + 1}`;
};

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
 * the replay runs, and none of this reads it. Without the boundary the whole
 * identity block, the follow query and the signup card reconcile sixty times a
 * second behind numbers that are the only thing actually changing.
 */
const WorldPanelHeader = memo(function WorldPanelHeader({
  user,
  worldName,
  isImmersive,
  isInRealm,
  isOwn,
  canShare,
  onToggleImmersive,
  onCustomize,
  onLeaveRealm,
}: {
  user: PublicProfile;
  /** What the owner calls the place, or nothing if they never named it. */
  worldName?: string;
  isImmersive: boolean;
  /** Inside a realm the way out is one level up, not off the world entirely. */
  isInRealm: boolean;
  isOwn: boolean;
  /** False on a world its owner has hidden: the link would open on a wall. */
  canShare: boolean;
  onToggleImmersive: () => void;
  /** Only on your own world: nobody else's place is yours to dress. */
  onCustomize?: () => void;
  onLeaveRealm: () => void;
}): ReactElement {
  /* A profile carries everything a comment author does, but types its handle as
     optional, and the comment components do not. One that has no handle has no
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
        {isInRealm ? (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
            onClick={onLeaveRealm}
          >
            Back to world view
          </Button>
        ) : (
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
        )}
        <div className="flex flex-none items-center">
          {canShare && (
            <WorldShare user={user} worldName={worldName} isOwn={isOwn} />
          )}
          {!!onCustomize && (
            <Tooltip content="Make it yours">
              <Button
                type="button"
                aria-label="Customise this world"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<SettingsIcon />}
                onClick={onCustomize}
              />
            </Tooltip>
          )}
          <WorldImmersiveToggle
            isImmersive={isImmersive}
            onToggleImmersive={onToggleImmersive}
          />
        </div>
      </div>
      {/* The same block a comment puts its author in (avatar, name, handle,
          and the user card on hover), so a reader meets a person the same way
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
      {/* An unnamed world shows nothing here — the suggestion belongs in the bench's placeholder, not this heading. */}
      {!!worldName && (
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.Body}
          bold
          className="break-words"
        >
          {worldName}
        </Typography>
      )}
      {/* The one sentence that says what the page is, for the reader who never
          clicks anything. Most arrivals here are strangers following a link, so
          the mechanic cannot live behind an info icon alone. */}
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {isOwn
          ? 'Every article you read grows a district here.'
          : 'Built from what they read on daily.dev.'}
      </Typography>
      <WorldViewerAction user={user} />
    </header>
  );
});

/** Same reason: nothing in the signup card reads the day. */
const WorldPanelSignup = memo(WorldSignupCta);

interface WorldPanelProps {
  user: PublicProfile;
  state: WorldState;
  /** Six realms of bare ground: every number is a zero and nothing is standing. */
  unbuilt?: boolean;
  /**
   * Mounted, off screen. The rail stays in the tree while the panels are hidden
   * so the signup card does not re-log its mount, and nothing in here has to
   * keep up with the engine while nobody can see it.
   */
  isHidden?: boolean;
  isImmersive: boolean;
  worldName?: string;
  isOwn: boolean;
  /** False on a world its owner has hidden: the link would open on a wall. */
  canShare: boolean;
  /** Open on your own world, and only there. */
  draft?: WorldDraft;
  districts?: WorldDistrict[];
  /** The owner has never made this place theirs. */
  showNudge?: boolean;
  onToggleImmersive: () => void;
  onFocus: (key: string) => void;
  onLeaveRealm: () => void;
}

const RAIL =
  'pointer-events-auto absolute inset-y-0 left-0 z-1 flex w-80 flex-col gap-3 overflow-y-auto border-r border-border-subtlest-tertiary bg-background-default p-4';

/**
 * The lab's left rail: who this world belongs to and what is in it. Every
 * number here is a fact the engine pushed: the panel does no counting of its
 * own, because the engine is counting the day the scrubber is standing on and
 * the panel is not.
 */
function WorldPanelRail({
  user,
  state,
  unbuilt,
  isImmersive,
  worldName,
  isOwn,
  canShare,
  draft,
  districts,
  showNudge,
  onToggleImmersive,
  onFocus,
  onLeaveRealm,
}: WorldPanelProps): ReactElement {
  const { open, rank = [] } = state;
  const { logEvent } = useLogContext();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  /* Bench replaces the rail's contents rather than opening beside it — the single column changes, nothing else moves. */
  if (draft?.isOpen && draft.settings) {
    return (
      <WorldCustomizeRail
        userId={user.id}
        draft={draft}
        districts={districts}
        settings={draft.settings}
      />
    );
  }

  /* Same column, same trade as the bench: an explanation of a map that stands
     over the map is answering the question by hiding the reason for it. Second,
     so the bench wins if both are somehow open. Dressing the world is a job
     with unsaved state in it, and reading about it is not. */
  if (isGuideOpen) {
    return (
      <WorldGuide
        isOwn={isOwn}
        districts={districts}
        hasReplay={!unbuilt && !!state.replayable}
        canCustomize={!!draft}
        onClose={() => setIsGuideOpen(false)}
      />
    );
  }

  return (
    <aside data-world-overlay className={RAIL}>
      <WorldPanelHeader
        user={user}
        worldName={worldName}
        isImmersive={isImmersive}
        isInRealm={!!open}
        isOwn={isOwn}
        canShare={canShare}
        onToggleImmersive={onToggleImmersive}
        onCustomize={draft?.open}
        onLeaveRealm={onLeaveRealm}
      />

      {!!showNudge && !!draft && <WorldNudge onCustomize={draft.open} />}

      {/* Four across, on one line. DataTile is the right component for a stats
          page and the wrong one for a rail this narrow: its card and its own
          info icon are together taller than these four numbers need to be. */}
      <div className="flex items-center gap-2 border-y border-border-subtlest-tertiary py-3">
        <Stat
          label={pluralize('Article', state.articles ?? 0)}
          value={formatDataTileValue(state.articles ?? 0)}
        />
        <Stat
          label={pluralize('District', state.districts ?? 0)}
          value={formatDataTileValue(state.districts ?? 0)}
        />
        <Stat
          label={pluralize('Realm', state.realms ?? 0)}
          value={formatDataTileValue(state.realms ?? 0)}
        />
        <Stat label="Active" value={state.span ?? '-'} />
        <StatsLegend
          onOpen={() => {
            setIsGuideOpen(true);
            logEvent({
              event_name: LogEvent.WorldGuideOpen,
              target_id: user.id,
              extra: JSON.stringify({ is_own: isOwn, in_realm: !!open }),
            });
          }}
        />
      </div>

      {/* Natural height, not flex-1: the rail scrolls as a whole, and a ranking
          that grew to fill it left the signup card underneath the list. */}
      <section className="flex flex-col gap-2">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          bold
        >
          {open ? 'Districts' : 'Realms'}
        </Typography>
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
              // There is nothing to fly to on ground nobody has read into, and
              // the engine will not open an unbuilt realm either.
              disabled={unbuilt}
              className={classNames(
                'flex flex-col gap-1 rounded-10 px-2 py-1.5 text-left',
                !unbuilt && 'hover:bg-surface-hover',
                row.selected && 'bg-surface-float',
              )}
            >
              <span className="flex w-full items-center gap-2">
                <i
                  className={classNames(
                    'h-2 w-2 flex-none rounded-2',
                    unbuilt && 'opacity-32',
                  )}
                  style={{ background: row.color }}
                />
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Footnote}
                  color={unbuilt ? TypographyColor.Tertiary : undefined}
                  className="min-w-0 flex-1"
                  truncate
                >
                  {row.name}
                </Typography>
                {/* A realm nobody has read is not level zero with zero
                    articles in it. It is ground, and the row says so by being
                    a name with nothing after it. */}
                {!unbuilt && (
                  <>
                    {/* The badge is the one number on this panel with nothing
                        beside it to measure it against, and the distance to the
                        next rung is the only reading of it that means anything
                        to somebody who has never seen the ladder.

                        A PLAIN span, not a Typography. The tooltip trigger is a
                        Radix `asChild` slot, so whatever sits here is handed a
                        ref, and Typography builds its element type inside its
                        own render body, so it is a new component type every
                        pass. Handed a ref, that is a fiber deleted and remounted
                        on every render, and the ref detach re-renders the
                        trigger: an infinite loop, not a slow component. */}
                    <Tooltip content={levelHint(row, !!open)}>
                      <span className="text-text-quaternary typo-caption1">
                        L{row.level}
                      </span>
                    </Tooltip>
                    <Typography
                      tag={TypographyTag.Span}
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                      className="w-10 text-right tabular-nums"
                    >
                      {formatDataTileValue(row.reads)}
                    </Typography>
                  </>
                )}
              </span>
              {!unbuilt && (
                <span
                  className="h-0.5 rounded-2 opacity-64"
                  style={{ background: row.color, width: `${row.share}%` }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Last, and only for a reader with no account: the ranking is what they
          came for, and the pitch reads better under a world they have already
          spent a minute in than over the top of it. Not on unbuilt ground:
          there the one ask stands on the world itself (`WorldInvite`), and this
          would be the same pitch made twice on one screen. */}
      {!unbuilt && <WorldPanelSignup />}
    </aside>
  );
}

/**
 * Nothing in a rail nobody can see is worth a render, and the engine pushes a
 * new state through here every frame of a replay whether the panels are up or
 * not. Hidden to hidden is the only pass worth skipping: coming back has to
 * land on the day the scrubber is standing on now, not the one it left.
 */
export const WorldPanel = memo(
  WorldPanelRail,
  (previous, next) => !!previous.isHidden && !!next.isHidden,
);
