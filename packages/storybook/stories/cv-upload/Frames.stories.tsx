import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CvProviders } from './providers';
import {
  AddWork as AddWorkFrame,
  ProfileLfg,
  ProfileMenuCvFirst,
  ProfilePage,
  SettingsEducation as SettingsEducationFrame,
  SettingsWork as SettingsWorkFrame,
} from './frames';
import type { RingColor } from './screens';

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

export const Profile: Story = { render: () => <ProfilePage /> };

// One profile per ring color, picked with the ringColor arg.
export const ProfileRingColor: StoryObj<{ ringColor: RingColor }> = {
  args: { ringColor: 'brand' },
  render: ({ ringColor }) => <ProfilePage ringColor={ringColor} />,
};

export const ProfileEditMenu: Story = {
  render: () => <ProfilePage isEditMenuOpen />,
};

export const ProfileLfgToday: Story = {
  render: () => <ProfilePage lfg={ProfileLfg.Today} />,
};

export const ProfileLfgNameRow: Story = {
  render: () => <ProfilePage lfg={ProfileLfg.NameRow} />,
};

export const SettingsWork: Story = { render: () => <SettingsWorkFrame /> };

export const SettingsEducation: Story = {
  render: () => <SettingsEducationFrame />,
};

export const AddWork: Story = { render: () => <AddWorkFrame /> };

export const ProfileMenu: Story = { render: () => <ProfileMenuCvFirst /> };
