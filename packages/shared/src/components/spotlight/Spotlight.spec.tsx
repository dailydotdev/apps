import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import {
  SEARCH_POST_SUGGESTIONS,
  SOURCE_SPOTLIGHT_POSTS_LIMIT,
  SOURCE_SPOTLIGHT_POSTS_QUERY,
} from '../../graphql/search';
import { baseFeedSupportedTypes } from '../../graphql/feed';
import { SPOTLIGHT_ACTIONS_QUERY } from '../../graphql/spotlight';
import { feature } from '../../lib/featureManagement';
import { Spotlight } from './Spotlight';
import {
  SpotlightProvider,
  useSpotlight,
  useSpotlightPageSource,
} from './SpotlightContext';
import { SOURCE_POST_SUGGESTIONS_LIMIT } from './commands/search';
import type { SpotlightSource } from './types';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../hooks/useViewSize', () => ({
  ...(jest.requireActual('../../hooks/useViewSize') as Record<string, unknown>),
  useIsPhone: jest.fn(() => false),
}));

const mockUseIsPhone = jest.requireMock('../../hooks/useViewSize')
  .useIsPhone as jest.Mock;

const push = jest.fn();

const squad: SpotlightSource = {
  id: 'squad-id',
  handle: 'rabbits',
  name: 'Rabbit Hole',
  image: 'https://daily.dev/squad.png',
};

const mockSpotlightActions = (): void =>
  mockGraphQL({
    request: { query: SPOTLIGHT_ACTIONS_QUERY },
    result: { data: { spotlightActions: [] } },
  });

const mockSquadPosts = (): void =>
  mockGraphQL({
    request: {
      query: SOURCE_SPOTLIGHT_POSTS_QUERY,
      variables: {
        source: squad.id,
        first: SOURCE_SPOTLIGHT_POSTS_LIMIT,
        supportedTypes: baseFeedSupportedTypes,
      },
    },
    result: {
      data: {
        page: {
          edges: [
            {
              node: {
                id: 'pinned',
                title: 'Read this first',
                pinnedAt: '2026-09-01T00:00:00.000Z',
                createdAt: '2026-09-01T00:00:00.000Z',
                author: { name: 'Ido' },
              },
            },
            {
              node: {
                id: 'latest',
                title: 'Release notes',
                pinnedAt: null,
                createdAt: '2026-09-20T00:00:00.000Z',
                author: { name: 'Ido' },
              },
            },
          ],
        },
      },
    },
  });

const mockSuggestions = (
  query: string,
  hits: { id: string; title: string }[],
): void =>
  mockGraphQL({
    request: {
      query: SEARCH_POST_SUGGESTIONS,
      variables: {
        query,
        version: feature.searchVersion.defaultValue,
        limit: SOURCE_POST_SUGGESTIONS_LIMIT,
        source: squad.id,
      },
    },
    result: { data: { searchPostSuggestions: { hits } } },
  });

const Harness = ({ pageSource }: { pageSource?: SpotlightSource }) => {
  const { isOpen, close, openWithSource } = useSpotlight();
  useSpotlightPageSource(pageSource);

  return (
    <>
      <button type="button" onClick={() => openWithSource(squad)}>
        Search this squad
      </button>
      <Spotlight isOpen={isOpen} onClose={close} />
    </>
  );
};

const renderSpotlight = (pageSource?: SpotlightSource) =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user: loggedUser }}>
      <SpotlightProvider>
        <Harness pageSource={pageSource} />
      </SpotlightProvider>
    </TestBootProvider>,
  );

const getInput = () => screen.getByRole('combobox');

beforeAll(() => {
  // jsdom has no scrollIntoView; cmdk calls it when the arrow keys move.
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({
    push,
    pathname: '/squads/[handle]',
    query: {},
  } as unknown as NextRouter);
  mockSpotlightActions();
  mockSquadPosts();
  mockUseIsPhone.mockReturnValue(false);
});

