import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Bullets, Case, Page, useSafeToggle } from './parts';
import { Frames } from './timeline';
import { coverHeader, discordPreview } from './videos';
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
        goal="Approve each frame before the loops are rendered or the preview is recorded."
        metric="Approval of this page."
      >
        <Case
          title="1 · The cover · header"
          note="The dashed box is the template's safe area: the line never leaves it."
        >
          {toggle}
          <Frames video={coverHeader} frame={frameFor('header', safe)} />
        </Case>
        <Case
          title="2 · The Discord cut · app preview"
          note="The shot list for the device recording. The cover shots are rendered; the app shots are recorded, with the pop-outs and caption bands laid over them."
        >
          <Frames video={discordPreview} frame={frameFor('preview')} />
        </Case>
        <Case title="Open for Tsahi">
          <Bullets
            items={[
              'The caption phrases in the preview, and whether each scene swaps two phrases (as Discord does) or holds one.',
              'Which 3D objects float: hashtag, RSS and newspaper today; more brand objects can be rendered in the same style.',
              'Whether the header line pops in on every loop or stays in place after the first.',
            ]}
          />
        </Case>
      </Page>
    );
  },
};
