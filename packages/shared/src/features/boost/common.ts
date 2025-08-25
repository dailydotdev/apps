import classed from '../../lib/classed';

export const boostDashboardInfo = {
  impressions:
    'The total number of times your boosted posts were shown to users',
  users: 'The total number of unique users that has seen your boosted post',
  spend: 'The total number of cores spent so far',
};

export const CampaignListViewContainer = classed(
  'div',
  'flex flex-row items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-2 pl-3',
);
