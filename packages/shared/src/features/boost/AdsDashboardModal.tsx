import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../components/modals/common/Modal';
import type { ModalProps } from '../../components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import TabList, { TabListVariant } from '../../components/tabs/TabList';
import { defaultStats, useCampaigns } from './useCampaigns';
import { BoostHistoryLoading } from './BoostHistoryLoading';
import { BoostedViewModal } from './BoostedViewModal';
import { CampaignList } from './CampaignList';
import { CampaignStatsGrid } from './CampaignListView';
import type { Campaign } from '../../graphql/campaigns';
import { getUserCampaignStats } from '../../graphql/campaigns';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

interface AdsDashboardModalProps extends ModalProps {
  initialCampaign?: Campaign;
}

enum BoostsTab {
  Active = 'Active',
  Past = 'Past',
}

const emptyCopy: Record<BoostsTab, { title: string; description: string }> = {
  [BoostsTab.Active]: {
    title: 'No active boosts',
    description:
      'Boost a post from its menu, or your Squad from its page, to reach more developers.',
  },
  [BoostsTab.Past]: {
    title: 'No past boosts yet',
    description: 'Finished and stopped boosts show up here with their results.',
  },
};

const Label = ({ children }: { children: string }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

/** Every boost the user started, with all-time results on top. */
export function AdsDashboardModal({
  initialCampaign,
  ...props
}: AdsDashboardModalProps): ReactElement {
  const { user } = useAuthContext();
  const { data, isLoading, infiniteScrollingProps } = useCampaigns();
  const { data: stats = defaultStats } = useQuery({
    queryKey: generateQueryKey(RequestKey.Campaigns, user, 'stats'),
    queryFn: getUserCampaignStats,
    staleTime: StaleTime.Default,
    enabled: !!user,
    placeholderData: defaultStats,
  });
  const [boosted, setBoosted] = useState(initialCampaign);
  const [tab, setTab] = useState<BoostsTab>();
  const list = useMemo(
    () =>
      data?.pages.flatMap((page) => page.edges.map((edge) => edge.node)) ?? [],
    [data],
  );
  const activeList = list.filter(({ state }) => state === 'ACTIVE');
  // Open on what is running, or on the history when nothing is.
  const activeTab =
    tab ?? (isLoading || activeList.length ? BoostsTab.Active : BoostsTab.Past);
  const tabList =
    activeTab === BoostsTab.Active
      ? activeList
      : list.filter(({ state }) => state !== 'ACTIVE');

  if (boosted) {
    return (
      <BoostedViewModal
        {...props}
        campaign={boosted}
        isLoading={isLoading}
        onBack={() => setBoosted(undefined)}
        onRequestClose={props.onRequestClose}
      />
    );
  }

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header title="Boosts" closeOnPhone />
      <Modal.Body className="flex flex-col gap-6 overflow-x-hidden">
        <div className="flex flex-col gap-2">
          <Label>All time</Label>
          <CampaignStatsGrid
            spend={stats.spend}
            users={stats.users}
            impressions={stats.impressions}
            members={stats.newMembers}
          />
        </div>
        <div className="flex flex-col gap-3">
          <TabList<BoostsTab>
            items={Object.values(BoostsTab).map((label) => ({ label }))}
            active={activeTab}
            onClick={setTab}
            variant={TabListVariant.Bordered}
          />
          {isLoading ? (
            <BoostHistoryLoading />
          ) : (
            <CampaignList
              list={tabList}
              onClick={setBoosted}
              infiniteScrollingProps={infiniteScrollingProps}
              emptyTitle={emptyCopy[activeTab].title}
              emptyDescription={emptyCopy[activeTab].description}
            />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default AdsDashboardModal;
