import React from 'react';
import nock from 'nock';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import basePost from '../../../../__tests__/fixture/post';
import ad from '../../../../__tests__/fixture/ad';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import {
  RankingAlgorithm,
  SOURCE_FEED_QUERY,
  baseFeedSupportedTypes,
} from '../../../graphql/feed';
import type { SettingsFlags } from '../../../graphql/settings';
import FeedContext from '../../../contexts/FeedContext';
import { FeedWidgetRail } from '../FeedWidgetRail';
import type { FeedWidget } from '../types';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { useFeedWidgetAd } from '../feedState';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../feedState', () => ({
  ...jest.requireActual('../feedState'),
  useFeedWidgetAd: jest.fn(),
}));

// jsdom has no PointerEvent, and without one fireEvent drops the button and
// the pointer type Radix and the trigger read.
class TestPointerEvent extends MouseEvent {
  pointerType: string;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? 'mouse';
  }
}
Object.assign(window, { PointerEvent: TestPointerEvent });

const webteam = generateTestSquad();
const design = generateTestSquad({
  id: 'design-squad',
  handle: 'design',
  name: 'Design crew',
  permalink: 'https://app.daily.dev/squads/design',
});

const setSettings = jest.fn();

// jsdom lays nothing out, so it has no element scrolling.
Element.prototype.scrollTo = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  mockDesktop();
  jest
    .mocked(useRouter)
    .mockImplementation(() => ({ pathname: '/' } as unknown as NextRouter));
  jest
    .mocked(useFeedWidgetAd)
    .mockReturnValue({ ad, isEnabled: true, isNoFill: false });
});

const squadWidget = (config?: FeedWidget['config']): FeedWidget => ({
  id: 'squad-a',
  kind: FeedWidgetKind.SquadUpdates,
  size: FeedWidgetSize.Tall,
  ...(config && { config }),
});

const renderRail = (widget: FeedWidget, version = 1) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser, squads: [webteam, design] }}
      settings={{
        flags: {
          feedWidgets: { version, widgets: [widget] },
        } as unknown as SettingsFlags,
        setSettings,
      }}
    >
      <FeedContext.Provider
        value={{ pageSize: 13, numCards: { eco: 4, roomy: 4, cozy: 4 } }}
      >
        <FeedWidgetRail feedName="popular" />
      </FeedContext.Provider>
    </TestBootProvider>,
  );

const revealWidgets = async () => {
  await waitFor(() =>
    expect(screen.getAllByTestId('feedWidget').length).toBeGreaterThan(0),
  );
  act(() => mockAllIsIntersecting(true));
};

const writtenWidgets = () =>
  setSettings.mock.calls.at(-1)?.[0].flags.feedWidgets.widgets;

const mockSquadPosts = () =>
  mockGraphQL({
    request: {
      query: SOURCE_FEED_QUERY,
      variables: {
        source: webteam.id,
        first: 20,
        loggedIn: true,
        ranking: RankingAlgorithm.Time,
        supportedTypes: baseFeedSupportedTypes,
      },
    },
    result: {
      data: {
        page: {
          pageInfo: { hasNextPage: false, endCursor: '' },
          edges: [
            {
              node: {
                ...basePost,
                id: 'pinned',
                title: 'Squad rules',
                pinnedAt: new Date().toISOString(),
              },
            },
            { node: { ...basePost, id: 'p1', title: 'Shipped the new nav' } },
          ],
        },
      },
    },
  });

describe('SquadUpdatesWidget', () => {
  it('asks for a squad when it has none and saves the pick', async () => {
    renderRail(squadWidget());
    await revealWidgets();

    expect(
      await screen.findByText('Pick a squad to see its newest posts here.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Design crew/ }));

    expect(writtenWidgets()).toEqual([
      squadWidget({ sourceId: 'design-squad' }),
    ]);
  });

  it("shows the squad's newest posts, without its pins", async () => {
    mockSquadPosts();
    renderRail(squadWidget({ sourceId: webteam.id }));
    await revealWidgets();

    expect(await screen.findByText('Shipped the new nav')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: `Open ${webteam.name}` }),
    ).toHaveAttribute('href', webteam.permalink);
    expect(screen.queryByText('Squad rules')).not.toBeInTheDocument();
  });

  it('offers the picker again when the reader left the squad', async () => {
    renderRail(squadWidget({ sourceId: 'left-squad' }));
    await revealWidgets();

    expect(
      await screen.findByText(
        'You’re no longer in that squad. Pick another one.',
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Web team/ }));

    expect(writtenWidgets()).toEqual([squadWidget({ sourceId: webteam.id })]);
  });

  it('changes the squad from the menu in edit mode', async () => {
    mockSquadPosts();
    renderRail(squadWidget({ sourceId: webteam.id }));
    await revealWidgets();
    await screen.findByText('Shipped the new nav');

    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Squad updates options' }),
      { key: 'Enter' },
    );
    const [change] = screen
      .getAllByRole('menuitem', { name: 'Change squad' })
      .filter((item) => item.tagName === 'BUTTON');
    fireEvent.click(change);

    expect(
      await screen.findByText('Pick the squad this widget shows.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Web team/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Shipped the new nav')).toBeInTheDocument();
    expect(setSettings).not.toHaveBeenCalled();
  });

  it('offers no picker it could not save from', async () => {
    // A newer build's config is not read, and a newer rail is not written.
    renderRail({ ...squadWidget({ sourceId: webteam.id }), v: 2 });
    await revealWidgets();

    expect(
      await screen.findByText(
        'This widget was set up in a newer version of daily.dev.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Web team/ }),
    ).not.toBeInTheDocument();
  });

  it('leaves edit mode to ask for a squad once added', async () => {
    renderRail(
      {
        id: 'top',
        kind: FeedWidgetKind.TopStory,
        size: FeedWidgetSize.Small,
      },
      1,
    );
    await revealWidgets();

    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Add a widget' })[0]);
    const row = (await screen.findByText('Squad updates')).closest('div');
    fireEvent.click(
      within(row as HTMLElement).getByRole('button', {
        name: 'Add',
      }),
    );

    // Edit mode would leave the new widget's picker inert.
    expect(
      await screen.findByRole('button', { name: 'Customize' }),
    ).toBeInTheDocument();
    expect(writtenWidgets()).toContainEqual(
      expect.objectContaining({ kind: FeedWidgetKind.SquadUpdates }),
    );
  });
});
