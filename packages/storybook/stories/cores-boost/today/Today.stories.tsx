import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import type { RequestHandler } from 'msw';
import WalletPage from '../../../../webapp/pages/wallet';
import CoresPage from '../../../../webapp/pages/cores/index';
import { BuyCoresModal } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import { BoostPostModal } from '@dailydotdev/shared/src/features/boost/BoostPostModal';
import { BoostNewPostStrip } from '@dailydotdev/shared/src/features/boost/BoostNewPostStrip';
import { AdsDashboardModal } from '@dailydotdev/shared/src/features/boost/AdsDashboardModal';
import { StartupsBuyCoresPromo } from '@dailydotdev/shared/src/features/squads/components/promos/StartupsPromo';
import { ActionSuccessModal } from '@dailydotdev/shared/src/components/modals/utils/ActionSuccessModal';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { boostDocsLink } from '@dailydotdev/shared/src/lib/constants';
import { boostSuccessCover } from '@dailydotdev/shared/src/lib/image';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { CoresProviders, noop, productionFlags } from '../real/providers';
import { coresHandlers } from '../real/handlers';
import {
  DailyQuestsPage,
  HomeFeedPage,
  NotificationsPage,
  PostPage,
  bunPost,
  ownArticle,
  questHandlers,
  samPost,
} from '../real/pages';
import { boostablePost } from '../real/screens';
import {
  AwardModal,
  awardTile,
  buttonWith,
  ClickThrough,
  coffee,
  Processing,
  routeTo,
} from './production';
import {
  firstQuestReward,
  landedPurchase,
  readQuest,
  receiveHistory,
  walletHandlers,
  walletHistory,
} from '../flows/cores/fixtures';
import {
  allCampaigns,
  campaignTotals,
  ciPost,
  endedCampaign,
  liveCampaign,
} from '../flows/after-boost/fixtures';

// Today, 100% production: the screen production shows at each step of the
// six flows, for the Today column of "Redesign/0. Today vs redesign". Only
// production components and pages; where the redesign adds a screen, the
// story shows what production shows at that moment instead.

const { default_cores: defaultCores, default_days: defaultDays } =
  productionFlags.boost_settings as {
    default_cores: number;
    default_days: number;
  };
const defaultBoost = defaultCores * defaultDays;

/** Dana's own post as production shows it, with the new-post strip */
const OwnPost = ({
  post = boostablePost,
  isNew = true,
  children,
}: {
  post?: Post;
  isNew?: boolean;
  children?: ReactNode;
}): ReactElement => (
  <PostPage
    post={ownArticle(post, isNew)}
    banner={isNew && <BoostNewPostStrip />}
  >
    {children}
  </PostPage>
);

/** Production BoostPostModal's buy screen: BuyCoresModal as it opens it */
const BoostBuyCores = ({ balance }: { balance: number }): ReactElement => {
  const missing = Math.max(0, defaultBoost - balance);

  return (
    <BuyCoresModal
      isOpen
      product={null}
      minCoresToBuy={missing || undefined}
      onCompletion={noop}
      onRequestClose={noop}
      amountNeededCopy={
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          You need <strong>{missing.toLocaleString()} more Cores</strong> to
          boost the post.
        </Typography>
      }
      promo={<StartupsBuyCoresPromo />}
      origin={Origin.BoostPost}
    />
  );
};

/** Production BoostPostModal's success screen */
const BoostIsLiveModal = (): ReactElement => (
  <ActionSuccessModal
    isOpen
    onRequestClose={noop}
    cta={{ copy: 'Track performance', onClick: noop }}
    secondaryCta={{
      copy: 'Learn more about boosting',
      tag: 'a',
      href: boostDocsLink,
      target: '_blank',
    }}
    content={{
      title: 'Boost is live!',
      description: 'Your post is now live and reaching more developers!',
      cover: boostSuccessCover,
    }}
    modalCloseButtonProps={{ variant: ButtonVariant.Tertiary }}
  />
);

