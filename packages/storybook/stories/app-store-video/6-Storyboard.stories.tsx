import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Bullets, Case, Page, useSafeToggle } from './parts';
import { Frames } from './timeline';
import { fetchVideo, signalVideo, tapVideo } from './videos';
import { frameFor } from './canvases';

const meta: Meta = {
  title: 'App Store Video/6. Storyboard',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const StoryboardPage: StoryObj = {
  name: '6. Storyboard',
  render: () => {
    const [safe, toggle] = useSafeToggle();
    return (
      <Page
        chapter="6"
        question="Frame by frame, what will be produced?"
        title="Every beat, frozen for approval"
        goal="Approve each frame before Patchy is animated or the preview is recorded, since both cost credits and a recording session."
        metric="Approval of this page."
      >
        <Case
          title="1 · Fetch · header"
          note="Frames are taken a moment into each beat. The dashed box is the template's safe area: the line never leaves it."
        >
          {toggle}
          <Frames video={fetchVideo} frame={frameFor('header', safe)} />
        </Case>
        <Case title="2 · Signal · search results">
          <Frames video={signalVideo} frame={frameFor('search', safe)} />
        </Case>
        <Case
          title="3 · Tap · app preview"
          note="This is the shot list for the device recording: the base is the real app, the lifted components and ripples are added in the edit."
        >
          <Frames video={tapVideo} frame={frameFor('preview')} offset={1.4} />
        </Case>
        <Case title="Open for Tsahi">
          <Bullets
            items={[
              'Fetch: keep the pun line "Fresh dev news, fetched daily." or go plainer; and whether Patchy runs off at the end or stays seated for a calmer loop.',
              'Signal: the counter word, "sources" or "blogs and channels", and whether the TLDR stamp stays purple or takes the brand gradient.',
              'Tap: the order of the five taps, and whether the streak or the bookmark is the last beat before the end card.',
            ]}
          />
        </Case>
      </Page>
    );
  },
};
