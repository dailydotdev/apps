import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  PlusIcon,
  StarIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
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
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import {
  NotifContainer,
  NotifMessage,
} from '@dailydotdev/shared/src/components/notifications/utils';
import type { DiscoverSquad } from './data';
import { bannedSquadIds } from './data';
import { mySquads } from './data';

// The vocabulary every layout is built from. Real design-system atoms
// (Button, Typography, Image, ProfilePicture, the verified badge, the toast
// container) so a layout reads exactly as it would ship; only the
// composition is new.

const discoverCss = `
.sd-nums { font-variant-numeric: tabular-nums; }
.sd-press { transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1); }
.sd-press:active { transform: scale(0.97); }
.sd-scroll-snap { scroll-snap-type: x mandatory; scroll-padding-inline: 1rem; }
.sd-scroll-snap > * { scroll-snap-align: start; }
@keyframes sdIn {
  from { opacity: 0; transform: translateY(0.5rem); }
  to { opacity: 1; transform: none; }
}
.sd-in { animation: sdIn 260ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.sd-scrim {
  background: linear-gradient(
    to top,
    var(--theme-background-default) 8%,
    color-mix(in srgb, var(--theme-background-default), transparent 35%) 45%,
    transparent 80%
  );
}
/* Peeking neighbours fade out toward the edges. --sd-fade is the peek
   width; a fallback rather than a default so a breakpoint can set it.
   An edge with nothing beyond it drops its fade. */
.sd-fade-edges {
  --sd-fade-l: var(--sd-fade, 2.5rem);
  --sd-fade-r: var(--sd-fade, 2.5rem);
  -webkit-mask-image: linear-gradient(to right, transparent, black var(--sd-fade-l), black calc(100% - var(--sd-fade-r)), transparent);
  mask-image: linear-gradient(to right, transparent, black var(--sd-fade-l), black calc(100% - var(--sd-fade-r)), transparent);
}
.sd-fade-edges.sd-at-start { --sd-fade-l: 0px; }
.sd-fade-edges.sd-at-end { --sd-fade-r: 0px; }
`;

export const DiscoverStyles = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: discoverCss }} />
);

/* ------------------------------------------------------------ join state */

interface JoinToast {
  id: number;
  message: string;
  squads: DiscoverSquad[];
}

interface JoinContextValue {
  isJoined: (squad: DiscoverSquad) => boolean;
  join: (squad: DiscoverSquad) => void;
  joinAll: (squads: DiscoverSquad[]) => void;
  undo: () => void;
  toast: JoinToast | null;
  dismissToast: () => void;
}

const JoinContext = createContext<JoinContextValue | null>(null);

/**
 * A frozen state for the states catalog: squads just joined, a toast on
 * screen, and Featured held on one block without moving.
 */
export interface PreviewState {
  session?: DiscoverSquad[];
  toast?: string;
  autoAdvance?: boolean;
  featuredAt?: 'first' | 'middle' | 'last';
  arrowLook?: ArrowLook;
  /** My Squads as a moderator (default), a plain member, or with none. */
  mySquads?: 'moderator' | 'member' | 'empty';
  /** Opens scrolled to the end of the page. */
  scrollEnd?: boolean;
  /** The moderation page opened on one step of its flow. */
  moderation?:
    | 'queue'
    | 'preview'
    | 'decline'
    | 'approve-all'
    | 'approved'
    | 'empty';
}

/** The Featured arrows' candidate looks, compared in Details. */
export type ArrowLook =
  | 'primary'
  | 'float-square'
  | 'glass'
  | 'quiet-square'
  | 'brand';

const PreviewContext = createContext<PreviewState>({});
export const usePreview = (): PreviewState => useContext(PreviewContext);

/**
 * Optimistic membership for one device frame. Join flips instantly and
 * offers Undo in a toast, so a reader can join three squads in three taps
 * without leaving the list. A joined squad drops its button; leaving
 * happens on the squad's own page.
 */
