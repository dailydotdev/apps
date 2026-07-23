import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  activeDiscussionCommentThreshold,
  EndOfConversationShare,
} from '@dailydotdev/shared/src/components/post/EndOfConversationShare';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { shareDecorator } from './share.mocks';

const basePost = {
  id: 'p1',
  title: 'Why your CI is slow and what actually fixes it',
  permalink: 'https://daily.dev/posts/p1',
  commentsPermalink: 'https://app.daily.dev/posts/p1',
  numComments: 12,
} as unknown as Post;

const withPost = (numComments: number): Post =>
  ({ ...basePost, numComments } as Post);

const meta: Meta<typeof EndOfConversationShare> = {
  title: 'Components/Share/EndOfConversationShare',
  component: EndOfConversationShare,
  args: { post: basePost },
  parameters: {
    docs: {
      description: {
        component: `Share band rendered below the comment list. It only appears once a post
has an active discussion — more than ${activeDiscussionCommentThreshold} comments, read from
\`Post.numComments\`. It ships to everyone — the
comment threshold is the only condition.`,
      },
    },
  },
  decorators: [
    shareDecorator('flex min-h-40 w-full max-w-2xl flex-col justify-center'),
  ],
};

export default meta;

type Story = StoryObj<typeof EndOfConversationShare>;

// Active discussion in the default flat treatment: no fill, no rounding, just
// a hairline rule above the strip.
export const ActiveDiscussion: Story = {
  args: { post: withPost(12) },
};

// The heavier alternative: a self-contained float surface with a full border.
export const Card: Story = {
  args: { post: withPost(12), variant: 'card' },
};

// Exactly at the threshold — still hidden, the band needs MORE than 3 comments.
export const AtThreshold: Story = {
  args: { post: withPost(activeDiscussionCommentThreshold) },
};

// One comment past the threshold: the first state where the band shows.
export const JustAboveThreshold: Story = {
  args: { post: withPost(activeDiscussionCommentThreshold + 1) },
};

// Quiet post: nothing renders, so we never prompt on an empty discussion.
export const NoComments: Story = {
  args: { post: withPost(0) },
};

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-2">
    <div className="flex flex-col gap-0.5">
      <Typography bold type={TypographyType.Body}>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    </div>
    {children}
  </section>
);

// A hidden state renders nothing at all, so the outline marks where the band
// would have been — otherwise the gallery just shows a gap.
const Hidden = ({ post }: { post: Post }) => (
  <div className="flex min-h-16 items-center justify-center rounded-16 border border-dashed border-border-subtlest-tertiary p-4">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Quaternary}
    >
      Nothing renders ({post.numComments ?? 0} comments)
    </Typography>
    <EndOfConversationShare post={post} />
  </div>
);

const commentAuthors = ['Ido Shamun', 'Nimrod Kramer', 'Tsahi Matsliah'];

// Stand-in for the comment list so the band can be judged against what sits
// above it, without dragging the real Comment component's context in.
const CommentSkeletons = () => (
  <>
    {commentAuthors.map((author) => (
      <div key={author} className="flex gap-3">
        <div className="size-8 shrink-0 rounded-full bg-surface-float" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography bold type={TypographyType.Footnote}>
            {author}
          </Typography>
          <div className="h-2 w-full rounded-4 bg-surface-float" />
          <div className="h-2 w-3/5 rounded-4 bg-surface-float" />
        </div>
      </div>
    ))}
  </>
);

/**
 * Rendered at a real phone viewport, not a narrow box on a desktop viewport —
 * the `tablet:` breakpoint reads the viewport, so only a true 390px frame shows
 * the stacked layout and the chevron-less single tap. `AllStates` embeds this
 * story in a 390px iframe for exactly that reason.
 */
export const Mobile: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <CommentSkeletons />
        <EndOfConversationShare post={withPost(12)} />
      </div>
      <EndOfConversationShare post={withPost(12)} variant="card" />
    </div>
  ),
};

// Storybook renders each story in its own iframe, so embedding one here gives
// the band a genuine 390px viewport instead of a squeezed desktop layout. The
// theme global is mirrored so the frame follows the toolbar toggle.
const MobileFrame = () => {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const read = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <iframe
      title="End of conversation share on mobile"
      src={`iframe.html?id=components-share-endofconversationshare--mobile&viewMode=story&globals=theme:${
        isDark ? 'dark' : 'light'
      }`}
      className="h-[34rem] w-[390px] rounded-16 border border-border-subtlest-tertiary"
    />
  );
};