const campaignHandlers = (campaigns: Campaign[]): RequestHandler[] => [
  graphql.query('CampaignsList', () =>
    HttpResponse.json({
      data: {
        campaignsList: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          edges: campaigns.map((node) => ({ cursor: node.id, node })),
        },
      },
    }),
  ),
  graphql.query('UserCampaignStats', () =>
    HttpResponse.json({
      data: {
        userCampaignStats: campaigns.length
          ? { ...campaignTotals, newMembers: 0 }
          : { spend: 0, impressions: 0, users: 0, clicks: 0, newMembers: 0 },
      },
    }),
  ),
];

const meta: Meta = {
  title: 'Cores & Boost/Today (production)',
  parameters: { layout: 'fullscreen' },
  beforeEach: () => routeTo('/'),
};

export default meta;

type Story = StoryObj;

const screen = ({
  balance,
  handlers,
  activePage = '/',
  render,
}: {
  balance: number;
  handlers?: RequestHandler[];
  activePage?: string;
  render: () => ReactElement;
}): Omit<Story, 'name'> => ({
  parameters: {
    msw: { handlers: handlers ?? coresHandlers({ balance }) },
  },
  render: () => (
    <CoresProviders balance={balance} activePage={activePage}>
      {render()}
    </CoresProviders>
  ),
});

// 1. First Cores

export const FirstCoresQuestReward: Story = {
  name: '1 · Quest reward',
  ...screen({
    balance: 0,
    activePage: '/daily-quests',
    handlers: [...questHandlers(readQuest), ...walletHandlers(0, [])],
    render: () => <DailyQuestsPage />,
  }),
};

export const FirstCoresAfterClaim: Story = {
  name: '1 · After the claim',
  ...screen({
    balance: 20,
    activePage: '/daily-quests',
    handlers: [
      ...questHandlers(readQuest, true),
      ...walletHandlers(20, [firstQuestReward]),
    ],
    render: () => <DailyQuestsPage />,
  }),
};

export const FirstCoresWallet: Story = {
  name: '1 · Wallet',
  ...screen({
    balance: 20,
    activePage: '/wallet',
    handlers: walletHandlers(20, [firstQuestReward]),
    render: () => <WalletPage />,
  }),
  beforeEach: () => routeTo('/wallet'),
};

export const FirstCoresOwnPost: Story = {
  name: '1 · Own post',
  ...screen({
    balance: 5400,
    activePage: `/posts/${bunPost.id}`,
    render: () => <OwnPost post={bunPost} />,
  }),
};

// 2. Give an award

export const AwardPickedTooExpensive: Story = {
  name: '2 · Award you can’t afford',
  ...screen({
    balance: 20,
    activePage: `/posts/${samPost.id}`,
    render: () => (
      <AwardModal>
        <ClickThrough targets={[awardTile(coffee.name)]} />
      </AwardModal>
    ),
  }),
};

export const AwardBuyCores: Story = {
  name: '2 · Buy Cores',
  ...screen({
    balance: 20,
    activePage: `/posts/${samPost.id}`,
    render: () => (
      <>
        <PostPage post={samPost} />
        <BuyCoresModal
          isOpen
          onRequestClose={noop}
          onCompletion={noop}
          product={coffee}
          origin={Origin.Award}
        />
      </>
    ),
  }),
};

export const AwardProcessingTimedOut: Story = {
  name: '2 · Processing timed out',
  ...screen({
    balance: 20,
    activePage: `/posts/${samPost.id}`,
    render: () => (
      <>
        <PostPage post={samPost} />
        <Processing step="PROCESSING_ERROR" origin={Origin.Award} cores={300} />
      </>
    ),
  }),
};

export const AwardNote: Story = {
  name: '2 · Note and send',
  ...screen({
    balance: 100,
    activePage: `/posts/${samPost.id}`,
    render: () => (
      <AwardModal>
        <ClickThrough targets={[awardTile(coffee.name)]} />
      </AwardModal>
    ),
  }),
};

