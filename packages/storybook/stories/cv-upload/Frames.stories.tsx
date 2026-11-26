import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CvProviders } from './providers';
import {
  ProfileExperience as ProfileExperienceFrame,
  SettingsEducation as SettingsEducationFrame,
  SettingsWork as SettingsWorkFrame,
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

export const ProfileExperience: Story = {
  render: () => <ProfileExperienceFrame />,
};

export const SettingsWork: Story = { render: () => <SettingsWorkFrame /> };

export const SettingsEducation: Story = {
  render: () => <SettingsEducationFrame />,
};
