import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { startupsLavenderWash } from '../../../../styles/custom';
import type { StartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { formatBoostCredits } from '../../lib/plans';
import { StartupsReachChart } from '../StartupsReachChart';

interface StarterUpgradeProps {
  name: string;
  offer: StartupsStarterOffer;
  checkoutUrl: string;
  onClick?: () => void;
  className?: string;
}

/** The one block on a free company page that sells the plan, once the free boost is over */
export const StarterUpgrade = ({
  name,
  offer,
  checkoutUrl,
  onClick,
  className,
}: StarterUpgradeProps): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-4 rounded-16 p-4 tablet:flex-row tablet:items-center tablet:p-5',
      className,
    )}
    style={{ background: startupsLavenderWash }}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-bold typo-body">
          {`Get ${formatBoostCredits(offer.monthlyCredits)} in boost credits every month`}
        </h3>
        <p className="text-pretty text-text-secondary typo-footnote">
          {`Your free boost is over. On a plan, ${name} gets credits to boost every month, feed placement by topic, and SEO and AI visibility, so each post builds on the last.`}
        </p>
      </div>
      <Button
        tag="a"
        href={checkoutUrl}
        onClick={onClick}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="self-start"
      >
        Upgrade your plan
      </Button>
    </div>
    <StartupsReachChart
      moreLabel="On a plan"
      lessLabel="On Free"
      curve="compound"
      className="w-full shrink-0 tablet:w-44"
    />
  </div>
);
