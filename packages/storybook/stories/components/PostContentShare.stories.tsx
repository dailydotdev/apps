import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { PostContentShare } from '@dailydotdev/shared/src/components/post/common/PostContentShare';
import type { HarnessProps } from './share.mocks';
import {
  longTitlePost,
  PostSharePromptHarness as Harness,
  SHORT_LINK,
  upvotedPost as post,
} from './share.mocks';

const withHarness =
  (options: Omit<HarnessProps, 'children'>) =>
  (Story: React.ComponentType): ReactElement =>
    (
      <Harness {...options}>
        <div className="mx-auto w-full max-w-[40rem] p-4">
          <Story />
        </div>
      </Harness>
    );

// The component returns `null` in these states, so the canvas would otherwise
// be blank with nothing to tell a reviewer whether that's the point or a bug.
const withEmptyStateNote =
  (note: string) =>
  (Story: React.ComponentType): ReactElement =>
    (
      <div className="mx-auto w-full max-w-[40rem] p-4">
        <p className="mb-2 text-text-tertiary typo-footnote">{note}</p>
        <div className="rounded-12 border border-dashed border-border-subtlest-tertiary p-4">
          <Story />
        </div>
      </div>
    );

const meta: Meta<typeof PostContentShare> = {
  title: 'Components/Share/PostContentShare',
  component: PostContentShare,
  args: { post },
  tags: ['autodocs'],
  // Pin the desktop path. `ShareActions` drops the chevron below 1020px, and it
  // measures the story iframe — which is the window minus the sidebar and the
  // addons panel, often narrower than that. Without this, the split control
  // shows as a lone copy button depending on the reviewer's panel layout. The
  // mobile stories below override it, which is the only place that collapse is
  // meant to be seen.
  globals: { viewport: { value: 'laptop' } },
  parameters: {
    docs: {
      description: {
        component: [
          'Post-upvote share prompt, in four treatments. Start at `FourWayComparison`.',
          '',
          '- **Control** — the plain "Should anyone else see this post?" copy-link widget shipping today.',
          '- **Band** (`promptVariant="band"`) — a single line: encouraging copy on the left, one split copy-link control on the right, social networks a chevron away.',
          '- **Hero** (`promptVariant="hero"`) — the prominent card, with the tile row swapped for that same split control.',
          '- **Card** (`promptVariant="card"`) — the full block with eight social tiles always on screen.',
          '',
          'The prompt ships to everyone — no feature flag — and renders nothing at all when the post is not upvoted or the tracked short link has not resolved yet. `control` is one of the treatments rather than a flag state.',
          '',
          'Stories with a `play` function do not auto-run on this docs page — open them in the Canvas tab to see the interaction.',
        ].join('\n'),
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PostContentShare>;

// -- Hero: the card, with the networks in a dropdown ------------------------

// The prominent block keeps its upvote badge, headline and close button; only
// the eight-tile row changes, into the same split control the band uses.
export const Hero: Story = {
  args: { promptVariant: 'hero' },
  decorators: [withHarness({})],
};

export const HeroDark: Story = {
  args: { promptVariant: 'hero' },
  decorators: [withHarness({})],
  globals: { theme: 'dark', viewport: { value: 'laptop' } },
};

// The networks, one tap in.
export const HeroDropdownOpen: Story = {
  args: { promptVariant: 'hero' },
  decorators: [withHarness({})],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('More share options'));

    // Radix portals the menu outside the story canvas.
    const menu = within(document.body);
    await waitFor(() =>
      expect(menu.getByTestId('social-share-WhatsApp')).toBeInTheDocument(),
    );
  },
};

// Same mobile collapse as the band: below laptop width the split control
// becomes one button straight to the OS share sheet, so the hero and the card
// diverge most on the viewport where most posts are read.
export const HeroMobile: Story = {
  args: { promptVariant: 'hero' },
  decorators: [withHarness({})],
  globals: { viewport: { value: 'mobile1' } },
};

// -- Band: the in-between treatment -----------------------------------------

// Encouraging copy plus a single split control: copy on the left half, chevron
// on the right opening the social list. Lighter than the card, warmer than
// today's widget.
export const Band: Story = {
  args: { promptVariant: 'band' },
  decorators: [withHarness({})],
};

// The band on its own float surface — the heavier alternative now that flat
// (no fill, no border, no rule) is the default.
export const BandOnCardSurface: Story = {
  args: { promptVariant: 'band', surface: 'card' },
  decorators: [withHarness({})],
};

export const BandDark: Story = {
  args: { promptVariant: 'band' },
  decorators: [withHarness({})],
  globals: { theme: 'dark', viewport: { value: 'laptop' } },
};

// At 375px the row stacks and centres: copy above, control below.
//
// Note the chevron is gone. `ShareActions` short-circuits below laptop width
// for every non-inline variant, so the split control collapses to one button
// that opens the OS share sheet (falling back to copy where there is none).
// That is 6369's deliberate mobile path, not a layout bug — but it does mean
// the band offers a single tap on mobile where the card offers eight tiles.
export const BandMobile: Story = {
  args: { promptVariant: 'band' },
  decorators: [withHarness({})],
  globals: { viewport: { value: 'mobile1' } },
};

// The networks are one tap away rather than always on screen — this is the
// trade the band makes against the card.
export const BandDropdownOpen: Story = {
  args: { promptVariant: 'band' },
  decorators: [withHarness({})],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('More share options'));

    // Radix portals the menu outside the story canvas.
    const menu = within(document.body);
    await waitFor(() =>
      expect(menu.getByTestId('social-share-WhatsApp')).toBeInTheDocument(),
    );
  },
};

