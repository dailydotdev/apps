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
import type { StartupsPromo } from '../../hooks/useStartupsPromo';
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

/** "$245 in boost credits", with Starter's own amount struck out during the launch offer */
const MonthlyCredits = ({ promo }: { promo: StartupsPromo }): ReactElement => (
  <>
    <Struck
      was={
        promo.launchOffer &&
        formatBoostCredits(promo.launchOffer.monthlyCredits)
      }
    >
      {formatBoostCredits(promo.monthlyCredits)}
    </Struck>{' '}
    in boost credits
  </>
);

/** The strip on top of a promo while the launch offer is on */
const LaunchOfferBanner = ({
  promo,
}: {
  promo: StartupsPromo;
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
    href={promo.checkoutUrl}
    variant={variant}
    size={ButtonSize.Small}
    className={className}
    onClick={promo.onClick}
  >
    See plans
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
  children,
}: {
  promo: StartupsPromo;
  className?: string;
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
    <LaunchOfferBanner promo={promo} />
    <CloseButton
      size={ButtonSize.XSmall}
      className={classNames(
        'absolute right-1.5',
        promo.launchOffer ? 'top-0' : 'top-1.5',
      )}
      aria-label="Don't show this offer again"
      onClick={promo.onDismiss}
    />
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

/** Spot 1: the boost post and boost squad modals, under the budget. */
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
  });

  if (!promo.isShown) {
    return null;
  }

  return (
    <Card promo={promo}>
      <div className="flex items-start gap-3 p-3 pr-4">
        <CoresBadge />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Title>
            Get <MonthlyCredits promo={promo} /> every month
          </Title>
          <Body>
            {promo.squad
              ? `Put ${promo.squad.name} on Starter for ${promo.starterPrice} a month and use them to boost its posts.`
              : `Boosting for your company? Starter is ${promo.starterPrice} a month and comes with a company page.`}
          </Body>
        </div>
        <SeePlans
          promo={promo}
          variant={ButtonVariant.Secondary}
          className="shrink-0 self-center"
        />
      </div>
    </Card>
  );
};

/** Spot 2: Buy Cores, only when a boost opened it. */
export const StartupsBuyCoresPromo = ({
  sourceId,
  isPersonalAllowed,
  className,
}: {
  sourceId?: string;
  /** False on the Buy Cores page, where most people buy to give awards */
  isPersonalAllowed?: boolean;
  className?: string;
}): ReactElement | null => {
  const promo = useStartupsPromo({
    spot: StartupsPromoSpot.BuyCores,
    sourceId,
    isPersonalAllowed,
  });

  if (!promo.isShown) {
    return null;
  }

  const name = promo.squad?.name;

  return (
    <Card promo={promo} className={className}>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <CoresBadge />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Title>
              Or get <MonthlyCredits promo={promo} /> every month
            </Title>
            <Body>
              {name
                ? `daily.dev for Startups is ${promo.starterPrice} a month. The credits land in ${name}'s wallet, and ${name} becomes a company page with weekly intel.`
                : `daily.dev for Startups is ${promo.starterPrice} a month. The credits land in your company's wallet, with a company page and weekly intel.`}
            </Body>
          </div>
        </div>
        <SeePlans
          promo={promo}
          variant={ButtonVariant.Secondary}
          className="w-full"
        />
      </div>
    </Card>
  );
};

/** Spot 3: the wallet page, beside the Plus Cores card. */
export const StartupsWalletPromo = ({
  className,
}: {
  className?: string;
}): ReactElement | null => {
  // Only for people who run a squad: most wallet visitors give awards
  const promo = useStartupsPromo({
    spot: StartupsPromoSpot.Wallet,
    isPersonalAllowed: false,
  });

  if (!promo.isShown) {
    return null;
  }

  return (
    <Card
      promo={promo}
      className={classNames('bg-background-default', className)}
      style={{
        backgroundImage:
          'radial-gradient(90% 70% at 100% 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 16%, transparent) 0%, transparent 70%)',
      }}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <CoresBadge isLarge />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Typography type={TypographyType.Body} bold>
              Get <MonthlyCredits promo={promo} /> every month with daily.dev
              for Startups
            </Typography>
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {`Starter is ${promo.starterPrice} a month. The credits go to ${
                promo.squad?.name ?? 'your company'
              }'s wallet for boosts, with a company page and weekly intel.`}
            </Typography>
          </div>
        </div>
        <SeePlans promo={promo} className="w-full" />
      </div>
    </Card>
  );
};

/** Spot 4: the ads dashboard, for anyone who has boosted. */
export const StartupsAdsDashboardPromo = ({
  spend,
}: {
  /** Cores spent on boosts, all time */
  spend: number;
}): ReactElement | null => {
  const promo = useStartupsPromo({ spot: StartupsPromoSpot.AdsDashboard });

  if (!promo.isShown || !spend) {
    return null;
  }

  return (
    <Card promo={promo} className="shrink-0">
      <div className="flex flex-col gap-3 p-4 tablet:flex-row tablet:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CoresBadge />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Title>{`You've spent ${largeNumberFormat(spend)} Cores on boosts`}</Title>
            <Body>
              {`Starter is ${promo.starterPrice} a month and gives `}
              <MonthlyCredits promo={promo} />
              {' every month.'}
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

/**
 * Spot 6: under the two ways to start in the new squad modal. The modal runs
 * the hook, since it shrinks its art to make room.
 */
export const StartupsNewSquadModalPromo = ({
  promo,
}: {
  promo: StartupsPromo;
}): ReactElement | null => {
  if (!promo.isShown) {
    return null;
  }

  return (
    <Card promo={promo} className="w-full text-left">
      <div className="flex items-center gap-3 p-3 pr-4">
        <CoresBadge />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Title>For your company?</Title>
          <Body>
            Company page, weekly intel and <MonthlyCredits promo={promo} />{' '}
            every month.
          </Body>
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
