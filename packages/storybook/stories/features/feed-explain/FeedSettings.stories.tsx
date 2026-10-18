import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders from '../../extension/_providers';
import { providerHandlers } from '../why-recommended/whyRecommended.mocks';
import type { PersonalizationState } from './policy/rank';
import { PersonalizationProvider } from './components/PersonalizationContext';
import { preventNavigation } from './components/FeedExplainPage';
import { FeedSettingsScreen } from './components/settings/FeedSettingsScreen';
import { FeedSettingsPage } from './components/settings/pages';
import {
  mockSettingsRoute,
  settingsHandlers,
} from './components/settings/settingsMocks';
import { PlanSwitch } from './components/plus';
import { candidatePool, PersonaId, personas } from './personas';

const meta: Meta = {
  title: 'Features/Feed Settings',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [...settingsHandlers, ...providerHandlers] },
  },
  globals: { theme: 'dark' },
  beforeEach: mockSettingsRoute,
};

export default meta;

type Story = StoryObj;

// Two weeks in, with a topic and a source blocked so Filters has something.
const state: PersonalizationState = {
  ...personas[PersonaId.TwoWeeksIn].state,
  blockedTags: ['vibe-coding'],
  blockedSources: ['80lv'],
};

const Settings = ({
  page,
  isMenuOpen,
}: {
  page: FeedSettingsPage;
  isMenuOpen?: boolean;
}): ReactElement => (
  <ExtensionProviders>
    <PlanSwitch isFloatingOnPhone />
    <div id="__next">
      <PersonalizationProvider pool={candidatePool} initialState={state}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClickCapture={preventNavigation}>
          <FeedSettingsScreen initialPage={page} initialMenuOpen={isMenuOpen} />
        </div>
      </PersonalizationProvider>
    </div>
  </ExtensionProviders>
);

const phone = { viewport: { value: 'mobile2', isRotated: false } };

const moves: Array<{ today: string; next: string; holds: string }> = [
  {
    today: 'New',
    next: 'Overview',
    holds:
      'The first page. Your AI agent, Learn from your reading, popular fill-ins, what shapes For You at a glance, and Start over.',
  },
  {
    today: 'Tags',
    next: 'Topics',
    holds:
      'Topics you follow and topics from your reading, each with its boost, then the tag directory to follow more.',
  },
  {
    today: 'Content sources',
    next: 'Sources and people',
    holds: 'Sources and people you follow, each source with its boost.',
  },
  {
    today: 'New',
    next: 'Ranking',
    holds:
      'Every ranking setting, with Advanced for the rest. Free viewers see the values; Plus changes them.',
  },
  {
    today: 'Content preferences and Blocked content',
    next: 'Filters',
    holds:
      'Content and post types, then everything blocked. Topics and Sources link here instead of listing blocks.',
  },
  {
    today: 'AI superpowers',
    next: 'AI superpowers',
    holds: 'Unchanged.',
  },
  {
    today: 'General',
    next: 'General',
    holds: 'Unchanged, and last.',
  },
  {
    today: 'The separate Personalization page',
    next: 'Gone',
    holds:
      'Its sections are the pages above. Card links and the Feed settings button on For You open the matching page.',
  },
  {
    today: 'New',
    next: 'Tune, on For You',
    holds:
      "The same topic, source and ranking controls beside the live feed, opened from Explain or a page's Live preview. Both render from one list of controls, so neither can miss one.",
  },
];

export const WhatMoved: Story = {
  name: '0 · What moved where',
  render: () => (
    <div className="flex min-h-screen flex-col gap-4 bg-background-default p-4 tablet:p-10">
      <header className="flex max-w-[48rem] flex-col gap-1">
        <h1 className="font-bold text-text-primary typo-title2">
          Feed settings, rebuilt around personalization
        </h1>
        <p className="text-text-secondary typo-callout">
          Today&apos;s Feed settings pages and the separate Personalization page
          become one set of pages, so each thing has one place.
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] max-w-[64rem] border-collapse text-left typo-footnote">
          <thead>
            <tr className="border-b border-border-subtlest-tertiary text-text-tertiary">
              <th className="py-2 pr-4 font-bold">Today</th>
              <th className="py-2 pr-4 font-bold">New page</th>
              <th className="py-2 font-bold">What it holds</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move) => (
              <tr
                key={move.next + move.today}
                className="border-b border-border-subtlest-tertiary align-top"
              >
                <td className="py-3 pr-4 text-text-tertiary">{move.today}</td>
                <td className="py-3 pr-4 font-bold text-text-primary">
                  {move.next}
                </td>
                <td className="py-3 text-text-secondary">{move.holds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};

export const Overview: Story = {
  name: '1 · Overview',
  render: () => <Settings page={FeedSettingsPage.Overview} />,
};

export const Topics: Story = {
  name: '2 · Topics',
  render: () => <Settings page={FeedSettingsPage.Topics} />,
};

export const Sources: Story = {
  name: '3 · Sources and people',
  render: () => <Settings page={FeedSettingsPage.Sources} />,
};

export const Ranking: Story = {
  name: '4 · Ranking',
  render: () => <Settings page={FeedSettingsPage.Ranking} />,
};

export const Filters: Story = {
  name: '5 · Filters',
  render: () => <Settings page={FeedSettingsPage.Filters} />,
};

export const AI: Story = {
  name: '6 · AI superpowers',
  render: () => <Settings page={FeedSettingsPage.AI} />,
};

export const General: Story = {
  name: '7 · General',
  render: () => <Settings page={FeedSettingsPage.General} />,
};

export const PhoneMenu: Story = {
  name: '8 · Phone menu',
  globals: phone,
  render: () => <Settings page={FeedSettingsPage.Overview} isMenuOpen />,
};

export const PhoneOverview: Story = {
  name: '9 · Phone overview',
  globals: phone,
  render: () => <Settings page={FeedSettingsPage.Overview} />,
};

export const PhoneTopics: Story = {
  name: '10 · Phone topics',
  globals: phone,
  render: () => <Settings page={FeedSettingsPage.Topics} />,
};
