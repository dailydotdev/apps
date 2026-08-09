import type { MouseEvent, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  OpenLinkIcon,
  ShareIcon,
  UpvoteIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { Ad } from '../../../graphql/posts';
import type { Deal } from '../types';
import { DealState } from '../types';
import type { DealComment } from '../mockCommunity';
import { getDealComments } from '../mockCommunity';
import { mockDeals } from '../mockDeals';
import { dealsPageAd } from '../mockDealsAds';
import {
  DEAL_CLAIM_CTA_LABEL,
  dealTypeToLabel,
  DEAL_AFFILIATE_DISCLOSURE,
  DEAL_NO_COMMISSION_DISCLOSURE,
  formatCompactNumber,
  formatDealDate,
  getDealBrandPath,
  getDealCategoryPath,
  getDealCoverMedia,
  getDealDirectAnswer,
  getDealFacts,
  getDealPath,
  getDealSavingPhrase,
  getRankedDealCaveats,
  getSimilarDeals,
} from '../dealsFormat';
import { useNowTick } from '../useNowTick';
import { DealBrandLogo, DealBrandTileSize } from './DealBrandLogo';
import { DealCoverImage } from './DealCoverImage';
import { DealBadge } from './DealBadge';
import { DealValueBadge } from './DealValueBadge';
import { DealCoresCost } from './DealCoresCost';
import { DealCaveatStrip } from './DealCaveatStrip';
import { DealCaveats } from './DealCaveats';
import { DealClaimBy } from './DealClaimBy';
import { DealRedemptionNote } from './DealRedemptionNote';
import { DealCodeReveal } from './DealCodeReveal';
import { DealUnlockOptions } from './DealUnlockOptions';
import { DealVerification } from './DealVerification';
import { DealAnsweredQuestions } from './DealAnsweredQuestions';
import { DealBoostMeter } from './DealBoostMeter';
import { DealsAdPanel } from './DealsAdPanel';

export enum DealContentPresentation {
  Modal = 'modal',
  Page = 'page',
}

const SIMILAR_DEALS_LIMIT = 4;
const CLAIM_CAVEAT_LIMIT = 3;

export interface DealContentProps {
  deal: Deal;
  presentation: DealContentPresentation;
  /** The page's single paid slot. Display inventory, never a deal. */
  ad?: Ad;
  now?: number;
  comments?: DealComment[];
  similarDeals?: Deal[];
  isSignedIn?: boolean;
  isClaimedByMe?: boolean;
  isUpvoted?: boolean;
  hasEnded?: boolean;
  titleId?: string;
  onClaim?: (deal: Deal) => void;
  onJoin?: () => void;
  onUpvote?: (deal: Deal) => void;
  onCodeFeedback?: (worked: boolean) => void;
  onSelectDeal?: (deal: Deal) => void;
  shareBar?: ReactNode;
  className?: string;
}

interface SectionProps {
  title: string;
  headingTag: TypographyTag.H2 | TypographyTag.H3;
  children: ReactNode;
  action?: ReactNode;
}

const Section = ({
  title,
  headingTag,
  children,
  action,
}: SectionProps): ReactElement => (
  <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
    <div className="flex items-center justify-between gap-3">
      <Typography tag={headingTag} type={TypographyType.Title3} bold>
        {title}
      </Typography>
      {action}
    </div>
    {children}
  </section>
);

interface ClaimAreaProps {
  deal: Deal;
  isEnded: boolean;
  isSignedIn: boolean;
  isClaimedByMe: boolean;
  onClaim?: (deal: Deal) => void;
  onJoin?: () => void;
  onCodeFeedback?: (worked: boolean) => void;
}

const ClaimControl = ({
  deal,
  isEnded,
  isSignedIn,
  isClaimedByMe,
  onClaim,
  onJoin,
  onCodeFeedback,
}: ClaimAreaProps): ReactElement => {
  if (isEnded) {
    return (
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        This one closed before you got here. Live deals in the same category are
        listed below.
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
          aria-live="polite"
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

  if (deal.state === DealState.Locked) {
    return (
      <DealUnlockOptions
        deal={deal}
        onUnlock={isSignedIn ? onClaim : () => onJoin?.()}
      />
    );
  }

  if (!isSignedIn) {
    return (
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        onClick={() => onJoin?.()}
        className="w-full tablet:w-fit"
      >
        {DEAL_CLAIM_CTA_LABEL}
      </Button>
    );
  }

  if (deal.code) {
    return (
      <DealCodeReveal
        code={deal.code}
        revealLabel={DEAL_CLAIM_CTA_LABEL}
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
      size={ButtonSize.Large}
      onClick={() => onClaim?.(deal)}
      className="w-full tablet:w-fit"
    >
      {DEAL_CLAIM_CTA_LABEL}
    </Button>
  );
};

export const DealContent = ({
  deal,
  presentation,
  ad,
  now,
  comments,
  similarDeals,
  isSignedIn = true,
  isClaimedByMe = false,
  isUpvoted = false,
  hasEnded,
  titleId,
  onClaim,
  onJoin,
  onUpvote,
  onCodeFeedback,
  onSelectDeal,
  shareBar,
  className,
}: DealContentProps): ReactElement => {
  const currentMs = useNowTick(now);
  const isPage = presentation === DealContentPresentation.Page;
  const isEnded = hasEnded ?? deal.state === DealState.Expired;
  const isMuted = isEnded || deal.state === DealState.SoldOut;
  const titleTag = isPage ? TypographyTag.H1 : TypographyTag.H2;
  const headingTag = isPage ? TypographyTag.H2 : TypographyTag.H3;
  const subHeadingTag = isPage ? TypographyTag.H3 : TypographyTag.H4;
  const dealPath = getDealPath(deal);
  const cover = getDealCoverMedia(deal);
  const savingPhrase = getDealSavingPhrase(deal.value);
  const quotations = comments ?? getDealComments(deal.id);
  const related =
    similarDeals ?? getSimilarDeals(deal, mockDeals, SIMILAR_DEALS_LIMIT);
  const termsHeadingTag = getRankedDealCaveats(deal).length
    ? subHeadingTag
    : headingTag;
  const upvotes = deal.community.upvotes + (isUpvoted ? 1 : 0);
  const metadata = [dealTypeToLabel[deal.type], deal.categories[0]]
    .filter(Boolean)
    .join(' · ');
  const disclosure = deal.isCommissioned
    ? DEAL_AFFILIATE_DISCLOSURE
    : DEAL_NO_COMMISSION_DISCLOSURE;

  const onRelatedClick = (
    event: MouseEvent<HTMLAnchorElement>,
    target: Deal,
  ): void => {
    if (!onSelectDeal) {
      return;
    }

    event.preventDefault();
    onSelectDeal(target);
  };

  const relatedSection = related.length > 0 && (
    <Section
      title={isEnded ? 'Live deals like this one' : 'Similar deals'}
      headingTag={headingTag}
    >
      <ul className="flex flex-col">
        {related.map((similar) => (
          <li key={similar.id}>
            <Link href={getDealPath(similar)} passHref>
              <a
                href={getDealPath(similar)}
                onClick={(event) => onRelatedClick(event, similar)}
                className="-mx-2 flex items-center gap-3 rounded-10 px-2 py-2 hover:bg-surface-hover"
              >
                <DealBrandLogo brand={similar.brand} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Callout}
                    bold
                    truncate
                  >
                    {similar.title}
                  </Typography>
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    {similar.brand.name}
                  </Typography>
                </span>
                <DealValueBadge value={similar.value} />
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );

  return (
    <article
      className={classNames(
        'flex w-full flex-col',
        isPage ? 'gap-8' : 'gap-6',
        className,
      )}
    >
      <header className={classNames('flex flex-col gap-3', !isPage && 'pr-10')}>
        <div className="flex items-center gap-3">
          <DealBrandLogo
            brand={deal.brand}
            isMuted={isMuted}
            size={DealBrandTileSize.Cover}
          />
          <div className="flex min-w-0 flex-1 flex-col">
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
          </div>
          <DealBadge deal={deal} now={currentMs} />
        </div>

        <Typography
          tag={titleTag}
          type={isPage ? TypographyType.Title1 : TypographyType.Title2}
          id={titleId}
          bold
        >
          {isPage ? (
            deal.title
          ) : (
            <Link href={dealPath} passHref>
              <a className="hover:underline">{deal.title}</a>
            </Link>
          )}
        </Typography>

        <div className="flex flex-wrap items-center gap-2">
          <DealValueBadge value={deal.value} isMuted={isMuted} />
          {deal.unlock?.cores && !isMuted && (
            <DealCoresCost cores={deal.unlock.cores} />
          )}
          {savingPhrase && !isMuted && (
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
      </header>

      <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        {!isMuted && <DealCaveatStrip deal={deal} limit={CLAIM_CAVEAT_LIMIT} />}
        <ClaimControl
          deal={deal}
          isEnded={isEnded}
          isSignedIn={isSignedIn}
          isClaimedByMe={isClaimedByMe}
          onClaim={onClaim}
          onJoin={onJoin}
          onCodeFeedback={onCodeFeedback}
        />
        {!isMuted && <DealRedemptionNote deal={deal} />}
        {!isMuted && <DealClaimBy deal={deal} />}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {shareBar ?? (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ShareIcon />}
          >
            Share
          </Button>
        )}
        {!isPage && (
          <Link href={dealPath} passHref>
            <a className="flex items-center gap-1 text-text-link typo-footnote">
              <OpenLinkIcon size={IconSize.XSmall} />
              Open the full deal page
            </a>
          </Link>
        )}
      </div>

      {isEnded && relatedSection}

      <Section title="What you get" headingTag={headingTag}>
        {cover && (
          <DealCoverImage
            media={cover}
            brand={deal.brand}
            isMuted={isMuted}
            isEager
            showCaption
            className="aspect-[3/1] max-h-48"
          />
        )}
        <Typography tag={TypographyTag.P} type={TypographyType.Body}>
          {getDealDirectAnswer(deal, currentMs)}
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {deal.description}
        </Typography>
        {deal.whyPick && (
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            {deal.whyPick}
          </Typography>
        )}
      </Section>

      <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
        <DealCaveats deal={deal} headingTag={headingTag} />
        <Typography
          tag={termsHeadingTag}
          type={
            termsHeadingTag === headingTag
              ? TypographyType.Title3
              : TypographyType.Callout
          }
          bold
        >
          Terms at a glance
        </Typography>
        <table className="w-full table-fixed border-collapse text-left">
          <tbody>
            {getDealFacts(deal).map(({ label, value }) => (
              <tr
                key={label}
                className="border-b border-border-subtlest-tertiary"
              >
                <th
                  scope="row"
                  className="py-2 pr-4 align-top font-normal text-text-tertiary typo-footnote"
                >
                  {label}
                </th>
                <td className="py-2 align-top text-text-primary typo-footnote">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {deal.terms}
        </Typography>
        {deal.isCommunityPick && (
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            Community picks are chosen on merit. Sponsors never influence them.
          </Typography>
        )}
      </section>

      <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6">
        <DealVerification
          deal={deal}
          now={currentMs}
          headingTag={headingTag}
          action={
            onUpvote && (
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={
                  <UpvoteIcon size={IconSize.XSmall} secondary={isUpvoted} />
                }
                onClick={() => onUpvote(deal)}
                pressed={isUpvoted}
                aria-label={`Upvote the ${deal.brand.name} deal, ${upvotes} upvotes`}
                className="tabular-nums"
              >
                {formatCompactNumber(upvotes)}
              </Button>
            )
          }
        />
        {deal.boost && <DealBoostMeter boost={deal.boost} compact />}
      </section>

      {quotations.length > 0 && (
        <Section title="What developers reported" headingTag={headingTag}>
          <ul className="flex flex-col gap-4">
            {quotations.map((comment) => (
              <li key={comment.id}>
                <blockquote className="border-l-2 border-border-subtlest-tertiary pl-3 text-text-primary typo-callout">
                  {comment.body}
                </blockquote>
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                  className="pl-3 pt-1"
                >
                  <cite className="not-italic">
                    {comment.author} ({comment.handle})
                  </cite>{' '}
                  on daily.dev,{' '}
                  <time dateTime={comment.createdAt}>
                    {formatDealDate(comment.createdAt)}
                  </time>
                </Typography>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <DealAnsweredQuestions
        deal={deal}
        now={currentMs}
        headingTag={headingTag}
        className="border-t border-border-subtlest-tertiary pt-6"
      />

      <Section title="Where this offer comes from" headingTag={headingTag}>
        <ul className="flex flex-col gap-2 text-text-link typo-footnote">
          <li>
            <a
              href={deal.partnerUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
            >
              {deal.brand.name} offer page on {deal.brand.domain}
            </a>
          </li>
          <li>
            <Link href={getDealBrandPath(deal.brand)} passHref>
              <a>All {deal.brand.name} deals on daily.dev</a>
            </Link>
          </li>
          {deal.categories.map((category) => (
            <li key={category}>
              <Link href={getDealCategoryPath(category)} passHref>
                <a>{category} deals on daily.dev</a>
              </Link>
            </li>
          ))}
        </ul>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {disclosure}
        </Typography>
      </Section>

      {isPage && <DealsAdPanel ad={ad ?? dealsPageAd} />}

      {!isEnded && relatedSection}
    </article>
  );
};
