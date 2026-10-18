import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fireEvent, userEvent, waitFor } from 'storybook/test';
import ExtensionProviders from '../../extension/_providers';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import { providerHandlers } from '../why-recommended/whyRecommended.mocks';
import type { PersonalizationState } from './policy/rank';
import { PersonalizationProvider } from './components/PersonalizationContext';
import {
  FeedExplainPage,
  FeedLayout,
  preventNavigation,
} from './components/FeedExplainPage';
import { FeedSettingsScreen } from './components/settings/FeedSettingsScreen';
import { FeedSettingsPage } from './components/settings/pages';
import {
  mockSettingsRoute,
  settingsHandlers,
} from './components/settings/settingsMocks';
import { PlanSwitch } from './components/plus';
import { candidatePool, PersonaId, personas } from './personas';

const meta: Meta = {
  title: 'Features/Feed Free vs Plus',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [...settingsHandlers, ...providerHandlers] },
  },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

// Call from `beforeEach` so Storybook's mock restore undoes it between stories.
const bootAsPlus = (): void => {
  getBootMock.mockReturnValue({
    ...defaultBootData,
    user: { ...defaultBootData.user, isPlus: true },
  });
};

const phone = { viewport: { value: 'mobile2', isRotated: false } };

const Feed = ({ layout = FeedLayout.Grid }: { layout?: FeedLayout }) => (
  <ExtensionProviders>
    <PlanSwitch />
    <div id="__next">
      <FeedExplainPage
        pool={candidatePool}
        initialState={personas[PersonaId.TwoWeeksIn].state}
        layout={layout}
        initialExplain
      />
    </div>
  </ExtensionProviders>
);

const settingsState: PersonalizationState = {
  ...personas[PersonaId.TwoWeeksIn].state,
  blockedTags: ['vibe-coding'],
  blockedSources: ['80lv'],
};

const Settings = ({ page }: { page: FeedSettingsPage }): ReactElement => (
  <ExtensionProviders>
    <PlanSwitch isFloatingOnPhone />
    <div id="__next">
      <PersonalizationProvider
        pool={candidatePool}
        initialState={settingsState}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClickCapture={preventNavigation}>
          <FeedSettingsScreen initialPage={page} />
        </div>
      </PersonalizationProvider>
    </div>
  </ExtensionProviders>
);

const sayWhatsOff =
  (complaint: string): Story['play'] =>
  async ({ canvasElement }) => {
    const input = await waitFor(() => {
      const field = canvasElement.querySelector<HTMLInputElement>(
        'input[aria-label="Tell us what\'s off about your feed"]',
      );
      if (!field) {
        throw new Error('Waiting for the Explain bar');
      }
      return field;
    });
    fireEvent.change(input, { target: { value: complaint } });
    const send = input.form?.querySelector<HTMLButtonElement>(
      'button[aria-label="Send"]',
    );
    await waitFor(() => {
      if (!send || send.disabled) {
        throw new Error('Waiting for Send');
      }
    });
    await userEvent.click(send as HTMLButtonElement);
  };

const openTopic: Story['play'] = async ({ canvasElement }) => {
  await waitFor(() => {
    const value = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label^="Boost for #ai:"]',
    );
    if (!value) {
      throw new Error('Waiting for the topic rows');
    }
    value.click();
  });
};

const split: Array<{ where: string; free: string; plus: string }> = [
  {
    where: 'Cards in Explain mode',
    free: 'Why each card is here, follow, block, Fewer like this, and Not interested, Less or Auto on each topic.',
    plus: 'The exact boost for each topic.',
  },
  {
    where: 'Full explanation',
    free: 'All of it, score breakdown included.',
    plus: 'Same.',
  },
  {
    where: "What's off?",
    free: 'Suggestions to follow, unfollow, block, show less, mark as not interested, stop popular fill-ins or stop learning.',
    plus: 'Also the suggestions that set a number: boost a topic, favor newer posts, spread out sources and the rest.',
  },
  {
    where: 'Overview',
    free: 'Your AI agent, Learn from your reading, popular fill-ins, what shapes your feed, and every reset.',
    plus: 'Same.',
  },
  {
    where: 'Topics',
    free: 'Follow, the tag directory, and Not interested, Less or Auto on each topic.',
    plus: 'The exact boost for each topic.',
  },
  {
    where: 'Sources and people',
    free: 'Follow, and Not interested, Less or Auto on each source.',
    plus: 'The exact boost for each source.',
  },
  {
    where: 'Ranking',
    free: 'Every setting, read only.',
    plus: 'Changing any of them.',
  },
  {
    where: 'Filters',
    free: 'Content types and blocks.',
    plus: 'Blocked words, as today.',
  },
  {
    where: 'AI superpowers and General',
    free: 'As today.',
    plus: 'As today.',
  },
];

