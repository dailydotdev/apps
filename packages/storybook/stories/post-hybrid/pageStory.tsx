import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HybridProviders, Viewer } from './providers';
import { kindNotes, PostKind, postsByKind } from './data';
import { PostPage, Version } from './versions';

export interface PageArgs {
  version: Version;
  kind: PostKind;
  viewer: Viewer;
  programmatic: boolean;
  commentAd: boolean;
  stickyRail: boolean;
  shell: boolean;
}

export type PageStory = StoryObj<PageArgs>;

/** One live page with every review control, shared by the page folders. */
export const pageMeta = (args: Partial<PageArgs>): Meta<PageArgs> => ({
  parameters: { layout: 'fullscreen' },
  args: {
    version: Version.Hybrid,
    kind: PostKind.Article,
    viewer: Viewer.Member,
    programmatic: false,
    commentAd: false,
    stickyRail: false,
    shell: true,
    ...args,
  },
  argTypes: {
    version: {
      name: 'Version',
      description:
        'Redesign is the experiment arm as it shipped. Classic is the real production page today.',
      control: 'inline-radio',
      options: Object.values(Version),
    },
    kind: {
      name: 'Post type',
      control: 'select',
      options: Object.values(PostKind),
    },
    viewer: {
      name: 'Viewer',
      control: 'inline-radio',
      options: Object.values(Viewer),
    },
    programmatic: {
      name: 'Programmatic ads (logged out)',
      description:
        "Production's organic slots, live for every logged-out visitor on articles and videos.",
    },
    commentAd: {
      name: 'Fill the thread ad',
      description:
        'The direct-sold ad above the comments. Wired in production, but its placement (/v1/a/post) currently returns no ad, so it is off by default.',
    },
    stickyRail: { name: 'Proposed sticky rail tower' },
    shell: { name: 'App sidebar placeholder' },
  },
  render: ({ kind, viewer, version, commentAd, ...props }) => (
    <HybridProviders
      key={`${version}-${kind}-${viewer}-${commentAd}`}
      viewer={viewer}
      commentAd={commentAd}
      posts={Object.values(postsByKind)}
    >
      <PostPage
        version={version}
        post={postsByKind[kind]}
        viewer={viewer}
        {...props}
      />
    </HybridProviders>
  ),
});

export const kindStory = (kind: PostKind): PageStory => ({
  args: { kind },
  parameters: { docs: { description: { story: kindNotes[kind] } } },
});