// Copy confirmation: the glyph cross-fades to a green check. Same 1s timer as
// the card variant, held open here so there is something to look at.
export const BandCopying: Story = {
  args: { promptVariant: 'band' },
  decorators: [withHarness({})],
  play: async ({ canvasElement }) => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined },
    });

    const realSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = ((
      handler: TimerHandler,
      ms?: number,
      ...rest: unknown[]
    ) =>
      ms === 1000
        ? 0
        : realSetTimeout(handler, ms, ...rest)) as typeof setTimeout;

    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: 'Copy link' }));
      await waitFor(() =>
        expect(canvas.getByRole('button', { name: 'Copy link' })).toBeEnabled(),
      );
    } finally {
      globalThis.setTimeout = realSetTimeout;
    }
  },
};

// Copy candidates, same control underneath — for picking wording, not layout.
const BAND_COPY_OPTIONS = [
  {
    title: 'Enjoyed this post?',
    description: 'Send it to someone who’d have opinions.',
  },
  {
    title: 'Good call. Now pass it on.',
    description: 'Send it to the one person who’ll actually read it.',
  },
  {
    title: 'Worth someone else’s time?',
    description: 'One tap to put it in front of them.',
  },
  {
    title: 'You upvoted it.',
    description: 'Someone you know would want to read it too.',
  },
];

export const BandCopyOptions: Story = {
  render: (args) => (
    <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-8 p-4">
      {BAND_COPY_OPTIONS.map((copy) => (
        <div key={copy.title} className="flex flex-col gap-2">
          <p className="text-text-quaternary typo-footnote">{copy.title}</p>
          <Harness>
            <PostContentShare {...args} promptVariant="band" {...copy} />
          </Harness>
        </div>
      ))}
    </div>
  ),
};

// -- Variant (flag on) ------------------------------------------------------

// The redesigned prompt at the peak-intent moment right after an upvote.
export const Redesigned: Story = {
  decorators: [withHarness({})],
};

// Same card on dark. Semantic tokens only — no hardcoded colours to drift.
export const RedesignedDark: Story = {
  decorators: [withHarness({})],
  globals: { theme: 'dark', viewport: { value: 'laptop' } },
};

// Not a visual state: the card's copy is fixed, so the post title never
// reaches the screen — it only feeds the share payload. This story asserts the
// outgoing network URL carries the full headline and the tracked short link,
// rather than pretending there is something to look at. Check the Interactions
// panel, not the pixels.
export const LongTitleSharePayload: Story = {
  args: { post: longTitlePost },
  decorators: [withHarness({})],
  play: async ({ canvasElement }) => {
    const opened: string[] = [];
    const realOpen = globalThis.open;
    globalThis.open = ((url?: string | URL) => {
      opened.push(String(url));
      return null;
    }) as typeof globalThis.open;

    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByTestId('social-share-X'));
      await waitFor(() => expect(opened).toHaveLength(1));

      // The share URL carries both as percent-encoded query params.
      const decoded = decodeURIComponent(opened[0]);
      expect(decoded).toContain(longTitlePost.title);
      expect(decoded).toContain(SHORT_LINK);
    } finally {
      globalThis.open = realOpen;
    }
  },
};