export const JoinProvider = ({
  children,
  initial = mySquads.map((item) => item.id),
  preview = {},
}: {
  children: ReactNode;
  initial?: string[];
  preview?: PreviewState;
}): ReactElement => {
  const [joined, setJoined] = useState(
    () =>
      new Set([...initial, ...(preview.session ?? []).map((item) => item.id)]),
  );
  const [toast, setToast] = useState<JoinToast | null>(
    preview.toast
      ? { id: 0, message: preview.toast, squads: preview.session ?? [] }
      : null,
  );
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((message: string, squads: DiscoverSquad[]) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, squads });
    timer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const join = useCallback(
    (squad: DiscoverSquad) => {
      setJoined((current) => new Set(current).add(squad.id));
      showToast(`Joined ${squad.name}`, [squad]);
    },
    [showToast],
  );

  const joinAll = useCallback(
    (squads: DiscoverSquad[]) => {
      setJoined((current) => {
        const fresh = squads.filter((item) => !current.has(item.id));
        if (!fresh.length) {
          return current;
        }
        const next = new Set(current);
        fresh.forEach((item) => next.add(item.id));
        showToast(
          `Joined ${fresh.length} Squad${fresh.length > 1 ? 's' : ''}`,
          fresh,
        );
        return next;
      });
    },
    [showToast],
  );

  const undo = useCallback(() => {
    if (!toast) {
      return;
    }
    const ids = new Set(toast.squads.map((item) => item.id));
    setJoined((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setToast(null);
  }, [toast]);

  const value = useMemo(
    () => ({
      isJoined: (squad: DiscoverSquad) => joined.has(squad.id),
      join,
      joinAll,
      undo,
      toast,
      dismissToast: () => setToast(null),
    }),
    [joined, join, joinAll, undo, toast],
  );

  return (
    <PreviewContext.Provider value={preview}>
      <JoinContext.Provider value={value}>{children}</JoinContext.Provider>
    </PreviewContext.Provider>
  );
};

export const useJoin = (): JoinContextValue => {
  const value = useContext(JoinContext);
  if (!value) {
    throw new Error('useJoin outside JoinProvider');
  }
  return value;
};

/* --------------------------------------------------------------- atoms */

export const JoinButton = ({
  squad,
  size = ButtonSize.Small,
  block = false,
  className,
}: {
  squad: DiscoverSquad;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}): ReactElement | null => {
  const { isJoined, join } = useJoin();

  // Joined squads show no button: the Undo toast covers a mistake, and
  // leaving belongs to the squad's own page.
  if (isJoined(squad)) {
    return null;
  }

  if (bannedSquadIds.has(squad.id)) {
    // Production's SquadActionButton for a banned member: Join, disabled,
    // with this tooltip. The span takes the hover a disabled button drops.
    return (
      <SimpleTooltip
        placement="bottom"
        appendTo="parent"
        content="You are not allowed to join the Squad"
      >
        <span className={classNames('relative z-1 shrink-0', className)}>
          <Button
            type="button"
            size={size}
            variant={ButtonVariant.Primary}
            aria-label="You are not allowed to join the Squad"
            className={classNames(block && 'w-full')}
            disabled
          >
            Join
          </Button>
        </span>
      </SimpleTooltip>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      variant={ButtonVariant.Primary}
      aria-label={`Join ${squad.name}`}
      className={classNames(
        'relative z-1 shrink-0',
        block && 'w-full',
        className,
      )}
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        join(squad);
      }}
    >
      Join
    </Button>
  );
};

export const SquadAvatar = ({
  squad,
  className = 'size-12',
}: {
  squad: DiscoverSquad;
  className?: string;
}): ReactElement => (
  <Image
    src={squad.image}
    alt={`${squad.name} source`}
    type={ImageType.Squad}
    className={classNames('shrink-0 rounded-full object-cover', className)}
  />
);

