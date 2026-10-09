import type { ReactElement } from 'react';
import React, { useLayoutEffect, useRef } from 'react';
import classNames from 'classnames';
import type { Squad } from '../../../../graphql/sources';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ArrowIcon } from '../../../../components/icons/Arrow';
import { IconSize } from '../../../../components/Icon';
import Link from '../../../../components/utilities/Link';
import { Image, ImageType } from '../../../../components/image/Image';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Separator } from '../../../../components/cards/common/common';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import {
  getFlatteredSources,
  useSources,
} from '../../../../hooks/source/useSources';
import { useViewSize, ViewSize } from '../../../../hooks/useViewSize';
import { squadBannerScrim, squadRailFadeMask } from '../../../../styles/custom';
import { VerifiedSquadBadge } from '../VerifiedSquad';
import { SquadJoinButton } from './SquadJoinButton';
import { PromotedLabel, PromotedSquad } from './PromotedSquad';
import type { usePromotedSquad } from './usePromotedSquad';
import type { SquadRail } from './useSquadRail';
import { useRailAutoAdvance, useSquadRail } from './useSquadRail';
import type { SquadSlot } from './common';
import {
  featuredSquadsQuery,
  getSquadBanner,
  getSquadMembersLabel,
  isVerifiedSquad,
  withPromotedSlot,
} from './common';

// The Featured area: a mosaic of blocks on tablet and up, a banner rail on
// phones. Featured squads are the only cards with a banner, the promoted
// campaign takes the second tile, and every card joins in place.

const SquadName = ({
  squad,
  type,
}: {
  squad: Squad;
  type: TypographyType;
}): ReactElement => {
  const isCompact =
    type === TypographyType.Callout || type === TypographyType.Body;

  return (
    <span className="flex min-w-0 shrink items-center gap-1.5">
      <Typography
        tag={TypographyTag.H3}
        type={type}
        bold
        // Big names wrap to two lines rather than lose their end.
        truncate={isCompact}
        className={classNames(
          'min-w-0 shrink',
          !isCompact && 'line-clamp-2 break-words',
        )}
      >
        {squad.name}
      </Typography>
      {isVerifiedSquad(squad) && (
        <VerifiedSquadBadge className="size-5 shrink-0" />
      )}
    </span>
  );
};

const SquadLink = ({
  squad,
  onClick,
}: {
  squad: Squad;
  onClick?: () => void;
}): ReactElement => (
  <Link href={squad.permalink} passHref>
    <a
      href={squad.permalink}
      aria-label={`Open ${squad.name}`}
      className="absolute inset-0"
      onClick={onClick}
    />
  </Link>
);

const MemberStack = ({ squad }: { squad: Squad }): ReactElement => {
  const members = squad.members?.edges.slice(0, 3) ?? [];

  return (
    <span className="flex items-center gap-2">
      {members.length > 0 && (
        <span className="flex flex-row-reverse justify-end pl-1.5">
          {members
            .slice()
            .reverse()
            .map(({ node }) => (
              <ProfilePicture
                key={node.user.id}
                size={ProfileImageSize.XSmall}
                className="-ml-1.5 ring-2 ring-background-subtle"
                user={node.user}
                nativeLazyLoading
              />
            ))}
        </span>
      )}
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="tabular-nums"
        bold
      >
        {getSquadMembersLabel(squad.membersCount)}
      </Typography>
    </span>
  );
};

