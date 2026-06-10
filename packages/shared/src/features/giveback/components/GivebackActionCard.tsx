import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { IconSize } from '../../../components/Icon';
import type { IconProps } from '../../../components/Icon';
import { TimerIcon, VIcon } from '../../../components/icons';
import type { ContributionAction } from '../types';
import { ContributionSubmissionStatus } from '../types';
import { formatDonationAmount } from '../utils';
import { getActionPlatformVisual } from '../actionPlatform';

interface GivebackActionCardProps {
  action: ContributionAction;
  onSubmit?: (action: ContributionAction) => void;
}

interface StatusMeta {
  label: string;
  Icon: ComponentType<IconProps>;
}

// Coarse "available in" copy for a cooled-down action. Rounds up to the nearest
// day/hour/minute so the card never claims an action is ready a tick early.
const formatCooldownRemaining = (endsAt: string): string => {
  const minutes = Math.ceil((new Date(endsAt).getTime() - Date.now()) / 60000);
  if (minutes >= 1440) {
    return `${Math.ceil(minutes / 1440)}d`;
  }
  if (minutes >= 60) {
    return `${Math.ceil(minutes / 60)}h`;
  }
  return `${Math.max(1, minutes)}m`;
};

interface PlatformLogoProps {
  logoUrl?: string;
  Icon: ComponentType<IconProps>;
  forceDark?: boolean;
  isDimmed: boolean;
}

// Prefers the real brand logo (an SVG from the logo CDN) and falls back to the
// internal glyph if there is no logo for the surface or the remote one fails to
// load — so a tile is never broken or blank. The parent tile already pins the
// background and applies the dimmed/grayscale treatment.
const PlatformLogo = ({
  logoUrl,
  Icon,
  forceDark,
  isDimmed,
}: PlatformLogoProps): ReactElement => {
  const [failed, setFailed] = useState(false);

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt=""
        aria-hidden
        loading="lazy"
        onError={() => setFailed(true)}
        className="size-6 object-contain"
      />
    );
  }

  return (
    <Icon
      secondary
      size={IconSize.Small}
      className={classNames(!isDimmed && forceDark && 'brightness-0')}
    />
  );
};

