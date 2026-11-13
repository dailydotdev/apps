import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  ArrowIcon,
  CoreIcon,
  DocsIcon,
  FeedbackIcon,
  InfoIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';
import { boostDashboardInfo } from '@dailydotdev/shared/src/features/boost/common';
import {
  boostDocsLink,
  creatorsTermsOfService,
} from '@dailydotdev/shared/src/lib/constants';
import { clicksInfo } from '../../flows/after-boost/CampaignView';

// The squads page frame (`SquadPageLayout`, `SquadDiscoverFrame`): the page is
// one bordered card from laptop, with a w-80 column of `SquadWidget`s beside
// it. Below laptop the card loses its border and the widgets follow it.

export const SquadFrame = ({
  children,
  aside,
}: {
  children: ReactNode;
  aside: ReactNode;
}): ReactElement => (
  <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
    <main className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:self-start laptop:overflow-hidden laptop:rounded-16 laptop:border">
      {children}
    </main>
    <aside className="flex w-full flex-col gap-4 px-4 pb-6 pt-2 tablet:px-6 laptop:w-80 laptop:shrink-0 laptop:p-0">
      {aside}
    </aside>
  </div>
);

interface StatProps {
  label: string;
  value: number;
  info: string;
  icon?: ReactNode;
}

/** `DataTile`'s label, info tooltip and value, in the widget's compact size */
export const StatTile = ({
  label,
  value,
  info,
  icon,
}: StatProps): ReactElement => (
  <div className="flex min-w-0 flex-col gap-0.5 rounded-12 bg-surface-float px-3 py-2.5">
    <span className="flex items-center gap-1 text-text-tertiary typo-caption1">
      {label}
      <Tooltip content={info} enableMobileClick>
        <span className="text-text-disabled">
          <InfoIcon size={IconSize.Size16} />
        </span>
      </Tooltip>
    </span>
    <span className="flex min-w-0 items-center gap-1 font-bold tabular-nums typo-title3">
      {icon}
      {formatDataTileValue(value)}
    </span>
  </div>
);

export interface Totals {
  spend: number;
  impressions: number;
  users: number;
  clicks: number;
}

export const StatsGrid = ({
  totals,
  className,
}: {
  totals: Totals;
  className?: string;
}): ReactElement => (
  <div className={classNames('grid grid-cols-2 gap-2', className)}>
    <StatTile
      label="Spend"
      value={totals.spend}
      info={boostDashboardInfo.spend}
      icon={<CoreIcon size={IconSize.Small} />}
    />
    <StatTile
      label="Impressions"
      value={totals.impressions}
      info={boostDashboardInfo.impressions}
    />
    <StatTile
      label="Users"
      value={totals.users}
      info={boostDashboardInfo.users}
    />
    <StatTile label="Clicks on post" value={totals.clicks} info={clicksInfo} />
  </div>
);

const HelpRow = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}): ReactElement => (
  <a
    href={href}
    target="_blank"
    rel="noopener"
    className="-mx-2 flex items-center gap-3 rounded-12 px-2 py-2 text-text-primary transition-colors hover:bg-surface-hover"
  >
    <span className="flex size-8 items-center justify-center rounded-10 bg-surface-float text-text-secondary">
      {icon}
    </span>
    <span className="flex-1 font-bold typo-callout">{label}</span>
    <ArrowIcon size={IconSize.Small} className="rotate-90 text-text-tertiary" />
  </a>
);

/** Docs and Terms, the links production keeps in the page's side widget */
export const HelpWidget = (): ReactElement => (
  <SquadWidget title="Boosting help">
    <div className="mt-2 flex flex-col">
      <HelpRow href={boostDocsLink} icon={<FeedbackIcon />} label="Docs" />
      <HelpRow
        href={creatorsTermsOfService}
        icon={<DocsIcon />}
        label="Terms"
      />
    </div>
  </SquadWidget>
);
