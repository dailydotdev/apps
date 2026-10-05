import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../../graphql/posts';
import type { AdSquadItem } from '../../../../hooks/useFeed';
import { LogExtraContextProvider } from '../../../../contexts/LogExtraContext';
import { Origin, TargetType } from '../../../../lib/log';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import { combinedClicks } from '../../../../lib/click';
import Link from '../../../utilities/Link';
import { Image, ImageType } from '../../../image/Image';
import EntityCard from '../../entity/EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../typography/Typography';
import { Tooltip } from '../../../tooltip/Tooltip';
import { Separator } from '../../common/common';
import { ButtonSize } from '../../../buttons/common';
import { AdPixel } from '../common/AdPixel';
import { AdViewability } from '../common/AdViewability';
import type { ViewabilityData } from '../../../../features/monetization/viewability';
import { storeSquadBoostClick } from '../../../../features/monetization/squadBoostClick';
import { useScrambler } from '../../../../hooks/useScrambler';
import { hasSquadFeature } from '../../../../features/squads/lib/features';
import { VerifiedSquadBadge } from '../../../../features/squads/components/VerifiedSquad';
import { SquadRow } from '../../../../features/squads/components/widgets/SquadRow';
import { useSquadAd } from './common';
import { SquadAdAction } from './SquadAdAction';

export type SquadAd = AdSquadItem['ad'];

export const isSquadAd = (ad?: Ad | null): ad is SquadAd => !!ad?.data?.source;

interface SquadAdEntityCardProps {
  ad: SquadAd;
  /**
   * Same variants as the post page ad slot it fills, plus `row` for a list of
   * squads in the squad page's right column.
   */
  variant: 'card' | 'inline' | 'row';
  className?: string;
  origin?: Origin;
  onClickAd: () => void;
  onViewable: (data: ViewabilityData) => void;
}

export function SquadAdEntityCard({
  ad,
  variant,
  className,
  origin = Origin.ArticlePage,
  onClickAd,
  onViewable,
}: SquadAdEntityCardProps): ReactElement {
  const { squad, campaign, shouldShowAction, onJustJoined } = useSquadAd({
    ad,
    withMembers: false,
  });
  const promotedText = useScrambler('Promoted');
  const promotedByTooltip = useScrambler(
    campaign ? `Promoted by @${campaign.user.username}` : undefined,
  );
  const { name, handle, image, permalink, description } = squad;

  const onClickCard = () => {
    onClickAd();
    storeSquadBoostClick(ad);
  };
  const cardLink = (
    <Link href={permalink}>
      <a
        href={permalink}
        title={name}
        className="absolute inset-0 z-0"
        {...combinedClicks(onClickCard)}
      />
    </Link>
  );
  const adAction = (
    <SquadAdAction
      squad={squad}
      origin={origin}
      size={ButtonSize.Small}
      shouldShowAction={shouldShowAction}
      onJustJoined={() => onJustJoined(true)}
      copy={variant === 'row' ? { join: 'Join' } : undefined}
    />
  );
  const action = <div className="relative z-1 shrink-0">{adAction}</div>;
  const promotedDetails = (
    <>
      <Tooltip content={promotedByTooltip} visible={!!campaign}>
        <button
          type="button"
          disabled
          className="relative z-1 text-action-comment-default"
        >
          <strong>{promotedText}</strong>
        </button>
      </Tooltip>
      <Separator />
      <span className="min-w-0 shrink truncate">@{handle}</span>
    </>
  );
  const promotedLine = (
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="flex min-w-0 items-center"
    >
      {promotedDetails}
    </Typography>
  );
  const squadName = (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate">{name}</span>
      {hasSquadFeature(squad, 'verified') && <VerifiedSquadBadge />}
    </span>
  );

  return (
    <LogExtraContextProvider
      selector={() => ({
        gen_id: ad.generationId,
        referrer_target_id: ad.data.source.id,
        referrer_target_type: TargetType.Source,
        origin,
      })}
    >
      {variant === 'row' && (
        <SquadRow
          squad={squad}
          details={promotedDetails}
          action={adAction}
          onClick={onClickCard}
        >
          <span className="absolute bottom-0 left-0">
            <AdPixel pixel={ad.pixel} />
          </span>
          <AdViewability ad={ad} onViewable={onViewable} />
        </SquadRow>
      )}
      {variant === 'inline' && (
        <div
          className={classNames(
            'relative flex w-full flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3 transition-colors hover:bg-surface-hover',
            className,
          )}
        >
          {cardLink}
          <div className="flex w-full items-center gap-3">
            <Image
              src={image}
              alt={`${name} source`}
              type={ImageType.Squad}
              className="size-10 shrink-0 rounded-full object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                className="font-medium"
              >
                {squadName}
              </Typography>
              {promotedLine}
            </div>
            {action}
          </div>
          {description && (
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              className="line-clamp-2"
            >
              {description}
            </Typography>
          )}
          <span className="absolute bottom-0 left-0">
            <AdPixel pixel={ad.pixel} />
          </span>
          <AdViewability ad={ad} onViewable={onViewable} />
        </div>
      )}
      {variant === 'card' && (
        <EntityCard
          image={image}
          type="squad"
          entityName={name}
          className={{
            container: classNames('relative', className),
            image: 'size-10 rounded-full',
          }}
          actionButtons={action}
        >
          {cardLink}
          <div className="mt-3 flex w-full flex-col gap-2">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              bold
            >
              {squadName}
            </Typography>
            {promotedLine}
            {description && (
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="line-clamp-3"
              >
                {description}
              </Typography>
            )}
            <div className="flex items-center text-text-tertiary">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {largeNumberFormat(squad.membersCount ?? 0)} Members
              </Typography>
              <Separator />
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {largeNumberFormat(squad.flags?.totalUpvotes ?? 0)} Upvotes
              </Typography>
            </div>
          </div>
          <AdPixel pixel={ad.pixel} />
          <AdViewability ad={ad} onViewable={onViewable} />
        </EntityCard>
      )}
    </LogExtraContextProvider>
  );
}
