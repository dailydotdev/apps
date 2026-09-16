import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeedSettingsTagsSection } from './FeedSettingsTagsSection';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import type { FeedSettingsEditContextValue } from '../types';
import type { FeedSettings } from '../../../../graphql/feedSettings';
import { GET_ONBOARDING_TAGS_QUERY } from '../../../../graphql/feedSettings';
import { TAG_DIRECTORY_QUERY } from '../../../../graphql/keywords';
import { FeedType } from '../../../../graphql/feed';
import useTagAndSource from '../../../../hooks/useTagAndSource';
import { Origin } from '../../../../lib/log';

const mockRequest = jest.fn();
const mockFollow = jest.fn();
const mockUnfollow = jest.fn();
let mockFeedSettings: FeedSettings;

jest.mock('../../../../graphql/batch', () => ({
  gqlBatchRequest: (...args: unknown[]) => mockRequest(...args),
}));
jest.mock('../../../../hooks/useFeedSettings', () => ({
  __esModule: true,
  default: () => ({ feedSettings: mockFeedSettings }),
}));
jest.mock('../../../../hooks/useTagAndSource', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    onFollowTags: mockFollow,
    onUnfollowTags: mockUnfollow,
  })),
}));

const directory = {
  tags: [
    {
      value: 'containers',
      flags: { title: 'Containers' },
      createdAt: '2025-01-01',
    },
    { value: 'docker', flags: { title: 'Docker' }, createdAt: '2025-01-02' },
    { value: 'react', flags: { title: 'React' }, createdAt: '2025-01-03' },
    {
      value: 'ml',
      flags: { title: 'Machine Learning' },
      createdAt: '2025-01-04',
    },
  ],
  popularTags: [{ value: 'react' }],
  trendingTags: [],
};

const renderComponent = (type = FeedType.Main) => {
  const editFeedSettings = jest.fn((callback) => callback?.());
  const context = {
    feed: { id: 'feed-id', type },
    editFeedSettings,
  } as unknown as FeedSettingsEditContextValue;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const component = (
    <QueryClientProvider client={client}>
      <FeedSettingsEditContext.Provider value={context}>
        <FeedSettingsTagsSection />
      </FeedSettingsEditContext.Provider>
    </QueryClientProvider>
  );
  render(component);
  return { editFeedSettings };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockFeedSettings = { includeTags: ['docker', 'legacy-tag'] };
  mockRequest.mockImplementation((query) => {
    if (query === TAG_DIRECTORY_QUERY) {
      return Promise.resolve(directory);
    }
    if (query === GET_ONBOARDING_TAGS_QUERY) {
      return Promise.resolve({
        onboardingTags: { tags: [{ name: 'containers' }] },
      });
    }
    return Promise.reject(new Error('Unexpected query'));
  });
});

it('keeps followed tags first, including tags missing from the directory', async () => {
  renderComponent();
  await screen.findByRole('heading', { name: 'Popular tags' });
  const headings = screen
    .getAllByRole('heading')
    .map((heading) => heading.textContent);
  expect(headings.slice(0, 4)).toEqual([
    'My tags',
    'Recommended tags',
    'Popular tags',
    'Recently added tags',
  ]);
  const myTags = within(screen.getByRole('region', { name: 'My tags' }));
  expect(
    myTags.getByRole('button', { name: 'Unfollow docker' }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(
    myTags.getByRole('button', { name: 'Unfollow legacy-tag' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'Docker' }),
  ).not.toBeInTheDocument();
});

it.each([FeedType.Main, FeedType.Custom])(
  'follows and unfollows only the selected tag in the %s feed',
  async (type) => {
    const { editFeedSettings } = renderComponent(type);
    await screen.findByRole('heading', { name: 'Popular tags' });
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Follow containers' })[0],
    );
    expect(mockFollow).toHaveBeenCalledWith({ tags: ['containers'] });
    expect(mockFollow).toHaveBeenCalledTimes(1);
    fireEvent.click(
      within(screen.getByRole('region', { name: 'My tags' })).getByRole(
        'button',
        { name: 'Unfollow docker' },
      ),
    );
    expect(mockUnfollow).toHaveBeenCalledWith({ tags: ['docker'] });
    expect(editFeedSettings).toHaveBeenCalledTimes(2);
    expect(useTagAndSource).toHaveBeenCalledWith(
      expect.objectContaining({
        feedId: 'feed-id',
        origin: type === FeedType.Main ? Origin.TagsFilter : Origin.CustomFeed,
        shouldFilterLocally: false,
      }),
    );
    expect(mockRequest).toHaveBeenCalledTimes(2);
  },
);

it('searches my tags and the directory together, including backend display titles', async () => {
  renderComponent();
  await screen.findByRole('heading', { name: 'Popular tags' });
  fireEvent.input(screen.getByRole('textbox', { name: 'Search tags' }), {
    target: { value: 'docker' },
  });
  expect(
    within(screen.getByRole('region', { name: 'My tags' })).getByRole(
      'button',
      { name: 'Unfollow docker' },
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Results for “docker”' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Unfollow legacy-tag' }),
  ).not.toBeInTheDocument();
  fireEvent.input(screen.getByRole('textbox', { name: 'Search tags' }), {
    target: { value: 'machine learning' },
  });
  expect(screen.getByRole('button', { name: 'Follow ml' })).toHaveTextContent(
    'Machine Learning',
  );
  expect(
    screen.getByText('None of your tags match this search.'),
  ).toBeInTheDocument();
});

it('browses letters without following tags or hiding my tags', async () => {
  renderComponent();
  const navigation = await screen.findByRole('navigation', {
    name: 'Filter tags by letter',
  });
  fireEvent.click(within(navigation).getByRole('button', { name: 'd' }));
  expect(screen.getByRole('heading', { name: 'd' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'c' })).not.toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'My tags' })).toBeInTheDocument();
  expect(mockFollow).not.toHaveBeenCalled();
  fireEvent.click(within(navigation).getByRole('button', { name: 'All' }));
  expect(screen.getByRole('heading', { name: 'c' })).toBeInTheDocument();
});

it('keeps my tags usable when loading the directory fails and allows retrying', async () => {
  mockRequest.mockRejectedValue(new Error('Unavailable'));
  renderComponent();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "We couldn't load the tag directory.",
  );
  fireEvent.click(screen.getByRole('button', { name: 'Unfollow docker' }));
  expect(mockUnfollow).toHaveBeenCalledWith({ tags: ['docker'] });
  mockRequest.mockResolvedValue(directory);
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
  );
  expect(
    await screen.findByRole('navigation', { name: 'Filter tags by letter' }),
  ).toBeInTheDocument();
});
