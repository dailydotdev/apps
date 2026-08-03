import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import type { ReactNode } from 'react';
import { CommentMarkdownInput } from '@dailydotdev/shared/src/components/fields/MarkdownInput/CommentMarkdownInput';
import {
  ComposerHarness,
  longComment,
  markdownComment,
  post,
  shortComment,
  WriteComment,
} from './composer.mocks';

interface CaseProps {
  title: string;
  note: string;
  width?: string;
  children: ReactNode;
}

const Case = ({ title, note, width = '100%', children }: CaseProps) => (
  <section className="flex flex-col gap-2" style={{ width }}>
    <header className="flex flex-col gap-0.5">
      <h3 className="font-bold text-text-primary typo-callout">{title}</h3>
      <p className="text-text-tertiary typo-footnote">{note}</p>
    </header>
    {children}
  </section>
);

const Gallery = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-row flex-wrap items-start gap-8">{children}</div>
);

const meta: Meta = {
  title: 'Components/Comments/Composer states',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Every state the comment composer can be in, side by side. Use the mobile story to check the keyboard-safe cap: the composer never grows past 80% of the visual viewport, so the action bar stays above the keyboard.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <ComposerHarness className="max-w-none">
      <Gallery>
        <Case
          title="Empty"
          note="Submit disabled until there is content."
          width="24rem"
        >
          <CommentMarkdownInput post={post} onClose={() => undefined} />
        </Case>
        <Case
          title="Short comment"
          note="Sits at its natural height, no scrollbar."
          width="24rem"
        >
          <CommentMarkdownInput
            post={post}
            initialContent={shortComment}
            onClose={() => undefined}
          />
        </Case>
        <Case
          title="Long comment"
          note="Capped; the body scrolls and the action bar holds."
          width="24rem"
        >
          <CommentMarkdownInput
            post={post}
            initialContent={longComment}
            onClose={() => undefined}
          />
        </Case>
        <Case
          title="Reply"
          note="Replying-to strip above the avatar, actions on the right."
          width="24rem"
        >
          <CommentMarkdownInput
            post={post}
            parentCommentId="comment-1"
            replyTo="AmirMushich"
            initialContent={shortComment}
            onClose={() => undefined}
          />
        </Case>
        <Case
          title="Edit"
          note="Header says it is an edit; submits as Update."
          width="24rem"
        >
          <CommentMarkdownInput
            post={post}
            editCommentId="comment-1"
            initialContent={shortComment}
            onClose={() => undefined}
          />
        </Case>
        <Case
          title="Rich content"
          note="Headings, lists and code blocks render inline."
          width="24rem"
        >
          <CommentMarkdownInput
            post={post}
            initialContent={markdownComment}
            onClose={() => undefined}
          />
        </Case>
        <Case
          title="No close handler"
          note="Header keeps the markdown toggle, drops the X."
          width="24rem"
        >
          <CommentMarkdownInput post={post} initialContent={shortComment} />
        </Case>
        <Case
          title="Submitting"
          note="Button shows the in-flight state."
          width="24rem"
        >
          <WriteComment isLoading>
            <CommentMarkdownInput
              post={post}
              initialContent={shortComment}
              onClose={() => undefined}
            />
          </WriteComment>
        </Case>
      </Gallery>
    </ComposerHarness>
  ),
};

export const MobileWidths: Story = {
  name: 'Mobile widths',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <ComposerHarness className="max-w-none">
      <Gallery>
        <Case
          title="320px — smallest supported"
          note="Formatting tools collapse into the overflow menu first."
          width="20rem"
        >
          <CommentMarkdownInput
            post={post}
            initialContent={longComment}
            onClose={() => undefined}
          />
        </Case>
        <Case
          title="375px — iPhone"
          note="Reply strip truncates rather than wrapping."
          width="23.4375rem"
        >
          <CommentMarkdownInput
            post={post}
            parentCommentId="comment-1"
            replyTo="a-very-long-username-that-will-not-fit"
            initialContent={longComment}
            onClose={() => undefined}
          />
        </Case>
      </Gallery>
    </ComposerHarness>
  ),
};
