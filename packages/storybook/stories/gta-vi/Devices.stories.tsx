import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { GiveAwardFlow } from './production/GiveAward';
import { CommentWithAward, ProfileAwards } from './production/AwardPreviews';
import { Shelf } from './production/Shelf';
import { FeedHeroProviders } from '../features/feed/feedHero.mocks';
import { ThemedHome } from './theme';

/*
 * One case per story, filling the window at its own size. The All states
 * pages load these in iframes at each device's width, so media queries
 * (tablet:, laptop:) and the modal's phone sheet behave as in the app.
 */

const meta: Meta = {
  title: 'GTA VI/Devices',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

/** Production's modal overlay, the sheet at the bottom on phones. */
const ModalBackdrop = ({ children }: { children: ReactNode }): ReactElement => (
  // #__next is a stretched column in production's CSS, so the layout sits
  // on a child.
  <div id="__next">
    <div className="flex min-h-screen items-end justify-center bg-overlay-quaternary-onion tablet:items-center">
      {children}
    </div>
  </div>
);

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    id="__next"
    className="min-h-screen bg-background-default p-4 tablet:p-6 laptop:p-10"
  >
    {children}
  </div>
);

export const AwardPicker: StoryObj = {
  name: 'Award picker',
  render: () => (
    <ModalBackdrop>
      <GiveAwardFlow layout="auto" />
    </ModalBackdrop>
  ),
};

export const AwardNote: StoryObj = {
  name: 'Award note',
  render: () => (
    <ModalBackdrop>
      <GiveAwardFlow layout="auto" initialStep="COMMENT" />
    </ModalBackdrop>
  ),
};

export const AwardReceived: StoryObj = {
  name: 'Award received',
  render: () => (
    <Page>
      <div className="flex flex-col gap-6 laptop:flex-row laptop:items-start">
        <CommentWithAward />
        <div className="w-full max-w-[18.75rem] laptop:w-[22rem] laptop:max-w-none">
          <ProfileAwards />
        </div>
      </div>
    </Page>
  ),
};

export const AchievementShelf: StoryObj = {
  name: 'Achievement shelf',
  render: () => (
    <Page>
      <Shelf state="releaseRead" />
    </Page>
  ),
};

export const AchievementDetail: StoryObj = {
  name: 'Achievement detail',
  render: () => (
    <Page>
      <Shelf state="releaseRead" openFirst />
    </Page>
  ),
};

export const ThemeOn: StoryObj = {
  name: 'Theme on',
  render: () => (
    <FeedHeroProviders>
      <ThemedHome isFluid initialTheme="viceCity" />
    </FeedHeroProviders>
  ),
};

export const ThemePicking: StoryObj = {
  name: 'Theme picking',
  render: () => (
    <FeedHeroProviders>
      <ThemedHome isFluid isSettingsOpenInitially />
    </FeedHeroProviders>
  ),
};

export const ThemeOff: StoryObj = {
  name: 'Theme off',
  render: () => (
    <FeedHeroProviders>
      <ThemedHome isFluid />
    </FeedHeroProviders>
  ),
};
