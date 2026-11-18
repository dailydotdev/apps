import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import CloseButton from '../../../../components/CloseButton';
import { CoreIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { largeNumberFormat } from '../../../../lib';
import type {
  StartupsPromo,
  StartupsStarterOffer,
} from '../../hooks/useStartupsPromo';
import { formatBoostCredits, formatCashbackMultiple } from '../../lib/plans';
import {
  StartupsPromoSpot,
  useStartupsPromo,
} from '../../hooks/useStartupsPromo';

const cabbageGlow =
  'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 120px)';

/** The launch promo's value, with the plan's own struck out before it */
const Struck = ({
  was,
  children,
}: {
  was?: string;
  children: ReactNode;
}): ReactElement => (
  <>
    {was && (
      <>
        <s className="font-normal text-text-quaternary">{was}</s>{' '}
      </>
    )}
    {children}
  </>
);

/** "$245 in free boost credits", with Starter's own amount struck out during the launch offer */
export const MonthlyCredits = ({
  promo,
}: {
  promo: StartupsStarterOffer;
}): ReactElement => (
  <>
    <Struck
      was={
        promo.launchOffer &&
        formatBoostCredits(promo.launchOffer.monthlyCredits)
      }
    >
      {formatBoostCredits(promo.monthlyCredits)}
    </Struck>{' '}
    in free boost credits
  </>
);

/** The strip on top of a promo while the launch offer is on */
export const LaunchOfferBanner = ({
  promo,
}: {
  promo: StartupsStarterOffer;
}): ReactElement | null => {
  if (!promo.launchOffer) {
    return null;
  }

  return (
    <div className="bg-overlay-float-cabbage px-3 py-1.5 pr-10 text-accent-cabbage-default typo-caption1">
      <strong>Launch offer</strong>
      {` · ${formatCashbackMultiple(
        promo.cashback,
      )} your plan in boost credits for ${promo.promoLength}`}
    </div>
  );
};

// What a promo leads to without a company page to upgrade
export const FREE_COMPANY_PAGE_BOOST = '$100';

/** "See plans" for a company page, "Create company page" for everyone else */
export const getStartupsPromoAction = (promo: StartupsPromo): string =>
  promo.squad ? 'See plans' : 'Create company page';

const SeePlans = ({
  promo,
  variant = ButtonVariant.Primary,
  className,
}: {
  promo: StartupsPromo;
  variant?: ButtonVariant;
  className?: string;
}): ReactElement => (
  <Button
    tag="a"
    href={promo.href}
    variant={variant}
    size={ButtonSize.Small}
    className={className}
    onClick={promo.onClick}
  >
    {getStartupsPromoAction(promo)}
  </Button>
);

const CoresBadge = ({
  isLarge = false,
}: {
  isLarge?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center bg-overlay-float-cabbage text-accent-cabbage-default',
      isLarge ? 'size-10 rounded-12' : 'size-8 rounded-10',
    )}
  >
    <CoreIcon size={isLarge ? IconSize.Medium : IconSize.Small} />
  </span>
);

/**
 * Every promotion: the launch offer banner, and an X that hides them all.
 */
const Card = ({
  promo,
  className,
  style = { background: cabbageGlow },
  isDismissible = true,
  children,
}: {
  promo: StartupsPromo;
  className?: string;
  /** False for a spot that shows even after a dismissed promo */
  isDismissible?: boolean;
  style?: React.CSSProperties;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex min-w-0 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary',
      className,
    )}
    style={style}
  >
    {promo.squad && <LaunchOfferBanner promo={promo} />}
    {isDismissible && (
      <CloseButton
        size={ButtonSize.XSmall}
        className={classNames(
          'absolute right-1.5',
          promo.squad && promo.launchOffer ? 'top-0' : 'top-1.5',
        )}
        aria-label="Don't show this offer again"
        onClick={promo.onDismiss}
      />
    )}
    {children}
  </div>
);

const Title = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography type={TypographyType.Callout} bold>
    {children}
  </Typography>
);

const Body = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    tag={TypographyTag.P}
    type={TypographyType.Footnote}
    color={TypographyColor.Secondary}
  >
    {children}
  </Typography>
);

/** Spot 1: the boost post and boost squad modals, under the budget. Like the
 * Plus deal, it has no close button, so it shows even after a dismissed promo */
export const StartupsBoostPromo = ({
  sourceId,
  isSquadBoost = false,
}: {
  sourceId?: string;
  isSquadBoost?: boolean;
}): ReactElement | null => {
  const promo = useStartupsPromo({
    spot: isSquadBoost
      ? StartupsPromoSpot.BoostSquad
      : StartupsPromoSpot.BoostPost,
    sourceId,
    isDismissible: false,
  });

  if (!promo.isShown) {
    return null;
  }

  return (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded-16 border border-border-subtlest-secondary p-3">
      {promo.squad && promo.launchOffer && (
        <span className="absolute -right-9 top-3 w-32 rotate-45 bg-accent-onion-default py-0.5 text-center font-bold text-white typo-caption2">
          {formatCashbackMultiple(promo.cashback)} value
        </span>
      )}
      <span className="flex items-center gap-2 pr-12">
        <CoresBadge />
        <span className="flex min-w-0 flex-1 flex-col">
          <strong className="typo-callout">
            {promo.squad ? (
              <>
                Get <MonthlyCredits promo={promo} /> every month
              </>
            ) : (
              'Boosting for your startup?'
            )}
          </strong>
          <span className="text-text-tertiary typo-caption1">
            {promo.squad
              ? `Upgrade ${promo.squad.name} to the Startup plan for ${promo.starterPrice} a month and use them to boost its posts.`
              : `Create a free company page. We boost its first post with ${FREE_COMPANY_PAGE_BOOST} in credits.`}
          </span>
        </span>
      </span>
      <Button
        tag="a"
        href={promo.href}
        variant={ButtonVariant.Secondary}
        size={ButtonSize.XSmall}
        onClick={promo.onClick}
      >
        {getStartupsPromoAction(promo)}
      </Button>
    </div>
  );
};

/** Spot 4: the ads dashboard, for anyone who has boosted. */
export const StartupsAdsDashboardPromo = ({
  spend,
}: {
  /** Cores spent on boosts, all time */
  spend: number;
}): ReactElement | null => {
  const promo = useStartupsPromo({
    spot: StartupsPromoSpot.AdsDashboard,
    isDismissible: false,
  });

  if (!promo.isShown || !spend) {
    return null;
  }

  return (
    <Card promo={promo} className="shrink-0" isDismissible={false}>
      <div className="flex flex-col gap-3 p-4 tablet:flex-row tablet:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CoresBadge />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Title>{`You've spent ${largeNumberFormat(spend)} Cores on boosts`}</Title>
            <Body>
              {promo.squad ? (
                <>
                  {`Upgrade ${promo.squad.name} to the Startup plan for ${promo.starterPrice} a month, with `}
                  <MonthlyCredits promo={promo} />
                  {' every month.'}
                </>
              ) : (
                `If you're boosting for your startup, create a free company page. We boost its first post with ${FREE_COMPANY_PAGE_BOOST} in credits.`
              )}
            </Body>
          </div>
        </div>
        <SeePlans
          promo={promo}
          variant={ButtonVariant.Secondary}
          className="shrink-0"
        />
      </div>
    </Card>
  );
};