// Copy tapped: the chip flips to "Copied!" and the card stays mounted, so a
// second destination is still one tap away. The clipboard is stubbed because
// the Storybook iframe isn't allowed to write to the real one.
//
// `useCopyLink` clears `copying` on a 1s timer, which would leave nothing to
// look at a beat after the story loads. Swallowing that one 1s callback holds
// the confirmation on screen for review; the original `setTimeout` is restored
// straight after, so nothing else in the iframe is affected.
export const RedesignedCopying: Story = {
  decorators: [withHarness({})],
  play: async ({ canvasElement }) => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => undefined },
    });

    const realSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = ((
      handler: TimerHandler,
      ms?: number,
      ...rest: unknown[]
    ) =>
      ms === 1000
        ? 0
        : realSetTimeout(handler, ms, ...rest)) as typeof setTimeout;

    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByTestId('social-share-Copy link'));
      await waitFor(() =>
        expect(canvas.getByText('Copied!')).toBeInTheDocument(),
      );
    } finally {
      globalThis.setTimeout = realSetTimeout;
    }
  },
};

// Dismissed: the explicit close button is the only way out of the card, and it
// takes the prompt away for the rest of the session.
export const RedesignedDismissed: Story = {
  decorators: [withHarness({})],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Dismiss share prompt'));
    await waitFor(() =>
      expect(canvas.queryByText('Good call. Now pass it on.')).toBeNull(),
    );
  },
};

// Narrow viewport: the share row centres and wraps onto two rows.
export const RedesignedMobile: Story = {
  decorators: [withHarness({})],
  globals: { viewport: { value: 'mobile1' } },
};

// Mobile with a native share sheet available — the extra "Share via…" chip at
// the end of the row. This is what most real mobile traffic sees.
export const RedesignedMobileNativeShare: Story = {
  decorators: [withHarness({ nativeShare: true })],
  globals: { viewport: { value: 'mobile1' } },
};

// -- Control (flag off) -----------------------------------------------------

// Flag off — must render exactly what ships today.
export const Control: Story = {
  args: { promptVariant: 'control' },
  decorators: [withHarness({})],
};

// Today's widget on dark, for a like-for-like comparison with the variant.
export const ControlDark: Story = {
  args: { promptVariant: 'control' },
  decorators: [withHarness({})],
  globals: { theme: 'dark', viewport: { value: 'laptop' } },
};

// Today's widget at 375px — the copy-link input keeps its single row.
export const ControlMobile: Story = {
  args: { promptVariant: 'control' },
  decorators: [withHarness({})],
  globals: { viewport: { value: 'mobile1' } },
};

// -- Nothing rendered -------------------------------------------------------

// No upvote, no prompt — the widget sits on the post page at all times and
// gates itself on the interaction.
export const HiddenNotUpvoted: Story = {
  decorators: [
    withHarness({ upvoted: false }),
    withEmptyStateNote(
      'Not upvoted → the component returns null. The dashed box is story chrome; the component itself renders nothing inside it.',
    ),
  ],
};

// The prompt waits for the tracked short link rather than flashing the long
// URL and swapping it — so there is no intermediate visual state to review.
export const HiddenUntilLinkResolves: Story = {
  decorators: [
    withHarness({ linkResolved: false }),
    withEmptyStateNote(
      'Short link unresolved → the component returns null until `useGetShortUrl` settles. The dashed box is story chrome; the component itself renders nothing inside it.',
    ),
  ],
};

// -- Side by side -----------------------------------------------------------

// All four treatments stacked at one width, which is the only fair way to
// compare how much room each one takes in the post body.
export const FourWayComparison: Story = {
  render: (args) => (
    <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-8 p-4">
      {[
        {
          label: '1 — Control, shipping today',
          props: { promptVariant: 'control' as const },
        },
        {
          label: '2 — Band: one line, networks in the dropdown',
          props: { promptVariant: 'band' as const },
        },
        {
          label: '3 — Hero: the card, networks in the dropdown',
          props: { promptVariant: 'hero' as const },
        },
        {
          label: '4 — Card: all eight networks inline',
          props: { promptVariant: 'card' as const, surface: 'card' as const },
        },
      ].map(({ label, props }) => (
        <div key={label} className="flex flex-col gap-2">
          <p className="text-text-quaternary typo-footnote">{label}</p>
          <Harness>
            <PostContentShare {...args} {...props} />
          </Harness>
        </div>
      ))}
    </div>
  ),
};
