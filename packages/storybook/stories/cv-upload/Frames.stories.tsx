import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useRouter } from '../../mock/next-router';
import { CvProviders } from './providers';
import {
  CampaignPopover as CampaignPopoverFrame,
  FeedBanner as FeedBannerFrame,
  ProfileExperienceProposed as ProfileExperienceProposedFrame,
  ProfileExperienceToday as ProfileExperienceTodayFrame,
  ProfileMenuOpen,
  ProfileTop as ProfileTopFrame,
  SettingsEducationProposed as SettingsEducationProposedFrame,
  SettingsEducationToday as SettingsEducationTodayFrame,
  SettingsWorkProposed as SettingsWorkProposedFrame,
  SettingsWorkToday as SettingsWorkTodayFrame,
} from './frames';

// The production frames the review embeds, one story each so an iframe can
// load them at a phone's or a laptop's width.

const meta: Meta = {
  title: 'Growth/CV upload/2. Production frames',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <CvProviders>
        <Story />
      </CvProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

// FeedNav reads My feed's route to light its segment.
const routeTo = (route: string) => (): void => {
  useRouter.mockImplementation(() => ({
    replace: fn(),
    push: fn(),
    pathname: route,
    route,
    asPath: route,
    query: {},
    events: { on: fn(), off: fn() },
  }));
};

export const FeedBanner: Story = {
  beforeEach: routeTo('/my-feed'),
  render: () => <FeedBannerFrame />,
};

export const CampaignPopover: Story = {
  render: () => <CampaignPopoverFrame />,
};

export const ProfileTop: Story = { render: () => <ProfileTopFrame /> };

export const ProfileExperienceToday: Story = {
  render: () => <ProfileExperienceTodayFrame />,
};

export const ProfileExperienceProposed: Story = {
  render: () => <ProfileExperienceProposedFrame />,
};

export const SettingsWorkToday: Story = {
  render: () => <SettingsWorkTodayFrame />,
};

export const SettingsWorkProposed: Story = {
  render: () => <SettingsWorkProposedFrame />,
};

export const SettingsEducationToday: Story = {
  render: () => <SettingsEducationTodayFrame />,
};

export const SettingsEducationProposed: Story = {
  render: () => <SettingsEducationProposedFrame />,
};

export const ProfileMenu: Story = { render: () => <ProfileMenuOpen /> };
