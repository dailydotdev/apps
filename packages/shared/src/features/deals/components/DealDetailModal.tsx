import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useId, useRef } from 'react';
import CloseButton from '../../../components/CloseButton';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  InviteIcon,
  LockIcon,
  OpenLinkIcon,
  ShareIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { Deal } from '../types';
import { DealState, DealType } from '../types';
import { mockDeals } from '../mockDeals';
import { getDealComments } from '../mockCommunity';
import {
  dealTypeToCtaLabel,
  dealTypeToLabel,
  DEAL_AFFILIATE_DISCLOSURE,
  DEAL_NO_COMMISSION_DISCLOSURE,
  formatDealRelative,
  getDealCoverMedia,
  getDealSavingPhrase,
  getMonogram,
  getSimilarDeals,
} from '../dealsFormat';
import { useNowTick } from '../useNowTick';
import { DealBrandLogo } from './DealBrandLogo';
import { DealCoverImage } from './DealCoverImage';
import { DealBadge } from './DealBadge';
import { DealValueBadge } from './DealValueBadge';
import { DealCaveats } from './DealCaveats';
import { DealRedemptionNote } from './DealRedemptionNote';
import { DealCommunityProof } from './DealCommunityProof';
import { DealCodeReveal } from './DealCodeReveal';

interface DealDetailModalProps {
  deal: Deal;
  onClose: () => void;
  onClaim?: (deal: Deal) => void;
  onOpenDeal?: (deal: Deal) => void;
  onCodeFeedback?: (worked: boolean) => void;
  isClaimedByMe?: boolean;
  now?: number;
  shareBar?: ReactNode;
}

const typeToCtaIcon: Partial<Record<DealType, ReactElement>> = {
  [DealType.Affiliate]: <OpenLinkIcon />,
  [DealType.Exclusive]: <LockIcon />,
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const getFocusable = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.offsetParent !== null,
  );

const SectionTitle = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    tag={TypographyTag.H3}
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
    className="uppercase tracking-wider"
  >
    {children}
  </Typography>
);

const DealClaimArea = ({
  deal,
  onClaim,
  onCodeFeedback,
  isClaimedByMe,
}: Pick<
  DealDetailModalProps,
  'deal' | 'onClaim' | 'onCodeFeedback' | 'isClaimedByMe'
>): ReactElement => {
  if (deal.state === DealState.Expired) {
    return (
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="rounded-12 bg-surface-float px-3 py-2"
      >
        This one closed. Live deals in the same category are further down.
      </Typography>
    );
  }

  if (deal.state === DealState.SoldOut) {
    return (
      <Button type="button" variant={ButtonVariant.Float} disabled>
        All claimed
      </Button>
    );
  }

  if (isClaimedByMe) {
    return (
      <div className="flex flex-col gap-2">
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.StatusSuccess}
          className="flex items-center gap-2"
        >
          <VIcon size={IconSize.XSmall} secondary />
          Saved to My coupons.
        </Typography>
        {deal.code && (
          <DealCodeReveal
            code={deal.code}
            revealLabel="Show code"
            onFeedback={onCodeFeedback}
          />
        )}
      </div>
    );
  }

  if (deal.state === DealState.Locked && deal.lock) {
    const remaining = Math.max(
      0,
      deal.lock.invitesRequired - deal.lock.invitesDone,
    );

    return (
      <div className="flex flex-col gap-2 rounded-12 bg-surface-float p-3">
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="flex items-center gap-2"
        >
          <LockIcon size={IconSize.XSmall} secondary />
          Invite {remaining} more developer{remaining === 1 ? '' : 's'} to
          unlock this offer.
        </Typography>
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          icon={<InviteIcon />}
          onClick={() => onClaim?.(deal)}
          className="w-fit"
        >
          Invite to unlock
        </Button>
      </div>
    );
  }

  if (deal.code) {
    return (
      <DealCodeReveal
        code={deal.code}
        revealLabel={dealTypeToCtaLabel[deal.type]}
        onReveal={() => onClaim?.(deal)}
        onFeedback={onCodeFeedback}
      />
    );
  }

  return (
    <Button
      tag="a"
      href={deal.partnerUrl}
      target="_blank"
      rel="sponsored nofollow noopener"
      variant={ButtonVariant.Primary}
      icon={typeToCtaIcon[deal.type]}
      onClick={() => onClaim?.(deal)}
      className="w-fit"
    >
      {dealTypeToCtaLabel[deal.type]}
    </Button>
  );
};

const SimilarDealRow = ({
  deal,
  onOpenDeal,
}: {
  deal: Deal;
  onOpenDeal?: (deal: Deal) => void;
}): ReactElement => (
  <button
    type="button"
    onClick={() => onOpenDeal?.(deal)}
    className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-2 text-left hover:bg-surface-hover"
  >
    <DealBrandLogo brand={deal.brand} />
    <div className="flex flex-1 flex-col">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        bold
        truncate
      >
        {deal.title}
      </Typography>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {deal.brand.name}
      </Typography>
    </div>
    <DealValueBadge value={deal.value} />
  </button>
);