const needs: string[] = [
  "Not interested and Less per topic and source: control_demote is in the policy config at ×0.8 but never applied. Lowering a topic's boost alone barely moves a page, because its posts also come in through other topics and follows, so here both halve every post that carries the topic or comes from the source. Not interested also unfollows it. It needs a level stored per user for each topic and source, applied to the post score.",
  'Exact boosts and ranking settings: daily-api checks Plus before saving them and stops sending them to the feed when Plus ends. They stay stored, so subscribing again brings them back. The MCP tools go through the same check, so an agent can change what the plan allows.',
  "What's off?: the model only offers a free viewer changes the free plan can make, and shows the rest locked.",
];

export const Split: Story = {
  name: "0 · What's free, what's Plus",
  render: () => (
    <div className="flex min-h-screen flex-col gap-8 bg-background-default p-4 tablet:p-10">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-title2">
          Free picks what&apos;s in. Plus sets how much.
        </h1>
        <p className="text-text-secondary typo-callout">
          Free viewers can fix any feed: follow, block, Fewer like this, and Not
          interested, Less or Auto for each topic and source. Plus viewers set
          exact numbers: the boost for each topic and source, and every ranking
          setting. Every story here has a Free and Plus switch at the top.
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] max-w-[64rem] border-collapse text-left typo-footnote">
          <thead>
            <tr className="border-b border-border-subtlest-tertiary text-text-tertiary">
              <th className="py-2 pr-4 font-bold">Where</th>
              <th className="py-2 pr-4 font-bold">Free</th>
              <th className="py-2 font-bold">Plus adds</th>
            </tr>
          </thead>
          <tbody>
            {split.map((row) => (
              <tr
                key={row.where}
                className="border-b border-border-subtlest-tertiary align-top"
              >
                <td className="py-3 pr-4 font-bold text-text-primary">
                  {row.where}
                </td>
                <td className="py-3 pr-4 text-text-secondary">{row.free}</td>
                <td className="py-3 text-text-secondary">{row.plus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="flex max-w-[48rem] flex-col gap-3">
        <h2 className="font-bold text-text-primary typo-title3">
          What the split needs
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-text-secondary typo-callout">
          {needs.map((need) => (
            <li key={need}>{need}</li>
          ))}
        </ul>
      </section>
    </div>
  ),
};

export const TooMuchAIFree: Story = {
  name: '1 · Too much AI, free',
  render: () => <Feed />,
  play: sayWhatsOff('Too much AI'),
};

export const TooMuchAIPlus: Story = {
  name: '2 · Too much AI, Plus',
  beforeEach: bootAsPlus,
  render: () => <Feed />,
  play: sayWhatsOff('Too much AI'),
};

export const CardTopicFree: Story = {
  name: '3 · A topic on a card, free',
  render: () => <Feed />,
  play: openTopic,
};

export const TopicsFree: Story = {
  name: '4 · Topics, free',
  beforeEach: mockSettingsRoute,
  render: () => <Settings page={FeedSettingsPage.Topics} />,
};

export const RankingFree: Story = {
  name: '5 · Ranking, free',
  beforeEach: mockSettingsRoute,
  render: () => <Settings page={FeedSettingsPage.Ranking} />,
};

export const PhoneTooMuchAIFree: Story = {
  name: '6 · Too much AI on a phone, free',
  globals: phone,
  render: () => <Feed layout={FeedLayout.List} />,
  play: sayWhatsOff('Too much AI'),
};

export const PhoneTopicsFree: Story = {
  name: '7 · Topics on a phone, free',
  globals: phone,
  beforeEach: mockSettingsRoute,
  render: () => <Settings page={FeedSettingsPage.Topics} />,
};
