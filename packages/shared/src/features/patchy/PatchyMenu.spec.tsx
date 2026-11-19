import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpotlightContext } from '../../components/spotlight/SpotlightContext';
import { PatchyMenu } from './PatchyMenu';
import type { PatchyContext } from './patchyContext';

const mockLogEvent = jest.fn();
const mockFollowTags = jest.fn(() => Promise.resolve({ successful: true }));
const mockBookmark = jest.fn();
const mockOpenTune = jest.fn();
const mockSetExplain = jest.fn();
const mockOpenSpotlight = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/', query: {} }),
}));
jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));
jest.mock('../../hooks/useFeedSettings', () => ({
  __esModule: true,
  default: () => ({ feedSettings: { includeTags: ['webdev'] } }),
}));
jest.mock('../../hooks/useTagAndSource', () => ({
  __esModule: true,
  default: () => ({ onFollowTags: mockFollowTags }),
}));
jest.mock('../../hooks/useBookmarkPost', () => ({
  useBookmarkPost: () => ({ toggleBookmark: mockBookmark }),
}));
jest.mock('../feedExplain/useOpenFeedTune', () => ({
  useOpenFeedTune: () => mockOpenTune,
}));
jest.mock('../feedExplain/useSetFeedExplain', () => ({
  useSetFeedExplain: () => mockSetExplain,
}));

const renderMenu = (context: PatchyContext) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SpotlightContext.Provider
        value={
          { open: mockOpenSpotlight } as unknown as React.ContextType<
            typeof SpotlightContext
          >
        }
      >
        <PatchyMenu context={context} />
      </SpotlightContext.Provider>
    </QueryClientProvider>,
  );

const labels = () =>
  screen.getAllByRole('button').map((element) => element.textContent) as (
    | string
    | null
  )[];

describe('PatchyMenu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('offers things to do with the post you have open', async () => {
    renderMenu({
      kind: 'post',
      post: {
        id: 'p1',
        tags: ['rust'],
        source: { handle: 'rustblog', name: 'Rust Blog', type: 'machine' },
      } as never,
      tag: 'rust',
    });
    expect(
      screen.getByRole('button', { name: 'Save for later' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Best of #rust' })).toHaveAttribute(
      'href',
      expect.stringContaining('tags/rust/best-of'),
    );
    expect(
      screen.getByRole('link', { name: 'More from this source' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Follow #rust' }));
    expect(mockFollowTags).toHaveBeenCalledWith({ tags: ['rust'] });
    expect(
      await screen.findByRole('button', { name: 'Following #rust' }),
    ).toBeDisabled();
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        target_type: 'patchy menu',
        target_id: 'follow',
        extra: JSON.stringify({ context: 'post' }),
      }),
    );
  });

  it('opens the feed debugger and Tune on For You', () => {
    renderMenu({ kind: 'forYou' });
    fireEvent.click(screen.getByRole('button', { name: 'Why these posts?' }));
    expect(mockSetExplain).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Tune my feed' }));
    expect(mockOpenTune).toHaveBeenCalled();
  });

  it('skips following a tag you already follow', () => {
    renderMenu({ kind: 'tag', tag: 'webdev' });
    expect(labels()).not.toContain('Follow #webdev');
    expect(
      screen.getByRole('link', { name: 'Best of #webdev' }),
    ).toBeInTheDocument();
  });

  it('turns a search into other places to look', () => {
    renderMenu({ kind: 'search', query: 'event sourcing' });
    expect(
      screen.getByRole('link', { name: 'Look for #event-sourcing' }),
    ).toHaveAttribute('href', expect.stringContaining('provider=tags'));
    expect(
      screen.getByRole('link', { name: 'Search the web' }),
    ).toHaveAttribute('target', '_blank');
  });

  it('falls back to reading, trending and search', () => {
    renderMenu({ kind: 'other' });
    expect(
      screen.getByRole('button', { name: 'What to read?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'What’s trending?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Search daily.dev' }),
    ).toBeInTheDocument();
  });
});