export const AwardSent: Story = {
  name: '2 · Award sent',
  ...screen({
    balance: 100,
    activePage: `/posts/${samPost.id}`,
    render: () => (
      <AwardModal>
        <ClickThrough
          targets={[awardTile(coffee.name), buttonWith('Send Award')]}
        />
      </AwardModal>
    ),
  }),
};

export const AwardOldIos: Story = {
  name: '2 · Old iOS build',
  ...screen({
    balance: 20,
    activePage: `/posts/${samPost.id}`,
    render: () => (
      <AwardModal>
        <ClickThrough targets={[awardTile(coffee.name)]} />
      </AwardModal>
    ),
  }),
  // An iOS build without in-app purchase: webkit handlers, but not IAP
  beforeEach: () => {
    const runtime = window as unknown as { webkit?: unknown };
    const { webkit } = runtime;
    runtime.webkit = { messageHandlers: {} };
    document.documentElement.classList.add('ios');

    return () => {
      runtime.webkit = webkit;
      document.documentElement.classList.remove('ios');
    };
  },
};

// 3. Receive an award

export const ReceiveNotification: Story = {
  name: '3 · Award notification',
  ...screen({
    balance: 20,
    activePage: '/notifications',
    handlers: walletHandlers(20, receiveHistory),
    render: () => <NotificationsPage />,
  }),
  beforeEach: () => routeTo('/notifications'),
};

export const ReceiveWallet: Story = {
  name: '3 · Wallet, balance from boot',
  ...screen({
    balance: 20,
    activePage: '/wallet',
    handlers: walletHandlers(20, receiveHistory),
    render: () => <WalletPage />,
  }),
  beforeEach: () => routeTo('/wallet'),
};

// 4. Wallet and buying

const WALLET_BALANCE = 1275;

export const WalletWaysIn: Story = {
  name: '4 · Ways in',
  ...screen({
    balance: WALLET_BALANCE,
    activePage: '/notifications',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => <NotificationsPage />,
  }),
  beforeEach: () => routeTo('/notifications'),
};

export const Wallet: Story = {
  name: '4 · Wallet',
  ...screen({
    balance: WALLET_BALANCE,
    activePage: '/wallet',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => <WalletPage />,
  }),
  beforeEach: () => routeTo('/wallet'),
};

export const Cores: Story = {
  name: '4 · /cores',
  ...screen({
    balance: WALLET_BALANCE,
    activePage: '/cores',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => <CoresPage />,
  }),
  beforeEach: () => routeTo('/cores', { origin: Origin.WalletPageCTA }),
};

export const CoresPurchased: Story = {
  name: '4 · You got your Cores!',
  ...screen({
    balance: WALLET_BALANCE + landedPurchase.value,
    activePage: '/cores',
    handlers: walletHandlers(WALLET_BALANCE, walletHistory),
    render: () => (
      <>
        <CoresPage />
        <Processing
          step="COMPLETED"
          origin={Origin.WalletPageCTA}
          cores={landedPurchase.value}
        />
      </>
    ),
  }),
  beforeEach: () => routeTo('/cores', { origin: Origin.WalletPageCTA }),
};

export const CoresGotItHome: Story = {
  name: '4 · Got it: the homepage',
  ...screen({
    balance: WALLET_BALANCE + landedPurchase.value,
    handlers: walletHandlers(
      WALLET_BALANCE + landedPurchase.value,
      walletHistory,
    ),
    render: () => <HomeFeedPage />,
  }),
};

// 5. First boost

const newPost = {
  ...boostablePost,
  id: 'sb-new-post',
  createdAt: new Date().toISOString(),
  tags: [],
} as Post;

export const BoostOwnPost: Story = {
  name: '5 · Own post',
  ...screen({
    balance: 20,
    activePage: `/posts/${boostablePost.id}`,
    render: () => <OwnPost />,
  }),
};

export const BoostOwnPostOlder: Story = {
  name: '5 · Own post, a few days old',
  ...screen({
    balance: 20,
    activePage: `/posts/${boostablePost.id}`,
    render: () => <OwnPost isNew={false} />,
  }),
};