export const DealDetailModal = ({
  deal,
  onClose,
  onClaim,
  onOpenDeal,
  onCodeFeedback,
  isClaimedByMe,
  now,
  shareBar,
}: DealDetailModalProps): ReactElement => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();

        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusable = getFocusable(dialogRef.current);

      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();

        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isOutside = !dialogRef.current.contains(active);

      if (event.shiftKey && (isOutside || active === first)) {
        event.preventDefault();
        last.focus();

        return;
      }

      if (!event.shiftKey && (isOutside || active === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    globalThis.addEventListener('keydown', onKeyDown);

    return () => globalThis.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const currentMs = useNowTick(now);
  const isMuted =
    deal.state === DealState.Expired || deal.state === DealState.SoldOut;
  const similarDeals = getSimilarDeals(deal, mockDeals);
  const comments = getDealComments(deal.id);
  const cover = getDealCoverMedia(deal);
  const savingPhrase = getDealSavingPhrase(deal.value);
  const metadata = [dealTypeToLabel[deal.type], deal.categories[0]]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center tablet:p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close the deal details"
        onClick={onClose}
        className="absolute inset-0 size-full cursor-default bg-overlay-quaternary-onion"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-1 flex h-full max-h-full w-full max-w-2xl flex-col overflow-hidden border-border-subtlest-secondary bg-background-default shadow-2 tablet:h-auto tablet:max-h-[min(calc(100vh-5rem),44rem)] tablet:rounded-16 tablet:border"
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 tablet:p-6">
          <header className="flex items-start gap-4 pr-10">
            <DealBrandLogo
              brand={deal.brand}
              isMuted={isMuted}
              className="size-14 rounded-16"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                bold
                truncate
              >
                {deal.brand.name}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="tabular-nums"
              >
                {metadata}
                {deal.pool &&
                  ` · ${deal.pool.left} of ${deal.pool.total} cards left`}
              </Typography>
              <div className="flex flex-wrap items-center gap-2">
                <DealValueBadge value={deal.value} isMuted={isMuted} />
                {savingPhrase && (
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                    className="tabular-nums"
                  >
                    {savingPhrase}
                  </Typography>
                )}
              </div>
            </div>
          </header>

          {cover && (
            /* The dialog caps at 44rem and the claim CTA sits below the hero,
               so the cover is capped rather than given its full 3:1 height. */
            <DealCoverImage
              media={cover}
              brand={deal.brand}
              isMuted={isMuted}
              isEager
              showCaption
              className="aspect-[3/1] max-h-40"
            />
          )}

          <div className="flex flex-col gap-2">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title2}
              id={titleId}
              bold
            >
              {deal.title}
            </Typography>
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              {deal.description}
            </Typography>
          </div>

          {deal.whyPick && (
            <div className="flex flex-col gap-2 rounded-12 bg-surface-float p-3">
              <SectionTitle>Why the community rates this</SectionTitle>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
              >
                {deal.whyPick}
              </Typography>
            </div>
          )}

          <DealBadge deal={deal} now={currentMs} />

          {!isMuted && (
            <DealCaveats deal={deal} headingTag={TypographyTag.H3} />
          )}

          <DealClaimArea
            deal={deal}
            onClaim={onClaim}
            onCodeFeedback={onCodeFeedback}
            isClaimedByMe={isClaimedByMe}
          />

          {!isMuted && <DealRedemptionNote deal={deal} />}

          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            {deal.isCommissioned
              ? DEAL_AFFILIATE_DISCLOSURE
              : DEAL_NO_COMMISSION_DISCLOSURE}
          </Typography>

          {shareBar ?? (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ShareIcon />}
              className="w-fit"
            >
              Share
            </Button>
          )}

          <details className="rounded-12 bg-surface-float px-3 py-2">
            <summary className="cursor-pointer font-bold text-text-tertiary typo-footnote">
              Terms
            </summary>
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="pt-2"
            >
              {deal.terms}
            </Typography>
            {deal.isCommunityPick && (
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="pt-2"
              >
                Community picks are chosen on merit. Sponsors never influence
                them.
              </Typography>
            )}
          </details>

          <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-4">
            <DealCommunityProof
              community={deal.community}
              isMuted={isMuted}
              now={currentMs}
            />
            <ul className="flex flex-col gap-3">
              {comments.map((comment) => (
                <li key={comment.id} className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-float font-bold text-text-tertiary typo-caption2">
                    {getMonogram(comment.author)}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <Typography
                        tag={TypographyTag.Span}
                        type={TypographyType.Footnote}
                        bold
                      >
                        {comment.author}
                      </Typography>
                      <Typography
                        tag={TypographyTag.Span}
                        type={TypographyType.Caption1}
                        color={TypographyColor.Quaternary}
                      >
                        {comment.handle}{' '}
                        <time dateTime={comment.createdAt}>
                          {formatDealRelative(comment.createdAt, currentMs)}
                        </time>
                      </Typography>
                    </div>
                    <Typography
                      tag={TypographyTag.P}
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {comment.body}
                    </Typography>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {similarDeals.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-border-subtlest-tertiary pt-4">
              <SectionTitle>Similar deals</SectionTitle>
              {similarDeals.map((similar) => (
                <SimilarDealRow
                  key={similar.id}
                  deal={similar}
                  onOpenDeal={onOpenDeal}
                />
              ))}
            </div>
          )}
        </div>

        <CloseButton
          type="button"
          size={ButtonSize.Small}
          onClick={onClose}
          className="absolute right-4 top-4 z-1"
        />
      </div>
    </div>
  );
};
