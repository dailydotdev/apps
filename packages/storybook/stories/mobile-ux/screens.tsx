import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { BrowserChrome, Phone } from './kit';
import {
  CommentList,
  CreateSheet,
  Dim,
  ExploreHub,
  Fab,
  FeedList,
  HeadlineRows,
  PageBar,
  PostArticle,
  ProposedHomeHeader,
  ProposedPostBar,
  ProposedTagHeader,
  Screen,
  TabSet,
  TodayChips,
  TodayEngagementPill,
  TodayHeadlinesHeader,
  TodayLogoRow,
  TodayPostBar,
  TodaySearchHeader,
  TodayTabBar,
  TodayTagHeader,
  YouHub,
} from './mocks';
import { posts } from './data';
import { BarMaterial } from './floating';
import { ExploreCluster, RootCluster } from './chrome';

// Roots draw the floating cluster from chapter 3b; the docked ProposedTabBar
// only survives in chapter 3 as today’s model, for the record.
const Floating = ({
  active = 'Home',
  explore,
}: {
  active?: string;
  explore?: boolean;
}): ReactElement => (
  <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
    {explore ? (
      <ExploreCluster material={BarMaterial.Glass} />
    ) : (
      <RootCluster material={BarMaterial.Glass} active={active} />
    )}
  </div>
);

// Whole screens, composed once and reused across chapters. Phones render
// without browser chrome because the subject is the store app.

export const App = ({
  children,
  height,
}: {
  children: ReactNode;
  height?: number;
}): ReactElement => (
  <Phone browser={BrowserChrome.None} height={height}>
    {children}
  </Phone>
);

export const TodayHome = (): ReactElement => (
  <App>
    <Screen
      header={
        <>
          <TodayLogoRow />
          <TodayChips />
        </>
      }
      footer={<TodayTabBar active="Home" />}
    >
      <FeedList />
      <Fab />
    </Screen>
  </App>
);

export const ProposedHome = ({
  collapsed,
}: {
  collapsed?: boolean;
  set?: TabSet;
}): ReactElement => (
  <App>
    <Screen
      header={<ProposedHomeHeader collapsed={collapsed} />}
      overlay={<Floating />}
    >
      <FeedList compact={collapsed} />
    </Screen>
  </App>
);

export const TodayExplore = (): ReactElement => (
  <App>
    <Screen header={<TodaySearchHeader />} footer={<TodayTabBar active="Explore" />}>
      <FeedList />
      <Fab />
    </Screen>
  </App>
);

export const ProposedExplore = (): ReactElement => (
  <App>
    <Screen overlay={<Floating explore />}>
      <ExploreHub withSearch={false} withSquads={false} />
    </Screen>
  </App>
);

export const ProposedYou = (): ReactElement => (
  <App>
    <Screen overlay={<Floating />}>
      <YouHub />
    </Screen>
  </App>
);

export const ProposedCreate = (): ReactElement => (
  <App>
    <Screen header={<ProposedHomeHeader />} overlay={<CreateSheet />}>
      <Dim>
        <FeedList />
      </Dim>
    </Screen>
  </App>
);

export const TodayHeadlines = (): ReactElement => (
  <App>
    <Screen
      header={<TodayHeadlinesHeader />}
      footer={<TodayTabBar active="Headlines" />}
    >
      <HeadlineRows />
      <Fab />
    </Screen>
  </App>
);

export const ProposedHeadlines = (): ReactElement => (
  <App>
    <Screen header={<ProposedHomeHeader active={1} />} overlay={<Floating />}>
      <HeadlineRows />
    </Screen>
  </App>
);

export const TodayTag = (): ReactElement => (
  <App>
    <Screen header={<TodayTagHeader />} footer={<TodayTabBar active="Home" />}>
      <FeedList compact />
      <Fab />
    </Screen>
  </App>
);

export const ProposedTag = (): ReactElement => (
  <App>
    <Screen header={<ProposedTagHeader />} overlay={<Floating active="Explore" />}>
      <FeedList />
    </Screen>
  </App>
);

const post = posts[0];

export const TodayPost = (): ReactElement => (
  <App>
    <Screen header={<TodayPostBar />} footer={<TodayTabBar active="Home" />}>
      <PostArticle post={post} />
      <CommentList />
      <TodayEngagementPill post={post} />
    </Screen>
  </App>
);

export const ProposedPost = (): ReactElement => (
  <App>
    <Screen
      header={<PageBar title="Post" />}
      footer={<ProposedPostBar post={post} />}
    >
      <PostArticle post={post} showReadCta />
      <CommentList />
    </Screen>
  </App>
);
