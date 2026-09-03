import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { CommentMarkdownInput } from '@dailydotdev/shared/src/components/fields/MarkdownInput/CommentMarkdownInput';
import {
  ComposerHarness,
  longComment,
  markdownComment,
  overflowingWord,
  post,
  postWithoutAuthor,
  shortComment,
} from './composer.mocks';

const meta: Meta<typeof CommentMarkdownInput> = {
  title: 'Components/Comments/Composer',
  component: CommentMarkdownInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The inline comment composer. Same component on every viewport — no modal on mobile. It grows with its content, caps against the *visual* viewport (the part that survives the virtual keyboard), then scrolls its own body so the bottom action bar stays reachable.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ComposerHarness>
        <Story />
      </ComposerHarness>
    ),
  ],
  args: { post, onClose: () => undefined },
};

export default meta;

type Story = StoryObj<typeof CommentMarkdownInput>;

export const Empty: Story = {
  name: 'Empty — submit disabled',
  args: { initialContent: '' },
};

export const SourceFallback: Story = {
  name: 'No post author — falls back to the source',
  args: { post: postWithoutAuthor, initialContent: shortComment },
};

export const MarkdownMode: Story = {
  name: 'Markdown mode — toggle from the header',
  args: { initialContent: markdownComment },
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="Switch to Markdown"]',
    );
    toggle?.click();
  },
};

export const Typing: Story = {
  name: 'Short comment — fits without scrolling',
  args: { initialContent: shortComment },
};

export const LongComment: Story = {
  name: 'Long comment — capped and scrolling',
  args: { initialContent: longComment },
};

export const UnbreakableWord: Story = {
  name: 'Unbreakable word — wraps, never scrolls sideways',
  args: { initialContent: overflowingWord },
};

export const RichContent: Story = {
  name: 'Rich content — headings, lists, code',
  args: { initialContent: markdownComment },
};

export const Reply: Story = {
  name: 'Reply — "Replying to" strip',
  args: {
    parentCommentId: 'comment-1',
    replyTo: 'AmirMushich',
    initialContent: shortComment,
  },
};

export const ReplyLong: Story = {
  name: 'Reply — strip stays pinned above a scrolling body',
  args: {
    parentCommentId: 'comment-1',
    replyTo: 'AmirMushich',
    initialContent: longComment,
  },
};

export const Edit: Story = {
  name: 'Edit — header names the action, submits as "Update"',
  args: { editCommentId: 'comment-1', initialContent: shortComment },
};

export const WithoutClose: Story = {
  name: 'No close handler — header keeps the markdown toggle',
  args: { initialContent: shortComment, onClose: undefined },
};


export const Submitting: Story = {
  name: 'Submitting — button in flight',
  args: { initialContent: shortComment },
  decorators: [
    (Story) => (
      <ComposerHarness isLoading>
        <Story />
      </ComposerHarness>
    ),
  ],
};

export const Submitted: Story = {
  name: 'Submitted — locked until unmount',
  args: { initialContent: shortComment },
  decorators: [
    (Story) => (
      <ComposerHarness isSuccess>
        <Story />
      </ComposerHarness>
    ),
  ],
};