// All banner, with the words laid over its foot. Large is a block's lead
// tile, small its companions.
const FeaturedSquadTile = ({
  slot: { squad, ad },
  size,
  className,
}: {
  slot: SquadSlot;
  size: 'large' | 'small';
  className?: string;
}): ReactElement => {
  const isSmall = size === 'small';

  return (
    <PromotedSquad ad={ad}>
      {({ ref, onClickAd, trackers }) => (
        <article
          ref={ref}
          className={classNames(
            'relative isolate flex shrink-0 flex-col justify-end overflow-hidden rounded-24 bg-background-subtle',
            className,
          )}
        >
          <SquadLink squad={squad} onClick={onClickAd} />
          <img
            src={getSquadBanner(squad)}
            alt=""
            loading="lazy"
            className="absolute inset-0 -z-1 size-full object-cover"
          />
          <span
            className="absolute inset-0 -z-1"
            style={{ background: squadBannerScrim }}
          />
          <div
            className={classNames(
              'pointer-events-none relative flex flex-col',
              // One bottom inset for both sizes, so Join lines up in a block.
              isSmall
                ? 'gap-1 p-3 pb-4'
                : 'gap-2 p-5 pb-4 laptop:p-6 laptop:pb-4',
            )}
          >
            {!isSmall && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Secondary}
                bold
                className="uppercase tracking-wider"
              >
                {ad ? 'Promoted' : 'Featured'}
              </Typography>
            )}
            <span className="flex items-center gap-3">
              <Image
                src={squad.image}
                alt={`${squad.name} source`}
                type={ImageType.Squad}
                className={classNames(
                  'shrink-0 rounded-full object-cover ring-2 ring-background-default',
                  isSmall ? 'size-8' : 'size-12',
                )}
              />
              <SquadName
                squad={squad}
                type={isSmall ? TypographyType.Callout : TypographyType.Title2}
              />
            </span>
            {!isSmall && (
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
                className="line-clamp-2 max-w-[36rem]"
              >
                {squad.description}
              </Typography>
            )}
            <span className="pointer-events-auto mt-1 flex items-center justify-between gap-3">
              {isSmall ? (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Secondary}
                  bold
                  truncate
                >
                  {ad ? (
                    <PromotedLabel />
                  ) : (
                    getSquadMembersLabel(squad.membersCount)
                  )}
                </Typography>
              ) : (
                <MemberStack squad={squad} />
              )}
              <SquadJoinButton squad={squad} />
            </span>
          </div>
          {trackers}
        </article>
      )}
    </PromotedSquad>
  );
};

// Square Float arrows at the header buttons' size, blurred so they hold over
// images, on the same edges as the header row above. Phones and tablets swipe.
const RailArrows = ({
  rail,
  onStep,
}: {
  rail: SquadRail;
  onStep: (direction: 1 | -1) => void;
}): ReactElement => {
  const arrow = (direction: 1 | -1) => (
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
      icon={
        <ArrowIcon
          className={direction === -1 ? '-rotate-90' : 'rotate-90'}
          size={IconSize.Medium}
        />
      }
      aria-label={direction === -1 ? 'Previous' : 'Next'}
      onClick={() => onStep(direction)}
      className={classNames(
        'absolute top-1/2 z-2 hidden -translate-y-1/2 shadow-2 backdrop-blur-[1.25rem] laptop:flex',
        direction === -1 ? 'left-0' : 'right-0',
      )}
    />
  );

  return (
    <>
      {!rail.isAtStart && arrow(-1)}
      {!rail.isAtEnd && arrow(1)}
    </>
  );
};

// One big pick beside smaller ones in a block. From laptopL a block holds
// four small tiles in two columns, below it two in one column, so names keep
// their room. Blocks are a little narrower than the page so the next one
// peeks, fading out, and the arrows slide one block at a time.
const FeaturedMosaic = ({ slots }: { slots: SquadSlot[] }): ReactElement => {
  const rail = useSquadRail();
  const section = useRef<HTMLElement>(null);
  const { stop } = useRailAutoAdvance(rail, section);
  const isWide = useViewSize(ViewSize.LaptopL);
  const blockSize = isWide ? 5 : 3;
  // The last block fills up from the start of the rail, without the
  // promoted slot, so a campaign is never shown or counted twice.
  const filler = slots.filter(({ ad }) => !ad);
  const blocks = Array.from(
    { length: Math.ceil(slots.length / blockSize) },
    (_, block) =>
      Array.from({ length: blockSize }, (__, offset) => {
        const index = block * blockSize + offset;

        return slots[index] ?? filler[(index - slots.length) % filler.length];
      }).filter((slot): slot is SquadSlot => !!slot),
  );
  const { ref, onScroll } = rail;

  // Back to the opening block whenever the blocks regroup.
  useLayoutEffect(() => {
    ref.current?.scrollTo({ left: 0 });
    onScroll();
  }, [blockSize, ref, onScroll]);

  return (
    <section ref={section} aria-label="Featured" className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 laptop:-mx-6 laptop:gap-4 laptop:px-6 laptop:[--squad-rail-fade:5rem]"
        style={{
          maskImage: squadRailFadeMask(rail),
          WebkitMaskImage: squadRailFadeMask(rail),
        }}
      >
        {blocks.map(([lead, ...rest], index) => (
          <div
            // Blocks regroup by width, so a block is its position.
            // eslint-disable-next-line react/no-array-index-key
            key={`${blockSize}-${index}`}
            className={classNames(
              'grid h-96 w-[calc(100%-3rem)] shrink-0 snap-center grid-rows-2 gap-3 laptop:h-[26rem] laptop:w-[calc(100%-7rem)] laptop:gap-4',
              isWide ? 'grid-cols-4' : 'grid-cols-3',
            )}
          >
            <FeaturedSquadTile
              slot={lead}
              size="large"
              className="col-span-2 row-span-2"
            />
            {rest.map((slot, position) => (
              <FeaturedSquadTile
                // Fewer squads than tiles wrap around and repeat in a block.
                // eslint-disable-next-line react/no-array-index-key
                key={`${slot.squad.id}-${position}`}
                slot={slot}
                size="small"
              />
            ))}
          </div>
        ))}
      </div>
      <RailArrows
        rail={rail}
        onStep={(direction) => {
          stop();
          rail.scroll(direction);
        }}
      />
    </section>
  );
};

