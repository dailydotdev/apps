import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import type { StartupsStarterOffer } from '../../hooks/useStartupsPromo';
import { MonthlyCredits } from '../promos/StartupsPromo';

interface StarterUpgradeProps {
  name: string;
  offer: StartupsStarterOffer;
  checkoutUrl: string;
  onClick?: () => void;
  className?: string;
}

const Benefit = ({ children }: { children: ReactNode }): ReactElement => (
  <li className="flex items-start gap-2 text-text-secondary typo-callout">
    <VIcon
      size={IconSize.Size16}
      className="mt-0.5 shrink-0 text-accent-cabbage-default"
    />
    <span className="min-w-0 flex-1">{children}</span>
  </li>
);

/** The one block on a free company page that sells Starter */
export const StarterUpgrade = ({
  name,
  offer,
  checkoutUrl,
  onClick,
  className,
}: StarterUpgradeProps): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-3 rounded-12 bg-overlay-float-cabbage p-4',
      className,
    )}
  >
    <h3 className="font-bold typo-body">
      {`With Starter, ${name} reaches more developers:`}
    </h3>
    <ul className="flex flex-col gap-2">
      <Benefit>In developers&apos; feeds, by topic</Benefit>
      <Benefit>On Google and in AI answers</Benefit>
      <Benefit>
        <MonthlyCredits promo={offer} /> every month
      </Benefit>
    </ul>
    <Button
      tag="a"
      href={checkoutUrl}
      onClick={onClick}
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className="self-start"
    >
      Keep the reach going
    </Button>
  </div>
);