// One sharp, explicit title carries the ask — no competing subtitle. The
// supporting details (payout, status, "just for love") sit in a calm top/bottom
// frame around it so the card stays easy to scan at a glance.
export const GivebackActionCard = ({
  action,
  onSubmit,
}: GivebackActionCardProps): ReactElement => {
  const { metadata, latestUserSubmission } = action;
  const isLove = metadata.isLoveAction;

  const reachedMax =
    action.maxPerUser != null && action.userCompletions >= action.maxPerUser;
  const isApproved =
    latestUserSubmission?.status === ContributionSubmissionStatus.Approved;
  const isInReview =
    latestUserSubmission?.status === ContributionSubmissionStatus.Flagged;
  // "Done" = approved or you've hit the per-user cap. A rejected submission
  // stays clickable to retry.
  const isDone = isApproved || reachedMax;
  // Cooldown only gates an action that would otherwise be actionable.
  const onCooldown =
    !isDone &&
    !isInReview &&
    !!action.userCooldownEndsAt &&
    new Date(action.userCooldownEndsAt).getTime() > Date.now();

  // Repeatable actions surface how many runs are left until they cap out.
  const { maxPerUser } = action;
  const remaining =
    maxPerUser != null ? Math.max(0, maxPerUser - action.userCompletions) : 0;
  const showRemaining =
    maxPerUser != null && maxPerUser > 1 && !isDone && remaining > 0;

  // Any non-actionable state shares the same dimmed, non-interactive treatment.
  const isDimmed = isDone || isInReview || onCooldown;
  const isInteractive = !isDimmed && !!onSubmit;

  const {
    Icon,
    name: platformName,
    forceDark,
    logoUrl,
  } = getActionPlatformVisual(metadata.platform);

  const getStatusMeta = (): StatusMeta | null => {
    if (isDone) {
      return { label: 'Done', Icon: VIcon };
    }
    if (isInReview) {
      return { label: 'In review', Icon: TimerIcon };
    }
    if (onCooldown && action.userCooldownEndsAt) {
      return {
        label: `Available in ${formatCooldownRemaining(
          action.userCooldownEndsAt,
        )}`,
        Icon: TimerIcon,
      };
    }
    return null;
  };
  const statusMeta = getStatusMeta();

  // The top-right slot shows one of three mutually exclusive things: a status
  // pill once acted on or cooling down, a soft "love" tag for no-reward actions,
  // or the payout.
  const renderTopRightMeta = (): ReactNode => {
    if (statusMeta) {
      return (
        <FlexRow className="shrink-0 items-center gap-1 text-text-quaternary">
          <statusMeta.Icon size={IconSize.XSmall} />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            className="uppercase tracking-wide"
          >
            {statusMeta.label}
          </Typography>
        </FlexRow>
      );
    }

    if (isLove) {
      return (
        <Typography
          bold
          type={TypographyType.Caption1}
          className="shrink-0 text-accent-cabbage-default"
        >
          Just for love
        </Typography>
      );
    }

    return (
      <Typography
        bold
        type={TypographyType.Title4}
        className="shrink-0 origin-right tabular-nums text-status-success transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none"
      >
        +{formatDonationAmount(action.points)}
      </Typography>
    );
  };

  const content: ReactNode = (
    <>
      <FlexRow className="items-start justify-between gap-3">
        <FlexRow className="min-w-0 items-center gap-2.5">
          <span
            className={classNames(
              'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-12 transition-transform duration-200',
              // The tile is always light, so pin the icon ink dark: colored brand
              // logos keep their baked-in colors, while monochrome/semantic glyphs
              // (which follow currentColor) stay visible instead of disappearing
              // as white-on-white in dark mode.
              isDimmed
                ? 'bg-surface-float text-text-quaternary opacity-40 grayscale'
                : 'shadow-1 bg-white text-black group-hover:scale-105',
            )}
          >
            <PlatformLogo
              logoUrl={logoUrl}
              Icon={Icon}
              forceDark={forceDark}
              isDimmed={isDimmed}
            />
          </span>
          <FlexRow className="min-w-0 items-center gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
              className="min-w-0 truncate uppercase tracking-wider"
            >
              {platformName}
            </Typography>
            {showRemaining && (
              <span className="shrink-0 rounded-6 border border-border-subtlest-tertiary px-1.5 py-0.5 font-bold uppercase tracking-wide text-text-tertiary typo-caption2">
                {remaining} left
              </span>
            )}
          </FlexRow>
        </FlexRow>
        {renderTopRightMeta()}
      </FlexRow>

      <Typography
        bold
        tag={TypographyTag.H3}
        type={TypographyType.Callout}
        color={isDimmed ? TypographyColor.Quaternary : undefined}
        className={classNames('line-clamp-2', isDone && 'line-through')}
      >
        {action.title}
      </Typography>

      {action.description && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="mt-auto line-clamp-2"
        >
          {action.description}
        </Typography>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        aria-label={
          isLove
            ? `Show some love: ${action.title}`
            : `Submit proof for ${action.title}`
        }
        onClick={() => onSubmit?.(action)}
        className={classNames(
          'group relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-16 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none',
          isLove
            ? 'bg-accent-cabbage-flat'
            : 'bg-surface-float hover:bg-surface-hover',
        )}
      >
        {/* Glossy sheen that sweeps across on hover — a small reward flourish. */}
        <span
          aria-hidden
          className="via-white/10 pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
        />
        {content}
      </button>
    );
  }

  // Acted on or cooling down: a flat, non-interactive tile. "Done" gets the
  // dashed claimed outline; in-review and cooldown keep a solid surface so they
  // read as temporary rather than finished.
  return (
    <FlexCol
      aria-label={`${action.title} — ${statusMeta?.label ?? ''}`}
      className={classNames(
        'h-full w-full gap-3 rounded-16 p-4',
        isDone
          ? 'border border-dashed border-border-subtlest-tertiary bg-transparent'
          : 'bg-surface-float',
      )}
    >
      {content}
    </FlexCol>
  );
};
