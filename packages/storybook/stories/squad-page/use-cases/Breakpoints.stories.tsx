import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Viewer } from '../kit';
import { DirectionShell } from '../direction';
import { Page, ViewportFrame } from './shared';

const meta: Meta = {
  title: 'Squad Page/2. Use cases/Breakpoints',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// The direction at the app's breakpoints (tablet 656px, laptop 1020px,
// laptopL 1360px). Each device is a frame of its real width, so
// Tailwind's breakpoints apply as they would live.

const devices = [
  { label: 'Phone, 375px', width: 375, height: 812, scale: 1 },
  { label: 'Tablet, 768px', width: 768, height: 1024, scale: 0.7 },
  { label: 'Laptop, 1280px', width: 1280, height: 800, scale: 0.55 },
  { label: 'Desktop, 1600px', width: 1600, height: 1000, scale: 0.44 },
];

const Row = ({
  title,
  viewer,
}: {
  title: string;
  viewer: Viewer;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <h2 className="font-bold typo-title3">{title}</h2>
    <div className="flex flex-wrap items-start gap-6">
      {devices.map((device) => (
        <ViewportFrame key={device.label} {...device}>
          <DirectionShell viewer={viewer} fluid />
        </ViewportFrame>
      ))}
    </div>
  </section>
);

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Breakpoints"
      title="One page, four widths"
      intro={
        <p>
          The frame follows the profile page. From laptop the page card sits
          beside the 320px right column under the classic sidebar; below it, one
          full-bleed column with the right column behind the About chip, the
          tablet sidebar from 656px and the floating tab bar on phones. Every
          frame is live: scroll it, open the chips, open a page.
        </p>
      }
    >
      <Row title="Home, as a member" viewer={Viewer.Member} />
      <Row title="Home, as an admin" viewer={Viewer.Admin} />
    </Page>
  ),
};
