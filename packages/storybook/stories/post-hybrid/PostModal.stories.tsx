import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HybridProviders, Viewer } from './providers';
import { PostKind, postsByKind } from './data';
import { Version } from './versions';
import { PostModal } from './modal';

interface ModalArgs {
  version: Version;
  kind: PostKind;
  viewer: Viewer;
}

const meta: Meta<ModalArgs> = {
  title: 'Post Page Hybrid/4. Post modal',
  parameters: { layout: 'fullscreen' },
  args: {
    version: Version.Hybrid,
    kind: PostKind.Article,
    viewer: Viewer.Member,
  },
  argTypes: {
    version: {
      name: 'Version',
      description:
        'Classic is production’s modal today. Redesign is the experiment arm as it shipped.',
      control: 'inline-radio',
      options: Object.values(Version),
    },
    kind: {
      name: 'Post type',
      control: 'inline-radio',
      options: [
        PostKind.Article,
        PostKind.Video,
        PostKind.SharedPost,
        PostKind.SquadPost,
      ],
    },
    viewer: {
      name: 'Viewer',
      control: 'inline-radio',
      options: Object.values(Viewer),
    },
  },
  render: ({ version, kind, viewer }) => (
    <HybridProviders
      key={`${version}-${kind}-${viewer}`}
      viewer={viewer}
      posts={Object.values(postsByKind)}
    >
      <PostModal version={version} post={postsByKind[kind]} viewer={viewer} />
    </HybridProviders>
  ),
};

export default meta;

export const Hybrid: StoryObj<ModalArgs> = {};

export const Classic: StoryObj<ModalArgs> = {
  name: 'Classic, production today',
  args: { version: Version.Classic },
};

export const Redesign: StoryObj<ModalArgs> = {
  name: 'Redesign, as shipped',
  args: { version: Version.Redesign },
};
