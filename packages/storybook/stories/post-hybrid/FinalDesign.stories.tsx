import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Device } from './doc';
import {
  devices,
  DocPage,
  PageFrame,
  Section,
  Table,
  Version,
  Viewer,
} from './doc';
import { PostKind } from './data';

const meta: Meta = {
  title: 'Post Page Hybrid/1. Final design',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// Every change from production's page to the hybrid, in the order a reader
// meets it on the page.
const changes: [string, string, string][] = [
  [
    'Layout',
    'Full-width card with a 340px widget column behind a divider',
    'The profile and Squad page frame: a bordered card beside a 320px rail, 1024px wide from laptop and 1152px from laptopL',
  ],
  [
    'Padding',
    '16px sides on phones, 24px from tablet, 32px from laptop',
    'As on the profile and Squad pages: 16px sides on phones, 24px on every side from tablet',
  ],
  [
    'Header',
    'Source name, Read post, copy link and "…"',
    'Compact source with Follow (or the author on Squad posts), then Read post and "…" in the corner from laptop. No copy link: the action bar has it',
  ],
  [
    'Title and cover',
    'Large title, TLDR, tags, then a wide cover under them',
    'Title beside a cover thumbnail: 112px square in a narrow column, 192px at 25:13 in a wide one',
  ],
  [
    'Read post',
    'Header on laptops, a header bar on tablets and phones',
    'Header corner from laptop; under the date and read time below that',
  ],
  [
    'Actions',
    'An action row above the comments',
    'A floating bar that pins to the bottom of the screen from tablet up: upvote, downvote, comment, award, bookmark, copy link',
  ],
  [
    'Discussion',
    'Sort above a large composer, share row, thread, end of thread share',
    'A quieter composer row first, then share to Squad, sort as a small link, the thread and the end of thread share',
  ],
  [
    'Right sidebar',
    'Production’s widgets for the post type',
    'The same widgets in the same order; the share box keeps its border and "Advertise here" sits flush left',
  ],
  [
    'Video',
    'Player and Watch video',
    'A framed player that grows on first play; no Watch video, since the player is right there',
  ],
  [
    'X posts',
    'Classic layout with its own read button',
    'The tweet card, with Read on X in its corner',
  ],
  [
    'Collections',
    'The Collections source in the header',
    'The feed card’s source stack: three avatars and +N, fanning open on hover',
  ],
];

const widths: Device[] = [
  devices.phone,
  devices.tablet,
  devices.laptop,
  devices.desktop,
  devices.wide,
];

const SideBySide = ({
  device,
  viewer,
  kind = PostKind.Article,
}: {
  device: Device;
  viewer: Viewer;
  kind?: PostKind;
}): ReactElement => (
  <div className="flex flex-wrap items-start gap-6">
    <PageFrame
      device={device}
      version={Version.Classic}
      kind={kind}
      viewer={viewer}
      label={`Production today · ${device.label}`}
    />
    <PageFrame
      device={device}
      kind={kind}
      viewer={viewer}
      label={`Hybrid · ${device.label}`}
    />
  </div>
);

const pairScale: Record<string, number> = {
  [devices.phone.label]: 1,
  [devices.tablet.label]: 0.8,
  [devices.laptop.label]: 0.6,
  [devices.desktop.label]: 0.46,
  [devices.wide.label]: 0.35,
};

const BreakpointsPage = ({
  viewer,
  label,
}: {
  viewer: Viewer;
  label: string;
}): ReactElement => (
  <DocPage
    eyebrow={`Post Page Hybrid · Final design · ${label}`}
    title="Production today and the hybrid, at every width"
    intro={
      <p>
        The same article, {label.toLowerCase()}, in production’s page and in the
        hybrid. Each pair is one width, and every frame is live at its real
        width, so the breakpoints land as they do in the app.
      </p>
    }
  >
    {widths.map((device) => (
      <Section key={device.label} title={device.label}>
        <SideBySide
          device={{ ...device, scale: pairScale[device.label] }}
          viewer={viewer}
        />
      </Section>
    ))}
  </DocPage>
);

export const Overview: StoryObj = {
  render: () => (
    <DocPage
      eyebrow="Post Page Hybrid · Final design"
      title="The post page: production today and the hybrid"
      intro={
        <>
          <p>
            The hybrid keeps production’s page structure and its right sidebar,
            and brings in the redesign’s reading column and discussion. The
            redesign raised comments, engagement and external read clicks, but
            lost on ad impressions and visitor conversion once the sidebar was
            gone. This arm keeps both.
          </p>
          <p>
            Breakpoints and post types are the next pages in this chapter, and
            the post modal has its own chapter. The reasoning behind each choice
            is in Read me and Design parity.
          </p>
        </>
      }
    >
      <Section title="Desktop, 1440px, logged in">
        <SideBySide
          device={{ ...devices.desktop, height: 1000, scale: 0.46 }}
          viewer={Viewer.Member}
        />
      </Section>
      <Section title="Phone, 375px, logged in">
        <SideBySide
          device={{ ...devices.phone, scale: 1 }}
          viewer={Viewer.Member}
        />
      </Section>
      <Section title="Everything that changed">
        <Table
          head={['Surface', 'Production today', 'Hybrid']}
          rows={changes}
        />
      </Section>
    </DocPage>
  ),
};

export const BreakpointsLoggedIn: StoryObj = {
  name: 'Breakpoints, logged in',
  render: () => <BreakpointsPage viewer={Viewer.Member} label="Logged in" />,
};

export const BreakpointsLoggedOut: StoryObj = {
  name: 'Breakpoints, logged out',
  render: () => (
    <BreakpointsPage viewer={Viewer.Anonymous} label="Logged out" />
  ),
};

const kinds = [
  PostKind.Article,
  PostKind.Video,
  PostKind.SquadPost,
  PostKind.SharedPost,
  PostKind.SharedLink,
  PostKind.XPost,
  PostKind.SharedX,
  PostKind.Collection,
  PostKind.Poll,
];

export const PostTypes: StoryObj = {
  name: 'Post types',
  render: () => (
    <DocPage
      eyebrow="Post Page Hybrid · Final design · Post types"
      title="Every post type, production today and the hybrid"
      intro={
        <p>
          Logged in at 1440px. Briefs keep their own layout in both, so they are
          not here.
        </p>
      }
    >
      {kinds.map((kind) => (
        <Section key={kind} title={kind}>
          <SideBySide
            device={{ ...devices.desktop, height: 1000, scale: 0.46 }}
            viewer={Viewer.Member}
            kind={kind}
          />
        </Section>
      ))}
    </DocPage>
  ),
};
