import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page, Stage } from '../parts';
import {
  Adaptive,
  DirectionNotes,
  HomeScreen,
  OursAndYours,
  Rail,
  SmartStacks,
  Spaces,
  SponsoredSkins,
} from './directions';

const meta: Meta = {
  title: 'Hero Cover/Archive/Widget exploration/2. Directions',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Directions: StoryObj = {
  name: '2. Directions',
  render: () => (
    <Page
      chapter="Widgets · 2"
      question="What could the hero become?"
      title="Seven directions, high level"
      goal="Show the shape of each idea on a real five-column feed, and how each one answers room, money and belonging. Not every state, just the idea."
      metric="Pick one or two to take further."
    >
      <Case title="A · Home Screen" note="Press Customize to see edit mode.">
        <Stage columns={5}>
          <HomeScreen />
        </Stage>
        <DirectionNotes
          pitch="The hero is a home screen: a grid of widgets in four sizes, edited in place with jiggle, remove and resize."
          overflow="Pages, with dots under the row, like a phone's home screens. Page one is the one that matters."
          ads="A reserved Sponsored widget, pinned by daily.dev: it cannot be moved or removed, and Plus takes it away."
          risk="Pages after the first are rarely seen, so overflow quietly becomes waste."
        />
      </Case>
      <Case
        title="B · Smart Stacks"
        note="Each column is a stack. The third one rotates on its own."
      >
        <Stage columns={5}>
          <SmartStacks />
        </Stage>
        <DirectionNotes
          pitch="Every column is a stack. Drop a widget onto another to stack them; the dots show what is underneath."
          overflow="Depth instead of width. The row never grows, a stack just gets deeper (we would cap it at five)."
          ads="The ad is one card in a stack's rotation, labeled Sponsored, never the default top card."
          risk="Rotation that moves while you read is hostile; it has to be opt-in per stack and only on load or idle."
        />
      </Case>
      <Case
        title="C · Ours + Yours"
        note="Press Customize: our zone dims and locks, yours jiggles."
      >
        <Stage columns={5}>
          <OursAndYours />
        </Stage>
        <DirectionNotes
          pitch="Split the row: the editorial zone stays ours (top story and the ad), the rest is a dock of small widgets the reader owns."
          overflow="A hard limit on the reader's zone, shown as spots used. Full means swap, not add."
          ads="Inside our zone, fixed and predictable, sold like YouTube's masthead."
          risk="The reader only owns a third of the row, so it may feel like customization in name only."
        />
      </Case>
      <Case title="D · Rail" note="Scroll the row sideways.">
        <Stage columns={5}>
          <Rail />
        </Stage>
        <DirectionNotes
          pitch="One horizontal rail of widgets in mixed sizes, like a store's Today tab. The first screen is a curated opening."
          overflow="Unlimited: the rail scrolls, and the edge of the next widget shows there is more."
          ads="A Sponsored widget at a fixed early position in the rail, always in the first screen."
          risk="Sideways scrolling on desktop is easy to miss, so widgets past the edge get little use."
        />
      </Case>
      <Case
        title="E · Spaces"
        note="Switch between Morning, Builder and Community."
      >
        <Stage columns={5}>
          <Spaces />
        </Stage>
        <DirectionNotes
          pitch="Several saved layouts, switched by tabs, like Windows dashboards or Spotify's chips: one for the morning, one for building, one for community."
          overflow="Make another space. Each space has a hard limit, but there is no limit on spaces."
          ads="One reserved Sponsored widget per space, in the same spot in each."
          risk="A second row of tabs right above the feed tabs; two tab rows compete."
        />
      </Case>
      <Case title="F · Sponsored skins" note="No ad slot at all.">
        <Stage columns={5}>
          <SponsoredSkins />
        </Stage>
        <DirectionNotes
          pitch="The ad has no slot of its own. Advertisers sponsor a widget the reader already chose: agent updates presented by Cursor, the podcast presented by Vercel."
          overflow="Any of the other strategies; this direction is only about money."
          ads="Inside the widgets, one sponsor per widget, labeled. Sold per widget type, the way weather apps sold the pollen index."
          risk="Inventory depends on which widgets readers pick, and a sponsored version of a personal widget can feel intrusive."
        />
      </Case>
      <Case title="G · Adaptive" note="Switch the time of day.">
        <Stage columns={5}>
          <Adaptive />
        </Stage>
        <DirectionNotes
          pitch="Customization by pinning, not arranging. The reader pins what must stay, and the system arranges the rest for the moment: the brief in the morning, the podcast in the evening."
          overflow="The system picks what fits now from everything the reader allowed, so there is no overflow to manage."
          ads="The ad and our promotions compete for the flexible slots by relevance, with a frequency cap."
          risk="Opaque. If the reader cannot predict where things are, it stops feeling like theirs."
        />
      </Case>
    </Page>
  ),
};