const SquadName = ({
  squad,
  type = TypographyType.Callout,
  className,
}: {
  squad: DiscoverSquad;
  type?: TypographyType;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex min-w-0 items-center gap-1', className)}>
    <Typography tag={TypographyTag.H3} type={type} bold truncate>
      {squad.name}
    </Typography>
    {squad.verified && <VerifiedSquadBadge className="size-4 shrink-0" />}
  </div>
);

/**
 * Production's disclosure on boosted posts (PostMetadata): a bold word
 * that takes the colour and size of the meta line it opens, so it reads
 * as part of the line rather than as a badge.
 */
export const PromotedLabel = ({
  className,
}: {
  className?: string;
}): ReactElement => <strong className={className}>Promoted</strong>;

/**
 * "4 members" on a promoted card reads as a warning, not social proof, so
 * squads still finding their first members say so instead.
 */
export const NEW_SQUAD_MEMBER_THRESHOLD = 50;

export const membersLabel = (count: number): string =>
  count < NEW_SQUAD_MEMBER_THRESHOLD
    ? 'New Squad'
    : `${largeNumberFormat(count) ?? count} members`;

export const MemberStack = ({
  squad,
  max = 3,
  size = ProfileImageSize.XSmall,
  showCount = true,
  className,
}: {
  squad: DiscoverSquad;
  max?: number;
  size?: ProfileImageSize;
  showCount?: boolean;
  className?: string;
}): ReactElement => (
  <span className={classNames('flex items-center gap-2', className)}>
    {squad.members.length > 0 && (
      <span className="flex flex-row-reverse justify-end pl-1.5">
        {squad.members
          .slice(0, max)
          .reverse()
          .map((image) => (
            <ProfilePicture
              key={image}
              size={size}
              className="-ml-1.5 ring-2 ring-background-subtle"
              user={{ id: image, image, username: 'member' }}
              nativeLazyLoading
            />
          ))}
      </span>
    )}
    {showCount && (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="sd-nums"
        bold
      >
        {membersLabel(squad.membersCount)}
      </Typography>
    )}
  </span>
);

/* -------------------------------------------------------------- rows */

/**
 * The list row. The mobile workhorse: 64px per squad, so seven fit above
 * the fold of a 375×812 phone where today's layout fits one and a half
 * cards. The whole row opens the squad; Join stops propagation.
 */
export const SquadRow = ({
  squad,
  promoted = false,
  reason,
  description = false,
  join = true,
  action,
  className,
  size = 'medium',
}: {
  squad: DiscoverSquad;
  promoted?: boolean;
  /** A personal line in place of the handle, e.g. "Because you follow #react". */
  reason?: string;
  description?: boolean;
  /** Off on My Squads, where every row is already joined. */
  join?: boolean;
  /** Trailing control, such as My Squads' favorite star. */
  action?: ReactNode;
  className?: string;
  size?: 'medium' | 'large';
}): ReactElement => (
  <article
    className={classNames(
      'group group/squad-row relative flex items-center rounded-16 py-2',
      size === 'large' ? 'gap-4' : 'gap-3',
      className,
    )}
  >
    <a
      href={squad.permalink}
      title={squad.description}
      aria-label={`Open ${squad.name}`}
      className="absolute inset-0 z-0 rounded-16"
      onClick={(event) => event.preventDefault()}
    />
    {/* Squad images are always circles; only people's are rounded squares. */}
    <SquadAvatar
      squad={squad}
      className={
        size === 'large'
          ? 'size-16 bg-background-subtle laptop:size-20'
          : 'size-12'
      }
    />
    <div className="flex min-w-0 flex-1 flex-col">
      <SquadName squad={squad} />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        truncate
        className="sd-nums"
      >
        {promoted && (
          <>
            <PromotedLabel />
            <Separator />
          </>
        )}
        {membersLabel(squad.membersCount)}
        <Separator />
        {reason ?? `@${squad.handle}`}
      </Typography>
      {description && squad.description && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="mt-0.5 line-clamp-1"
        >
          {squad.description}
        </Typography>
      )}
    </div>
    {join && <JoinButton squad={squad} />}
    {action}
  </article>
);

/**
 * Production's SquadFavoriteButton on My Squads: a star that fills once
 * favorited and, on laptop, shows on hover until then.
 */
export const FavoriteButton = ({
  squad,
  favorited,
  onToggle,
}: {
  squad: DiscoverSquad;
  favorited: boolean;
  onToggle: () => void;
}): ReactElement => (
  <button
    type="button"
    aria-label={`${favorited ? 'Unfavorite' : 'Favorite'} ${squad.name}`}
    aria-pressed={favorited}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onToggle();
    }}
    className={classNames(
      'relative z-1 flex shrink-0 items-center justify-center text-text-tertiary hover:text-text-primary',
      !favorited &&
        'laptop:opacity-0 laptop:transition-opacity laptop:group-focus-within/squad-row:opacity-100 laptop:group-hover/squad-row:opacity-100',
    )}
  >
    <StarIcon secondary={favorited} size={IconSize.Medium} />
  </button>
);

/* ------------------------------------------------------------ chrome */

export const SectionHeader = ({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}): ReactElement => (
  <header
    className={classNames('flex items-end justify-between gap-3', className)}
  >
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="flex items-center gap-2">
        {icon}
        <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
          {title}
        </Typography>
      </span>
      {subtitle && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {subtitle}
        </Typography>
      )}
    </div>
    {action}
  </header>
);

/**
 * Splits a topic into its Verified Company Squads and the rest. Verified
 * squads rank first by design (it is part of what companies pay for), and
 * without a label a 14-member official squad above a 30K community reads
 * as a ranking bug.
 */
export const GroupLabel = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'col-span-full flex items-center pb-1 pt-3 first:pt-0',
      className,
    )}
  >
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      bold
    >
      {label}
    </Typography>
  </div>
);

/** The production toast, placed where it lands in the app. */
export const JoinToastHost = ({
  className,
}: {
  className?: string;
}): ReactElement | null => {
  const { toast, undo, dismissToast } = useJoin();
  if (!toast) {
    return null;
  }
  return (
    <div
      className={classNames(
        'pointer-events-none fixed inset-x-0 top-4 z-max flex justify-center px-4 tablet:top-8',
        className,
      )}
    >
      <NotifContainer
        key={toast.id}
        role="alert"
        className="sd-in pointer-events-auto !static !w-auto !translate-x-0 gap-2"
      >
        <VIcon
          size={IconSize.Small}
          className="shrink-0 text-accent-avocado-default"
        />
        <NotifMessage>{toast.message}</NotifMessage>
        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.XSmall}
          onClick={undo}
        >
          Undo
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          aria-label="Dismiss"
          icon={<PlusIcon className="rotate-45" />}
          onClick={dismissToast}
        />
      </NotifContainer>
    </div>
  );
};