export const BoostForm: Story = {
  name: '5 · Boost your post',
  ...screen({
    balance: 20,
    activePage: `/posts/${boostablePost.id}`,
    render: () => (
      <OwnPost>
        <BoostPostModal
          isOpen
          onRequestClose={noop}
          post={boostablePost}
          origin={Origin.PostBoostButton}
        />
      </OwnPost>
    ),
  }),
};

export const BoostFormNewPost: Story = {
  name: '5 · Boost your post, new post',
  ...screen({
    balance: 20,
    activePage: `/posts/${newPost.id}`,
    render: () => (
      <OwnPost post={newPost}>
        <BoostPostModal
          isOpen
          onRequestClose={noop}
          post={newPost}
          origin={Origin.PostBoostButton}
        />
      </OwnPost>
    ),
  }),
};

export const BoostBuy: Story = {
  name: '5 · Buy Cores',
  ...screen({
    balance: 20,
    activePage: `/posts/${boostablePost.id}`,
    render: () => (
      <OwnPost>
        <BoostBuyCores balance={20} />
      </OwnPost>
    ),
  }),
};

export const BoostProcessingTimedOut: Story = {
  name: '5 · Processing timed out',
  ...screen({
    balance: 20,
    activePage: `/posts/${boostablePost.id}`,
    render: () => (
      <OwnPost>
        <Processing
          step="PROCESSING_ERROR"
          origin={Origin.BoostPost}
          cores={55000}
        />
      </OwnPost>
    ),
  }),
};

export const BoostBackToForm: Story = {
  name: '5 · Back to the form',
  ...screen({
    balance: 55020,
    activePage: `/posts/${boostablePost.id}`,
    render: () => (
      <OwnPost>
        <BoostPostModal
          isOpen
          onRequestClose={noop}
          post={boostablePost}
          origin={Origin.PostBoostButton}
        />
      </OwnPost>
    ),
  }),
};

export const BoostIsLive: Story = {
  name: '5 · Boost is live!',
  ...screen({
    balance: 5020,
    activePage: `/posts/${boostablePost.id}`,
    render: () => (
      <OwnPost>
        <BoostIsLiveModal />
      </OwnPost>
    ),
  }),
};

// 6. After the boost

const AFTER_BALANCE = 5000;

const dashboard = (campaigns: Campaign[], initialCampaign?: Campaign) =>
  screen({
    balance: AFTER_BALANCE,
    handlers: [
      ...campaignHandlers(campaigns),
      ...coresHandlers({ balance: AFTER_BALANCE }),
    ],
    render: () => (
      <>
        <HomeFeedPage />
        <AdsDashboardModal
          isOpen
          onRequestClose={noop}
          initialCampaign={initialCampaign}
        />
      </>
    ),
  });

export const AdsDashboard: Story = {
  name: '6 · Ads dashboard',
  ...dashboard(allCampaigns),
};

export const AdsDashboardEmpty: Story = {
  name: '6 · Ads dashboard, no boosts',
  ...dashboard([]),
};

export const CampaignLive: Story = {
  name: '6 · Campaign',
  ...dashboard(allCampaigns, liveCampaign),
};

export const CampaignEnded: Story = {
  name: '6 · Campaign, ended',
  ...dashboard(allCampaigns, endedCampaign),
};

export const BoostNotifications: Story = {
  name: '6 · Boost notifications',
  ...screen({
    balance: AFTER_BALANCE,
    activePage: '/notifications',
    render: () => <NotificationsPage />,
  }),
  beforeEach: () => routeTo('/notifications'),
};

export const BoostAgain: Story = {
  name: '6 · Boost again',
  ...screen({
    balance: AFTER_BALANCE,
    activePage: `/posts/${ciPost.id}`,
    render: () => (
      <OwnPost post={ciPost} isNew={false}>
        <BoostPostModal
          isOpen
          onRequestClose={noop}
          post={ciPost}
          origin={Origin.PostBoostButton}
        />
      </OwnPost>
    ),
  }),
};
