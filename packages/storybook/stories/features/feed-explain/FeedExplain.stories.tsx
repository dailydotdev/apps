import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import ExtensionProviders from '../../extension/_providers';
import { providerHandlers } from '../why-recommended/whyRecommended.mocks';
import type { TuningSeed } from './components/FeedTuningContext';
import { FeedTuningProvider } from './components/FeedTuningContext';
import { ExplainDetailsHost } from './components/ExplainDetails';
import {
  CardFrame,
  FeedExplainPage,
  FeedLayout,
} from './components/FeedExplainPage';
import { TuneLevel } from './components/feedExplain';
import {
  feedItem,
  forYouFeed,
  newViewer,
  reserveFeed,
} from './feedExplain.mocks';

// Follow and block in the full explanation update the feed settings cache
// optimistically and roll back on error, so the mutations have to succeed.
const feedSettingsHandlers = [
  ...['AddFiltersToFeed', 'RemoveFiltersFromFeed'].map((name) =>
    graphql.mutation(name, () =>
      HttpResponse.json({ data: { feedSettings: { id: 'for-you' } } }),
    ),
  ),
  ...['Follow', 'Unfollow', 'Block', 'Unblock'].map((name) =>
    graphql.mutation(name, () =>
      HttpResponse.json({ data: { [name.toLowerCase()]: { _: true } } }),
    ),
  ),
];

const meta: Meta = {
  title: 'Features/Feed Explain',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [...providerHandlers, ...feedSettingsHandlers] },
  },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

const Screen = ({
  layout = FeedLayout.Grid,
  initialExplain,
  initialDetailsId,
}: {
  layout?: FeedLayout;
  initialExplain?: boolean;
  initialDetailsId?: string;
}): ReactElement => (
  <ExtensionProviders>
    <div id="__next">
      <FeedExplainPage
        items={forYouFeed}
        reserve={reserveFeed}
        viewer={newViewer}
        layout={layout}
        initialExplain={initialExplain}
        initialDetailsId={initialDetailsId}
      />
    </div>
  </ExtensionProviders>
);

export const Prototype: Story = {
  name: '1 · Prototype',
  render: () => <Screen />,
};

export const ExplainOn: Story = {
  name: '2 · Explain on',
  render: () => <Screen initialExplain />,
};

export const FullExplanation: Story = {
  name: '3 · Full explanation',
  render: () => <Screen initialExplain initialDetailsId="Hd2eBXFkz" />,
};

export const Phone: Story = {
  name: '4 · Phone',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: () => <Screen layout={FeedLayout.List} initialExplain />,
};

const feedCounts = forYouFeed.reduce<Record<string, number>>(
  (counts, { signals }) => {
    signals.forEach(({ key }) => {
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  },
  {},
);

interface CardState {
  title: string;
  note: string;
  id: string;
  seed?: TuningSeed;
  layout?: FeedLayout;
}

const cardStates: CardState[] = [
  {
    title: 'Topic you picked',
    note: 'The reason names the onboarding pick that matched.',
    id: 'XCmmeq8ZC',
  },
  {
    title: 'Source you follow',
    note: 'Follows outrank topics, so the source row leads.',
    id: 'Hd2eBXFkz',
  },
  {
    title: 'From your reading',
    note: 'Nothing followed matched; a topic you keep opening did.',
    id: 'VNv8IMYss',
  },
  {
    title: 'Popular pick',
    note: 'No match at all. New feeds lean on these until they learn more.',
    id: 'BM2onQaux',
  },
  {
    title: 'Showing more',
    note: 'Plus pressed on #rust. The row turns green.',
    id: '9tLNItvh5',
    seed: { levels: { 'topic:rust': TuneLevel.More } },
  },
  {
    title: 'Showing less',
    note: 'Minus pressed on #ai. The post stays, its topic ranks lower.',
    id: 'AzxnBHN3V',
    seed: { levels: { 'topic:ai': TuneLevel.Less } },
  },
  {
    title: 'Blocked topic',
    note: 'Blocking anything on the post marks it to leave on refresh.',
    id: 'BM2onQaux',
    seed: { levels: { 'topic:gaming': TuneLevel.Blocked } },
  },
  {
    title: 'Blocked source',
    note: 'Blocked from another card: every XDA post shows this at once.',
    id: 'j4duNN9S2',
    seed: { levels: { 'source:xda-developers': TuneLevel.Blocked } },
  },
  {
    title: 'Fewer like this',
    note: 'The post-level escape hatch when no single topic is the problem.',
    id: 'DVZBShH7e',
    seed: { dismissed: ['DVZBShH7e'] },
  },
];

const listStates: CardState[] = [
  {
    title: 'List card',
    note: 'On phones the card folds the same way, so a few posts fit on one screen.',
    id: 'DFJTpz2Tw',
    layout: FeedLayout.List,
  },
  {
    title: 'List card, leaving',
    note: 'The title fades; the notice keeps its Undo.',
    id: 'CrehqCUVO',
    layout: FeedLayout.List,
    seed: { levels: { 'source:xda-developers': TuneLevel.Blocked } },
  },
];

const StateCard = ({ state }: { state: CardState }): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-3">
    <figcaption className="flex flex-col gap-1">
      <span className="font-bold text-text-primary typo-callout">
        {state.title}
      </span>
      <span className="text-text-tertiary typo-footnote">{state.note}</span>
    </figcaption>
    <FeedTuningProvider seed={state.seed}>
      <ExplainDetailsHost counts={feedCounts} viewer={newViewer}>
        <CardFrame
          item={feedItem(state.id)}
          index={0}
          layout={state.layout ?? FeedLayout.Grid}
          isExplain
        />
      </ExplainDetailsHost>
    </FeedTuningProvider>
  </figure>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
    {children}
  </section>
);

export const CardStates: Story = {
  name: '5 · Card states',
  render: () => (
    <ExtensionProviders>
      <div id="__next" className="flex flex-col gap-12 p-6 tablet:p-10">
        <header className="flex max-w-[45rem] flex-col gap-2">
          <h1 className="font-bold text-text-primary typo-title2">
            Explain mode, card by card
          </h1>
          <p className="text-text-secondary typo-callout">
            The Explain switch on For You keeps every card where it is and
            folds it to its source and title, then says why the post is here:
            one sentence for the reason, then the post&apos;s top topics and
            source, each with less, more and block. Full explanation opens the
            &quot;Why am I seeing this?&quot; view with every topic and the
            score breakdown. Changes save as you tap, every card sharing a
            topic or source updates at once, and Refresh feed swaps out what
            you blocked. Less and more are new: today the API only has follow
            and block.
          </p>
        </header>
        <Section title="Grid">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 tablet:grid-cols-2 laptop:grid-cols-3 laptopL:grid-cols-4">
            {cardStates.map((state) => (
              <StateCard key={state.title} state={state} />
            ))}
          </div>
        </Section>
        <Section title="List">
          <div className="grid max-w-[60rem] grid-cols-1 gap-8 laptop:grid-cols-2">
            {listStates.map((state) => (
              <StateCard key={state.title} state={state} />
            ))}
          </div>
        </Section>
      </div>
    </ExtensionProviders>
  ),
};