describe('Spotlight scoped to a squad', () => {
  it('opens with the squad as a filter pill and lists its pinned and latest posts', async () => {
    renderSpotlight();
    fireEvent.click(screen.getByText('Search this squad'));

    expect(screen.getByTestId('source-filter-pill')).toHaveTextContent(
      squad.name,
    );
    expect(getInput()).toHaveAttribute(
      'placeholder',
      `Search ${squad.name} posts…`,
    );
    expect(
      await screen.findByRole('group', { name: `Pinned in ${squad.name}` }),
    ).toHaveTextContent('Read this first');
    expect(
      screen.getByRole('group', { name: `Latest in ${squad.name}` }),
    ).toHaveTextContent('Release notes');
  });

  it('widens to all of daily.dev on Backspace in an empty field, and narrows back', async () => {
    renderSpotlight();
    fireEvent.click(screen.getByText('Search this squad'));
    await screen.findByText('Read this first');

    fireEvent.keyDown(getInput(), { key: 'Backspace' });

    expect(screen.queryByTestId('source-filter-pill')).not.toBeInTheDocument();
    expect(getInput()).toHaveAttribute(
      'placeholder',
      'Search posts, squads, people, tags, or actions…',
    );

    fireEvent.click(screen.getByTestId('scope-chip-source'));

    expect(screen.getByTestId('source-filter-pill')).toBeInTheDocument();
  });

  it('widens when the pill is clicked', async () => {
    renderSpotlight();
    fireEvent.click(screen.getByText('Search this squad'));

    fireEvent.click(screen.getByTestId('source-filter-pill'));

    expect(screen.queryByTestId('source-filter-pill')).not.toBeInTheDocument();
    expect(await screen.findByText(`Search in ${squad.name}`)).toBeVisible();
  });

  it('suggests posts from the squad only and sends Enter to its results page', async () => {
    renderSpotlight();
    fireEvent.click(screen.getByText('Search this squad'));
    // Matches only a request that carries the squad as `source`.
    mockSuggestions('review', [{ id: 'p1', title: 'Code review tips' }]);

    fireEvent.change(getInput(), { target: { value: 'review' } });

    const group = await screen.findByRole('group', {
      name: `Posts in ${squad.name}`,
    });
    expect(group).toHaveTextContent('Code review tips');
    expect(
      screen.getByText(`See all results in ${squad.name}`),
    ).toBeInTheDocument();

    fireEvent.keyDown(getInput(), { key: 'Enter' });

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(`/squads/${squad.handle}?q=review`),
    );
  });

  it('opens a suggestion picked with the arrow keys', async () => {
    renderSpotlight();
    fireEvent.click(screen.getByText('Search this squad'));
    mockSuggestions('review', [{ id: 'p1', title: 'Code review tips' }]);

    fireEvent.change(getInput(), { target: { value: 'review' } });
    await screen.findByText('Code review tips');
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });
    fireEvent.keyDown(getInput(), { key: 'ArrowUp' });
    fireEvent.keyDown(getInput(), { key: 'Enter' });

    await waitFor(() => expect(push).toHaveBeenCalledWith('/posts/p1'));
  });

  it('offers all of daily.dev when nothing in the squad matches', async () => {
    renderSpotlight();
    fireEvent.click(screen.getByText('Search this squad'));
    mockSuggestions('nothing', []);

    fireEvent.change(getInput(), { target: { value: 'nothing' } });

    expect(
      await screen.findByText(`No posts in ${squad.name} match “nothing”`),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('Search all of daily.dev'));

    expect(screen.queryByTestId('source-filter-pill')).not.toBeInTheDocument();
    expect(getInput()).toHaveValue('nothing');
  });

  it('opens scoped to the page squad from the keyboard shortcut', async () => {
    renderSpotlight(squad);

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    expect(await screen.findByTestId('source-filter-pill')).toHaveTextContent(
      squad.name,
    );
  });

  it('keeps the shortcut global without a page squad', async () => {
    renderSpotlight();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    expect(await screen.findByRole('combobox')).toHaveAttribute(
      'placeholder',
      'Search posts, squads, people, tags, or actions…',
    );
    expect(screen.queryByTestId('source-filter-pill')).not.toBeInTheDocument();
  });
});

describe('Spotlight on a phone', () => {
  beforeEach(() => {
    mockUseIsPhone.mockReturnValue(true);
  });

  it('names the scope in the placeholder instead of a pill in the field', async () => {
    renderSpotlight();
    fireEvent.click(screen.getByText('Search this squad'));
    await screen.findByText('Read this first');

    expect(screen.queryByTestId('source-filter-pill')).not.toBeInTheDocument();
    expect(getInput()).toHaveAttribute(
      'placeholder',
      `Search in ${squad.name}`,
    );
    expect(screen.getByRole('button', { name: squad.name })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches scope from the bar of segments, one lit at a time', async () => {
    renderSpotlight();
    fireEvent.click(screen.getByText('Search this squad'));
    await screen.findByText('Read this first');

    fireEvent.click(screen.getByRole('button', { name: 'Tags' }));

    expect(getInput()).toHaveAttribute('placeholder', 'Search in tags');
    expect(screen.getByRole('button', { name: 'Tags' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: squad.name })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    fireEvent.click(screen.getByRole('button', { name: 'All' }));

    expect(getInput()).toHaveAttribute('placeholder', 'Search');
  });
});
