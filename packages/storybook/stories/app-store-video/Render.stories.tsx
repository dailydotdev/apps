import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Placement } from './parts';
import { Page } from './parts';
import type { Video } from './timeline';
import { coverHeader, coverSearch, discordPreview } from './videos';
import { frameFor } from './canvases';

// One video at a time, its clock driven from outside, so an exporter can
// step it frame by frame: `await window.setVideoTime(t)` resolves once the
// frame at t has painted.

type Exportable = { video: Video; placement: Placement };

const videos: Record<string, Exportable> = {
  header: { video: coverHeader, placement: 'header' },
  search: { video: coverSearch, placement: 'search' },
  preview: { video: discordPreview, placement: 'preview' },
};

declare global {
  interface Window {
    setVideoTime?: (t: number) => Promise<void>;
  }
}

const Stepped = ({ name }: { name: keyof typeof videos }): ReactElement => {
  const { video, placement } = videos[name];
  const [time, setTime] = useState(0);
  useEffect(() => {
    window.setVideoTime = (t) =>
      new Promise((resolve) => {
        setTime(t);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    return () => {
      delete window.setVideoTime;
    };
  }, []);
  return frameFor(placement)(video.render(time), 'render');
};

const meta: Meta<{ name: keyof typeof videos }> = {
  title: 'App Store Video/Render',
  parameters: { layout: 'fullscreen' },
  args: { name: 'header' },
  argTypes: {
    name: { control: 'select', options: Object.keys(videos) },
  },
};

export default meta;

export const Render: StoryObj<{ name: keyof typeof videos }> = {
  name: 'Render (for export)',
  render: ({ name }) => (
    <Page
      chapter="Tool"
      question="How are the videos exported?"
      title="One video, stepped frame by frame"
      goal="Render a video to files at 30 fps from the same code the animatics use."
      metric="None."
    >
      <Stepped name={name} />
    </Page>
  ),
};