// Phones: wide banners with the squad's icon, name and one meta line under
// each, one and a bit on screen.
const FeaturedBanners = ({ slots }: { slots: SquadSlot[] }): ReactElement => {
  const rail = useSquadRail();
  const section = useRef<HTMLElement>(null);
  useRailAutoAdvance(rail, section);

  return (
    <section ref={section} aria-label="Featured" className="relative">
      <div
        ref={rail.ref}
        onScroll={rail.onScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4"
      >
        {slots.map(({ squad, ad }) => (
          <PromotedSquad key={squad.id} ad={ad}>
            {({ ref, onClickAd, trackers }) => (
              <article
                ref={ref}
                className="relative flex w-[85%] shrink-0 snap-start flex-col gap-3"
              >
                <SquadLink squad={squad} onClick={onClickAd} />
                <img
                  src={getSquadBanner(squad)}
                  alt=""
                  loading="lazy"
                  className="aspect-video w-full rounded-24 bg-background-subtle object-cover"
                />
                <span className="flex items-center gap-3">
                  <Image
                    src={squad.image}
                    alt={`${squad.name} source`}
                    type={ImageType.Squad}
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <SquadName squad={squad} type={TypographyType.Body} />
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      truncate
                    >
                      {!!ad && (
                        <>
                          <PromotedLabel />
                          <Separator />
                        </>
                      )}
                      {getSquadMembersLabel(squad.membersCount)}
                      <Separator />
                      {squad.description}
                    </Typography>
                  </span>
                  <SquadJoinButton squad={squad} />
                </span>
                {trackers}
              </article>
            )}
          </PromotedSquad>
        ))}
      </div>
    </section>
  );
};

const FeaturedSkeleton = (): ReactElement => (
  <div className="-mx-4 flex gap-3 overflow-hidden px-4 laptop:-mx-6 laptop:gap-4 laptop:px-6">
    <ElementPlaceholder className="aspect-video w-[85%] shrink-0 rounded-24 tablet:aspect-auto tablet:h-96 tablet:w-[calc(100%-3rem)] laptop:h-[26rem] laptop:w-[calc(100%-7rem)]" />
    <ElementPlaceholder className="aspect-video w-[85%] shrink-0 rounded-24 tablet:aspect-auto tablet:h-96 tablet:w-[calc(100%-3rem)] laptop:h-[26rem] laptop:w-[calc(100%-7rem)]" />
  </div>
);

export const FeaturedSquads = ({
  promoted,
}: {
  promoted: ReturnType<typeof usePromotedSquad>;
}): ReactElement | null => {
  const { result } = useSources<Squad>({ query: featuredSquadsQuery });
  const isTablet = useViewSize(ViewSize.Tablet);

  if (!result.isFetched || promoted.isLoading) {
    return <FeaturedSkeleton />;
  }

  const slots = withPromotedSlot(getFlatteredSources(result), promoted);

  if (!slots.length) {
    return null;
  }

  return isTablet ? (
    <FeaturedMosaic slots={slots} />
  ) : (
    <FeaturedBanners slots={slots} />
  );
};
