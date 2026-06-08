import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { IconSize } from '../../../components/Icon';
import type { GivebackAction, GivebackUserAction } from '../types';
import { GivebackUserActionStatus } from '../types';
import { formatCompactNumber, formatDonationAmount } from '../utils';
import { actionPlatformVisual } from '../actionPlatform';
import { LinkIcon, StarIcon, TimerIcon, VIcon } from '../../../components/icons';
import { GivebackContributorFaces } from './GivebackContributorFaces';

interface ActionCardProps {
  action: GivebackAction;
  userAction?: GivebackUserAction;
  onSubmit?: (action: GivebackAction) => void;
}

const getStatus = (userAction?: GivebackUserAction): GivebackUserActionStatus =>
  userAction?.status ?? GivebackUserActionStatus.NotStarted;

// One sharp, explicit title carries the ask — no competing subtitle. The
// supporting details (payout, social proof, "Popular") sit in a calm top/bottom
// frame around it so the card stays easy to scan at a glance.
export const ActionCard = ({
  action,
  userAction,
  onSubmit,
}: ActionCardProps): ReactElement => {
  const status = getStatus(userAction);
  const isCompleted =
    status === GivebackUserActionStatus.Approved ||
    status === GivebackUserActionStatus.CountedTowardGoal;
  const isInReview =
    status === GivebackUserActionStatus.Submitted ||
    status === GivebackUserActionStatus.PendingReview ||
    status === GivebackUserActionStatus.AutoValidating;
  // "Done" = you've already acted on it, so it locks into a flat, dimmed claimed
  // state. Everything else (including expired/rejected) stays clickable to retry.
  const isDone = isCompleted || isInReview;
  // Every actionable (not-yet-done) card is clickable — including "just for
  // love" ones, which open a compliant appreciation view instead of the proof
  // flow (they carry no reward/donation).
  const isInteractive = !isDone && !!onSubmit;
  // Every platform is mapped, but fall back to a neutral link glyph so a card
  // can never render a blank tile if a new platform slips through unmapped.
  const {
    Icon,
    name: platformName,
    forceDark,
  } = actionPlatformVisual[action.platform] ?? {
    Icon: LinkIcon,
    name: 'Link',
  };

  const doneMeta = isCompleted
    ? { label: 'Done', Icon: VIcon }
    : { label: 'In review', Icon: TimerIcon };

  const contributorsCount = action.contributorsCount ?? 0;
  const contributorsLast24h = action.contributorsLast24h ?? 0;

  const content: ReactNode = (
    <>
      <FlexRow className="items-start justify-between gap-3">
        <FlexRow className="min-w-0 items-center gap-2.5">
          <span
            className={classNames(
              'flex size-[2.375rem] shrink-0 items-center justify-center overflow-hidden rounded-12 transition-transform duration-200',
              // The tile is always light, so pin the icon ink dark: colored brand
              // logos keep their baked-in colors, while monochrome/semantic
              // glyphs (which follow currentColor) stay visible instead of
              // disappearing as white-on-white in dark mode.
              isDone
                ? 'bg-surface-float text-text-quaternary opacity-40 grayscale'
                : 'bg-white text-black shadow-1 group-hover:scale-105',
            )}
          >
            <Icon
              secondary
              size={IconSize.Large}
              className={classNames(!isDone && forceDark && 'brightness-0')}
            />
          </span>
          <FlexCol className="min-w-0 gap-1">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
              className="truncate uppercase tracking-wider"
            >
              {platformName}
            </Typography>
            {action.isTrending && (
              <FlexRow className="w-fit items-center gap-1 text-accent-cabbage-default">
                <StarIcon secondary size={IconSize.XXSmall} />
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption2}
                  bold
                  className="uppercase tracking-wide"
                >
                  Popular
                </Typography>
              </FlexRow>
            )}
          </FlexCol>
        </FlexRow>
        {isDone ? (
          <FlexRow className="shrink-0 items-center gap-1 text-text-quaternary">
            <doneMeta.Icon size={IconSize.XSmall} />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              className="uppercase tracking-wide"
            >
              {doneMeta.label}
            </Typography>
          </FlexRow>
        ) : action.isLoveAction ? (
          <Typography
            bold
            type={TypographyType.Caption1}
            className="shrink-0 text-accent-cabbage-default"
          >
            Just for love
          </Typography>
        ) : (
          <Typography
            bold
            type={TypographyType.Title4}
            className="shrink-0 origin-right tabular-nums text-status-success transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none"
          >
            +{formatDonationAmount(action.donationAmount, action.currency)}
          </Typography>
        )}
      </FlexRow>

      <Typography
        bold
        tag={TypographyTag.H3}
        type={TypographyType.Callout}
        color={isDone ? TypographyColor.Quaternary : undefined}
        className={classNames('line-clamp-2', isDone && 'line-through')}
      >
        {action.title}
      </Typography>

      {contributorsCount > 0 && (
        <FlexRow className="mt-auto min-w-0 items-center gap-2">
          <GivebackContributorFaces
            avatars={action.contributorAvatars ?? []}
            totalCount={contributorsCount}
            sizeClassName="size-5"
          />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="min-w-0 truncate"
          >
            {formatCompactNumber(contributorsCount)} contributed
            {contributorsLast24h > 0 &&
              ` · ${formatCompactNumber(contributorsLast24h)} today`}
          </Typography>
        </FlexRow>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        aria-label={
          action.isLoveAction
            ? `Show some love: ${action.title}`
            : `Submit proof for ${action.title}`
        }
        onClick={() => onSubmit?.(action)}
        className={classNames(
          'group relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-16 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none',
          action.isLoveAction
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

  // Already acted on: a flat "claimed" state. No solid fill — just a dashed
  // outline, a grayscale icon, a struck-through title and a vivid status pill —
  // so it's unmistakably distinct from the actionable, tappable cards.
  if (isDone) {
    return (
      <div
        aria-label={`${action.title} — ${doneMeta.label}`}
        className="flex h-full w-full flex-col gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary bg-transparent p-4"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'flex h-full w-full flex-col gap-3 rounded-16 p-4',
        action.isLoveAction ? 'bg-accent-cabbage-flat' : 'bg-surface-float',
      )}
    >
      {content}
    </div>
  );
};
