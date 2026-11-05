import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { PageWidgets } from '@dailydotdev/shared/src/components/utilities/common';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  boostDocsLink,
  creatorsTermsOfService,
} from '@dailydotdev/shared/src/lib/constants';
import {
  ArrowIcon,
  CoreIcon,
  DocsIcon,
  FeedbackIcon,
} from '@dailydotdev/shared/src/components/icons';
import { ListCardDivider } from '@dailydotdev/shared/src/components/cards/common/Card';
import { WidgetContainer } from '@dailydotdev/shared/src/components/widgets/common';
import TabList from '@dailydotdev/shared/src/components/tabs/TabList';
import { CampaignList } from '@dailydotdev/shared/src/features/boost/CampaignList';
import {
  BoostStatus,
  CampaignListItem,
} from '@dailydotdev/shared/src/features/boost/CampaignListItem';
import { boostDashboardInfo } from '@dailydotdev/shared/src/features/boost/common';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { CampaignState } from '@dailydotdev/shared/src/graphql/campaigns';
import { CampaignView, clicksInfo } from './CampaignView';
import { allCampaigns, campaignTotals } from './fixtures';

// /boosts and /boosts/[id]: the ads dashboard and campaign modals as pages,
// laid out like the wallet page (`webapp/pages/wallet.tsx`), so the Boosting
// button, wallet boost rows and the profile menu can link to them. Storybook
// has no app shell, so the tablet header shows at every width.

const pageClassName =
  'm-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0';

const PageFrame = ({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className={pageClassName}>
    <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-border-subtlest-tertiary">
      <header className="flex min-h-14 items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-4 py-2">
        {header}
      </header>
      <div className="flex flex-col gap-6 p-4 tablet:p-6">{children}</div>
    </main>
    <PageWidgets className="flex gap-4 py-4">
      <WidgetContainer className="flex flex-col">
        <div className="flex justify-around p-4">
          <Button
            tag="a"
            target="_blank"
            rel="noopener"
            href={boostDocsLink}
            icon={<FeedbackIcon />}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
          >
            Docs
          </Button>
          <ListCardDivider className="mx-3" />
          <Button
            tag="a"
            target="_blank"
            rel="noopener"
            href={creatorsTermsOfService}
            icon={<DocsIcon />}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
          >
            Terms
          </Button>
        </div>
      </WidgetContainer>
    </PageWidgets>
  </div>
);

const Divider = (): ReactElement => (
  <div className="h-px w-full bg-border-subtlest-tertiary" />
);

const noScroll = {
  fetchNextPage: async () => undefined,
  canFetchMore: false,
  isFetchingNextPage: false,
};

enum BoostsTab {
  Live = 'Live',
  Ended = 'Ended',
}

interface BoostsPageProps {
  campaigns?: Campaign[];
  onOpenCampaign?: (campaign: Campaign) => void;
}

export function BoostsPage({
  campaigns = allCampaigns,
  onOpenCampaign,
}: BoostsPageProps): ReactElement {
  const live = campaigns.filter(({ state }) => state === CampaignState.Active);
  const ended = campaigns.filter(({ state }) => state !== CampaignState.Active);
  const [tab, setTab] = useState(
    live.length ? BoostsTab.Live : BoostsTab.Ended,
  );
  const labelOf = (name: BoostsTab, count: number) => `${name} (${count})`;
  const tabs = [
    { name: BoostsTab.Live, list: live },
    { name: BoostsTab.Ended, list: ended },
  ];
  const active = tabs.find(({ name }) => name === tab);

  return (
    <PageFrame
      header={
        <Typography type={TypographyType.Title3} bold>
          Boosts
        </Typography>
      }
    >
      <section className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
        <DataTile
          label="Spend"
          value={campaignTotals.spend}
          info={boostDashboardInfo.spend}
          icon={<CoreIcon size={IconSize.XSmall} />}
        />
        <DataTile
          label="Impressions"
          value={campaignTotals.impressions}
          info={boostDashboardInfo.impressions}
        />
        <DataTile
          label="Users"
          value={campaignTotals.users}
          info={boostDashboardInfo.users}
        />
        <DataTile
          label="Clicks on post"
          value={campaignTotals.clicks}
          info={clicksInfo}
        />
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <TabList<string>
          tag="button"
          items={tabs.map(({ name, list }) => ({
            label: labelOf(name, list.length),
          }))}
          active={labelOf(active.name, active.list.length)}
          onClick={(label) =>
            setTab(
              label.startsWith(BoostsTab.Live)
                ? BoostsTab.Live
                : BoostsTab.Ended,
            )
          }
        />
        {active.list.length ? (
          <ul className="-mx-4 flex flex-col tablet:-mx-6">
            {active.list.map((campaign) => (
              <li key={campaign.id}>
                <CampaignListItem
                  campaign={campaign}
                  onClick={() => onOpenCampaign?.(campaign)}
                  className="px-4 py-2 tablet:px-6"
                />
              </li>
            ))}
          </ul>
        ) : (
          <CampaignList list={[]} infiniteScrollingProps={noScroll} />
        )}
      </section>
    </PageFrame>
  );
}

interface CampaignPageProps {
  campaign: Campaign;
  onBack?: () => void;
  onStop?: () => void;
  onExtend?: () => void;
  onBoostAgain?: () => void;
}

export function CampaignPage({
  campaign,
  onBack,
  ...actions
}: CampaignPageProps): ReactElement {
  return (
    <PageFrame
      header={
        <>
          <span className="flex flex-row items-center gap-2">
            <Button
              onClick={onBack}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="-rotate-90" />}
              aria-label="Back to Boosts"
            />
            <Typography type={TypographyType.Title3} bold>
              Boost
            </Typography>
          </span>
          <BoostStatus status={campaign.state} />
        </>
      }
    >
      <CampaignView campaign={campaign} {...actions} />
    </PageFrame>
  );
}