// Every state and use case on one page: the two visible states, both hidden
// states, the in-context placement below a comment list, the mobile layout, and
// the content edge cases (long title, shared post). Use the Storybook theme
// toggle in the toolbar to check dark and light.
export const AllStates: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-8 py-4">
      <Section
        title="1. Flat — the default"
        note="12 comments. No fill and no rounding: one hairline rule separates the strip from the comments above it."
      >
        <EndOfConversationShare post={withPost(12)} />
      </Section>

      <Section
        title="1b. Flat, in context — the separator doing its job"
        note="The rule reads as the end of the comment list rather than as another card stacked on it."
      >
        <div className="flex flex-col gap-4">
          <CommentSkeletons />
          <EndOfConversationShare post={withPost(12)} />
        </div>
      </Section>

      <Section
        title="2. Card — the heavier alternative, opt-in"
        note='Still available via variant="card": a self-contained float surface with a full border.'
      >
        <EndOfConversationShare post={withPost(12)} variant="card" />
      </Section>

      <Section
        title="2c. The split trigger — two buttons, one control"
        note="Left half copies the link straight away (native share sheet on mobile). Right half opens the full share list — click the chevron to see it. On mobile the chevron drops and a single tap goes to the share sheet."
      >
        <div className="flex flex-wrap items-center gap-4">
          <ShareActions
            link={basePost.commentsPermalink}
            text={basePost.title ?? ''}
            variant="split"
            buttonVariant={ButtonVariant.Primary}
            buttonSize={ButtonSize.Small}
            label="Copy link"
            triggerText="Copy link"
          />
          <ShareActions
            link={basePost.commentsPermalink}
            text={basePost.title ?? ''}
            variant="split"
            buttonVariant={ButtonVariant.Secondary}
            buttonSize={ButtonSize.Small}
            label="Copy link"
            triggerText="Copy link"
          />
          <ShareActions
            link={basePost.commentsPermalink}
            text={basePost.title ?? ''}
            variant="split"
            buttonVariant={ButtonVariant.Float}
            buttonSize={ButtonSize.Small}
            label="Copy link"
            triggerText="Copy link"
          />
        </div>
      </Section>

      <Section
        title="3. Just above the threshold — first visible state"
        note={`${
          activeDiscussionCommentThreshold + 1
        } comments. Identical rendering; this is simply where the band switches on.`}
      >
        <EndOfConversationShare
          post={withPost(activeDiscussionCommentThreshold + 1)}
        />
      </Section>

      <Section
        title="4. At the threshold — hidden"
        note={`Exactly ${activeDiscussionCommentThreshold} comments. The check is "more than", so this side stays quiet.`}
      >
        <Hidden post={withPost(activeDiscussionCommentThreshold)} />
      </Section>

      <Section
        title="5. Quiet post — hidden"
        note="0 comments. We never prompt to share an empty discussion."
      >
        <Hidden post={withPost(0)} />
      </Section>

      <Section
        title="6. Card, in context — end of the comment list"
        note="The opt-in card treatment in the same placement, for comparison with 1b."
      >
        <div className="flex flex-col gap-4">
          <CommentSkeletons />
          <EndOfConversationShare post={withPost(12)} variant="card" />
        </div>
      </Section>

      <Section
        title="7. Mobile — a real 390px viewport"
        note="Live frame, not a squeezed desktop layout: the band centers and stacks, and the trigger collapses to a single tap that opens the native share sheet (no chevron, since there is no popover on mobile). Flat on top, card below."
      >
        <MobileFrame />
      </Section>

      <Section
        title="8. Long title — share text only, layout unchanged"
        note="The band's copy is static, so a long post title never reflows it; the title only rides along in the share payload."
      >
        <EndOfConversationShare
          post={
            {
              ...withPost(31),
              title:
                'A very long post title that keeps going well past what any card would ever show, just to prove the band does not care',
            } as Post
          }
        />
      </Section>

      <Section
        title="9. Shared post — falls back to the inner post title"
        note="For a squad share with no title of its own, the shared post's title is used as the share text."
      >
        <EndOfConversationShare
          post={
            {
              ...withPost(7),
              title: undefined,
              sharedPost: { title: 'The original article being shared' },
            } as unknown as Post
          }
        />
      </Section>
    </div>
  ),
};
