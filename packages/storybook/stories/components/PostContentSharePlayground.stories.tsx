import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { PostContentSharePromptVariant } from '@dailydotdev/shared/src/components/post/common/PostContentShare';
import { PostContentShare } from '@dailydotdev/shared/src/components/post/common/PostContentShare';
import { EndOfConversationShare } from '@dailydotdev/shared/src/components/post/EndOfConversationShare';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PostSharePromptHarness, upvotedPost } from './share.mocks';

/* -------------------------------------------------------------------------- */
/* Shared chrome                                                              */
/* -------------------------------------------------------------------------- */

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note: ReactNode;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
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

/**
 * Stand-ins for what the prompt actually sits between on the post page, so
 * placement can be judged without dragging the real post page's contexts in.
 * Order mirrors `PostEngagements`: body → counts → action bar → prompt → sort →
 * comments.
 */
const PostBodySkeleton = () => (
  <div className="flex flex-col gap-3">
    <Typography bold type={TypographyType.Title3}>
      {upvotedPost.title}
    </Typography>
    {[1, 0.95, 0.9, 0.75].map((width) => (
      <div
        key={width}
        className="h-2 rounded-4 bg-surface-float"
        style={{ width: `${width * 100}%` }}
      />
    ))}
  </div>
);

const ActionBarSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
    >
      42 Upvotes · 12 Comments
    </Typography>
    {/* `PostActions` is a rounded, bordered box — not a full-width rule. The
        difference matters here: a flat prompt underneath is judged against
        whatever edge sits above it. */}
    <div className="flex items-center gap-2 rounded-16 border border-border-subtlest-tertiary px-4 py-3">
      {['Upvote', 'Comment', 'Bookmark', 'Copy link'].map((action) => (
        <div
          key={action}
          className="text-text-tertiary typo-footnote"
        >
          {action}
        </div>
      ))}
    </div>
  </div>
);

const CommentsSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
    >
      Sort: Newest first
    </Typography>
    {['Ido Shamun', 'Nimrod Kramer', 'Tsahi Matsliah'].map((author) => (
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
  </div>
);

/* -------------------------------------------------------------------------- */
/* Treatments                                                                 */
/* -------------------------------------------------------------------------- */

type TreatmentKey = 'control' | 'band' | 'hero' | 'card';

interface Treatment {
  key: TreatmentKey;
  name: string;
  props: {
    promptVariant?: PostContentSharePromptVariant;
    surface?: 'flat' | 'card';
  };
  what: string;
  networks: string;
}

const TREATMENTS: Treatment[] = [
  {
    key: 'control',
    name: 'Control',
    props: { promptVariant: 'control' },
    what: 'What ships today: a question and a read-only link input with a copy button.',
    networks: 'None — copy link only.',
  },
  {
    key: 'band',
    name: 'Band (default)',
    props: { promptVariant: 'band' },
    what: 'The default: one flat line — encouraging copy on the left, a split copy-link control on the right, and no chrome at all. No fill, no border, no rule; matched margins so it sits centred between the action bar and the comment box.',
    networks: 'Behind the chevron.',
  },
  {
    key: 'hero',
    name: 'Hero',
    props: { promptVariant: 'hero' },
    what: 'The fuller block — upvote badge, headline, description, dismiss — with the same split control under it, aligned to the copy. Flat by default too; switch the surface to see it boxed.',
    networks: 'Behind the chevron.',
  },
  {
    key: 'card',
    name: 'Card',
    props: { promptVariant: 'card', surface: 'card' },
    what: 'The variant currently on PR 6351: the same block with all eight networks as tiles, on its own float surface.',
    networks: 'All eight, always on screen.',
  },
];

const Prompt = ({
  treatment,
  ...props
}: {
  treatment: Treatment;
  title?: string;
  description?: string;
}) => (
  <PostSharePromptHarness>
    <PostContentShare post={upvotedPost} {...treatment.props} {...props} />
  </PostSharePromptHarness>
);

const meta: Meta = {
  title: 'Components/Share/PostContentShare Playground',
  // See the note in PostContentShare.stories.tsx: the split control drops its
  // chevron below 1020px, measured against the story iframe rather than the
  // screen, so the desktop path has to pin its own frame. `MobileStack`
  // overrides this.
  globals: { viewport: { value: 'laptop' } },
  parameters: {
    docs: {
      description: {
        component: [
          'Everything the post-upvote share prompt can be, in one place: what each treatment is, where it sits on the post page, and a playground for clicking through them.',
          '',
          'The prompt renders from `PostEngagements`, directly below the upvote/comment action bar and above the comment sort control — so it is the first thing under the button the reader just pressed.',
        ].join('\n'),
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/* -------------------------------------------------------------------------- */
/* 1. Playground                                                              */
/* -------------------------------------------------------------------------- */

const COPY_OPTIONS = [
  { label: 'Default (per treatment)', title: undefined, description: undefined },
  {
    label: 'Enjoyed this post?',
    title: 'Enjoyed this post?',
    description: 'Send it to someone who’d have opinions.',
  },
  {
    label: 'Good call',
    title: 'Good call. Now pass it on.',
    description: 'Send it to the one person who’ll actually read it.',
  },
  {
    label: 'Worth someone’s time',
    title: 'Worth someone else’s time?',
    description: 'One tap to put it in front of them.',
  },
  {
    label: 'You upvoted it',
    title: 'You upvoted it.',
    description: 'Someone you know would want to read it too.',
  },
];

const Toggle = ({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) => (
  <div className="flex flex-wrap gap-1">
    {options.map((option) => (
      <Button
        key={option.key}
        type="button"
        size={ButtonSize.XSmall}
        variant={
          option.key === value ? ButtonVariant.Primary : ButtonVariant.Float
        }
        onClick={() => onChange(option.key)}
      >
        {option.label}
      </Button>
    ))}
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Quaternary}
    >
      {label}
    </Typography>
    {children}
  </div>
);

const PlaygroundView = () => {
  const [treatmentKey, setTreatmentKey] = useState<TreatmentKey>('band');
  const [surface, setSurface] = useState<'flat' | 'card'>('flat');
  const [copyIndex, setCopyIndex] = useState(0);
  const [inContext, setInContext] = useState(true);
  // Remounting the harness resets the seeded query cache, which is how a
  // dismissed prompt (or a fired copy confirmation) comes back.
  const [runId, setRunId] = useState(0);

  const treatment =
    TREATMENTS.find((item) => item.key === treatmentKey) ?? TREATMENTS[0];
  const copy = COPY_OPTIONS[copyIndex];
  const props = {
    ...treatment.props,
    surface,
    title: copy.title,
    description: copy.description,
  };

  return (
    <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-6 p-4">
      <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4">
        <Field label="Treatment">
          <Toggle
            options={TREATMENTS.map(({ key, name }) => ({ key, label: name }))}
            value={treatmentKey}
            onChange={(key) => setTreatmentKey(key as TreatmentKey)}
          />
        </Field>

        {treatmentKey !== 'control' && (
          <Field label="Surface">
            <Toggle
              options={[
                { key: 'flat', label: 'Flat (default)' },
                { key: 'card', label: 'Float surface' },
              ]}
              value={surface}
              onChange={(key) => setSurface(key as 'flat' | 'card')}
            />
          </Field>
        )}

        {treatmentKey !== 'control' && (
          <Field label="Copy">
            <Toggle
              options={COPY_OPTIONS.map((option, index) => ({
                key: String(index),
                label: option.label,
              }))}
              value={String(copyIndex)}
              onChange={(key) => setCopyIndex(Number(key))}
            />
          </Field>
        )}

        <Field label="View">
          <div className="flex flex-wrap gap-1">
            <Toggle
              options={[
                { key: 'context', label: 'On the post page' },
                { key: 'alone', label: 'On its own' },
              ]}
              value={inContext ? 'context' : 'alone'}
              onChange={(key) => setInContext(key === 'context')}
            />
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Subtle}
              onClick={() => setRunId((id) => id + 1)}
            >
              Reset prompt
            </Button>
          </div>
        </Field>

        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {treatment.what} <strong>Networks:</strong> {treatment.networks}
        </Typography>
      </div>

      <div key={runId}>
        {inContext ? (
          <div className="flex flex-col gap-6">
            <PostBodySkeleton />
            <ActionBarSkeleton />
            <Prompt treatment={treatment} {...props} />
            <CommentsSkeleton />
          </div>
        ) : (
          <Prompt treatment={treatment} {...props} />
        )}
      </div>
    </div>
  );
};

/**
 * Click through every treatment, copy option and surface, on the post page or
 * on its own. Everything is live: copy really copies, the chevron really opens
 * the network list, dismiss really dismisses — "Reset prompt" brings it back.
 */
export const Playground: Story = {
  render: () => <PlaygroundView />,
};

/* -------------------------------------------------------------------------- */
/* 2. What each treatment is                                                  */
/* -------------------------------------------------------------------------- */

// The four treatments with their descriptions, at one width. This is the page
// to read first — every other story is a detail of one of these.
export const AllTreatments: Story = {
  render: () => (
    <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-10 p-4">
      {TREATMENTS.map((treatment, index) => (
        <Section
          key={treatment.key}
          title={`${index + 1}. ${treatment.name}`}
          note={
            <>
              {treatment.what} <strong>Networks:</strong> {treatment.networks}
            </>
          }
        >
          <Prompt treatment={treatment} />
        </Section>
      ))}
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/* 3. Where it sits                                                           */
/* -------------------------------------------------------------------------- */

// `PostEngagements` renders the prompt directly under the action bar and above
// the comment sort control — the first thing below the button just pressed.
export const WhereItSits: Story = {
  render: () => (
    <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-6 p-4">
      <PostBodySkeleton />
      <ActionBarSkeleton />
      <div className="rounded-16 border border-dashed border-accent-cabbage-default p-2">
        <Typography
          className="mb-2"
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
        >
          ↓ PostContentShare renders here, only after the reader upvotes
        </Typography>
        <Prompt treatment={TREATMENTS[2]} />
      </div>
      <CommentsSkeleton />
    </div>
  ),
};

// Both share surfaces on one post: this prompt under the action bar, and the
// end-of-conversation band (PR 6369) under the comment list. Worth agreeing
// they can co-exist before either ships.
export const TogetherWithTheEndOfConversationBand: Story = {
  render: () => (
    <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-6 p-4">
      <PostBodySkeleton />
      <ActionBarSkeleton />
      <Prompt treatment={TREATMENTS[2]} />
      <CommentsSkeleton />
      <PostSharePromptHarness>
        <EndOfConversationShare post={upvotedPost} />
      </PostSharePromptHarness>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/* 4. Mobile                                                                  */
/* -------------------------------------------------------------------------- */

// Rendered at a real phone viewport by `MobileFrames` below. Every treatment,
// stacked — this is where band and hero lose the chevron.
export const MobileStack: Story = {
  globals: { viewport: { value: 'mobile1' } },
  render: () => (
    <div className="flex w-full flex-col gap-8 p-4">
      {TREATMENTS.map((treatment) => (
        <div key={treatment.key} className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
          >
            {treatment.name}
          </Typography>
          <Prompt treatment={treatment} />
        </div>
      ))}
    </div>
  ),
};

// Storybook renders each story in its own iframe, so embedding one here gives
// the prompts a genuine 390px viewport instead of a squeezed desktop layout —
// which matters because `ShareActions` switches on the viewport, not on width.
// The theme global is mirrored so the frame follows the toolbar toggle.
const MobileFrame = (): ReactElement => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
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
      title="Post-upvote share prompt on mobile"
      src={`iframe.html?id=components-share-postcontentshare-playground--mobile-stack&viewMode=story&globals=theme:${
        isDark ? 'dark' : 'light'
      }`}
      className="h-[40rem] w-[390px] shrink-0 rounded-16 border border-border-subtlest-tertiary"
    />
  );
};

/**
 * The mobile story of every treatment at a true 390px, beside the desktop
 * layout for the same four. Below laptop width `ShareActions` short-circuits:
 * band and hero lose the chevron and become a single button that opens the OS
 * share sheet, while the card keeps all eight tiles.
 */
export const MobileVsDesktop: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-6 p-4">
      <Section
        title="Mobile, 390px"
        note="Band and hero collapse to one button — no chevron, straight to the OS share sheet. The card still shows every tile."
      >
        <MobileFrame />
      </Section>
      <Section title="Desktop" note="The same four treatments at full width.">
        <div className="flex w-full max-w-[42rem] flex-col gap-8">
          {TREATMENTS.map((treatment) => (
            <div key={treatment.key} className="flex flex-col gap-2">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Quaternary}
              >
                {treatment.name}
              </Typography>
              <Prompt treatment={treatment} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};
