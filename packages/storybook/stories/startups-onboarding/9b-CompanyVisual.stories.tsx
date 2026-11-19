import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AgentVisual,
  AllHandsVisual,
  BannerVisual,
  BlocksVisual,
  BrandVisual,
  RealPageVisual,
  ScrollVisual,
  StuntVisual,
  TeammateVisual,
  TerminalVisual,
} from './companyVisuals';
import { Providers } from './providers';
import { CompanyScreen } from './screens';

// Ten directions for the company step's right side. Type a name to see it react.

const meta: Meta = {
  title: 'Startups Onboarding/3d. Company step directions',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const Stunt: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={StuntVisual} />,
};
export const StuntLong: Story = {
  name: 'Stunt, long name',
  render: () => (
    <CompanyScreen
      initialName="Acme Developer Infrastructure Platform International"
      Visual={StuntVisual}
    />
  ),
};
export const StuntVeryLong: Story = {
  name: 'Stunt, very long name',
  render: () => (
    <CompanyScreen
      initialName="The Acme Developer Infrastructure and Cloud Security Platform for Enterprise Engineering Teams, Worldwide Inc."
      Visual={StuntVisual}
    />
  ),
};
export const Blocks: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={BlocksVisual} />,
};
export const AllHands: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={AllHandsVisual} />,
};
export const Teammate: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={TeammateVisual} />,
};
export const Terminal: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={TerminalVisual} />,
};
export const Scroll: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={ScrollVisual} />,
};
export const Agent: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={AgentVisual} />,
};
export const Brand: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={BrandVisual} />,
};
export const RealPage: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={RealPageVisual} />,
};
export const Banner: Story = {
  render: () => <CompanyScreen initialName="Acme" Visual={BannerVisual} />,
};
