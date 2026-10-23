import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { Device, devices } from '../../history/device';
import { Callout, DocPage, Section } from '../../history/doc';
import type { Start } from './page';
import { PostPageWithFeed } from './page';
import type { VariantId } from './variants';
import { VARIANT_IDS, VARIANTS } from './variants';
import { DEFAULT_POST_ID, posts } from './data';
import { DemoVideo } from './video';

// Five ways to keep a reader on daily.dev after the post they came for:
// a feed under the post page. Every variation sits under production's real
// post page with real public posts, at laptop, tablet and phone widths.
// Click any card to open it: it becomes the page's post and its feed
// re-ranks, so each variation can be read through, post to post.

const meta: Meta = {
  title: 'Experiments/Post page feed',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

type Size = keyof typeof devices;

const App = ({
  variant,
  size,
  start = 'feed',
  postId,
  fit = true,
}: {
  variant: VariantId;
  size: Size;
  start?: Start;
  postId?: string;
  fit?: boolean;
}): ReactElement => {
  const device = devices[size];
  return (
    <Device
      width={device.width}
      height={device.height}
      label={device.label}
      note="Scroll inside · click a card to open it"
      fit={fit}
    >
      <PostPageWithFeed variant={variant} start={start} postId={postId} />
    </Device>
  );
};

const VariantTitle = ({ id }: { id: VariantId }): ReactElement => {
  const variant = VARIANTS[id];
  return (
    <span className="flex items-baseline gap-3">
      <span className="text-text-quaternary">{variant.letter}</span>
      {variant.name}
    </span>
  );
};

const Facts = ({ id }: { id: VariantId }): ReactElement => {
  const variant = VARIANTS[id];
  return (
    <dl className="grid gap-x-8 gap-y-4 tablet:grid-cols-2 laptop:grid-cols-4">
      {[
        ['What the reader sees', variant.what],
        ['The bet', variant.bet],
        ['The risk', variant.risk],
        ['Decided by', variant.metric],
      ].map(([term, text]) => (
        <div key={term} className="flex flex-col gap-1">
          <dt className="font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption1">
            {term}
          </dt>
          <dd className="text-pretty text-text-secondary typo-callout">
            {text}
          </dd>
        </div>
      ))}
    </dl>
  );
};

/** One variation at the three widths that change its layout. */
const VariantPage = ({ id }: { id: VariantId }): ReactElement => {
  const variant = VARIANTS[id];
  return (
    <DocPage
      eyebrow={`Post page feed · Variation ${variant.letter}`}
      title={variant.name}
      intro={<p>{variant.what}</p>}
    >
      <Facts id={id} />
      <Section
        title="Laptop"
        lead="Production's post page as most readers have it (layout_v2_2 off). Each frame opens scrolled to the end of the post, so the feed is in view."
      >
        <App variant={id} size="laptopL" />
      </Section>
      <Section title="Tablet and phone">
        <div className="flex flex-wrap items-start gap-10">
          <div className="w-[34rem] max-w-full">
            <App variant={id} size="tablet" />
          </div>
          <div className="w-[23.4375rem] max-w-full">
            <App variant={id} size="phone" />
          </div>
        </div>
      </Section>
    </DocPage>
  );
};

/* ------------------------------------------------------------- overview */

const OverviewPage = (): ReactElement => (
  <DocPage
    eyebrow="Experiments · Post page feed"
    title="Five ways to keep reading after the post"
    intro={
      <>
        <p>
          Today the post page ends at the comments, with a short list of related
          posts in the side column (under the comments on phones). These are
          five ideas for a real feed under the post, each a different bet on why
          the reader is still there.
        </p>
        <p>
          Every frame is production’s real post page with real public posts from
          daily.dev, and production’s feed cards wherever a feed card fits.
          Scroll inside a frame. Click a card and it becomes the page’s post,
          with its feed ranked again for it.
        </p>
      </>
    }
  >
    <Section
      title="The five at a glance"
      lead="At phone width, side by side. Each phone opens at the end of the post; scroll inside it."
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] items-start gap-8">
        {VARIANT_IDS.map((id) => (
          <div key={id} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold typo-title3">
                <VariantTitle id={id} />
              </h3>
              <p className="text-pretty text-text-tertiary typo-footnote">
                {VARIANTS[id].what}
              </p>
            </div>
            <App variant={id} size="phone" />
          </div>
        ))}
      </div>
    </Section>
    <Section title="How they differ">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] border-collapse text-left typo-callout">
          <thead>
            <tr className="border-b border-border-subtlest-tertiary text-text-quaternary typo-footnote">
              <th className="py-3 pr-6 font-bold">Variation</th>
              <th className="py-3 pr-6 font-bold">The bet</th>
              <th className="py-3 pr-6 font-bold">The risk</th>
              <th className="py-3 font-bold">Decided by</th>
            </tr>
          </thead>
          <tbody>
            {VARIANT_IDS.map((id) => (
              <tr
                key={id}
                className="border-b border-border-subtlest-tertiary align-top"
              >
                <td className="py-4 pr-6 font-bold">
                  <VariantTitle id={id} />
                </td>
                <td className="text-pretty py-4 pr-6 text-text-secondary">
                  {VARIANTS[id].bet}
                </td>
                <td className="text-pretty py-4 pr-6 text-text-secondary">
                  {VARIANTS[id].risk}
                </td>
                <td className="py-4 text-text-secondary">
                  {VARIANTS[id].metric}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
    <Section title="What all five share">
      <div className="grid gap-4 laptop:grid-cols-2">
        <Callout title="After the comments, never before">
          The post and its discussion come first. The feed starts where the page
          ends today, so nothing a reader came for moves.
        </Callout>
        <Callout title="Ranked for this post">
          Shared tags first, then the same source, then what is being discussed.
          Each variation says why a post is there, in its own way.
        </Callout>
        <Callout title="One click reads on" tone="brand">
          A card opens the next post on the same page. The feed under it is
          ranked for the new post, so reading never hits a dead end.
        </Callout>
        <Callout title="Needs one production change" tone="warn">
          Below laptop the post page is one column: the post, its comments, then
          the side widgets and the site footer. The feed belongs right after the
          comments, so PostContent needs a slot there. This review puts the feed
          in that spot from outside; nothing in production was changed.
        </Callout>
      </div>
    </Section>
  </DocPage>
);

export const Overview: Story = {
  name: '1. Overview',
  render: () => <OverviewPage />,
};

/* ----------------------------------------------------------- playground */

interface PlaygroundArgs {
  variant: VariantId;
  size: Size;
  start: Start;
  postId: string;
}

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '2. Playground',
  args: {
    variant: 'list',
    size: 'laptopL',
    start: 'feed',
    postId: DEFAULT_POST_ID,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: VARIANT_IDS,
      labels: Object.fromEntries(
        VARIANT_IDS.map((id) => [
          id,
          `${VARIANTS[id].letter} · ${VARIANTS[id].name}`,
        ]),
      ),
    },
    size: { control: 'select', options: Object.keys(devices) },
    start: { control: 'inline-radio', options: ['feed', 'top'] },
    postId: {
      name: 'post',
      control: 'select',
      options: posts.map((post) => post.id),
      labels: Object.fromEntries(
        posts.map((post) => [post.id, post.title?.slice(0, 60) ?? post.id]),
      ),
    },
  },
  render: ({ variant, size, start, postId }) => (
    <div className="min-h-screen bg-background-default p-6">
      <App
        key={`${variant}-${size}-${start}-${postId}`}
        variant={variant}
        size={size}
        start={start}
        postId={postId}
      />
    </div>
  ),
};

/* ----------------------------------------------------------- variations */

export const List: Story = {
  name: '3. A · Keep reading (list)',
  render: () => <VariantPage id="list" />,
};

export const Grid: Story = {
  name: '4. B · Feed continues (grid)',
  render: () => <VariantPage id="grid" />,
};

export const Shelves: Story = {
  name: '5. C · Pick a direction (shelves)',
  render: () => <VariantPage id="shelves" />,
};

export const UpNext: Story = {
  name: '6. D · Up next (endless reading)',
  render: () => <VariantPage id="next" />,
};

export const Edition: Story = {
  name: '7. E · Your edition (magazine)',
  render: () => <VariantPage id="edition" />,
};

/* ---------------------------------------------------------------- video */

/**
 * The team demo of A and B, desktop and phone side by side. Plays on its
 * own here; the MP4 is recorded from it frame by frame.
 */
export const Video: Story = {
  name: '8. Demo video (A and B)',
  render: () => <DemoVideo />,
};
