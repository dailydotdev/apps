import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { EmojiPicker } from './EmojiPicker';

describe('EmojiPicker', () => {
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  let scrollIntoView: jest.Mock;

  beforeEach(() => {
    localStorage.clear();
    scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    localStorage.clear();
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  const openPicker = (): void => {
    fireEvent.click(screen.getByRole('button', { name: 'Pick emoji' }));
  };

  const renderEmojiPicker = (onChange = jest.fn()) => {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <EmojiPicker value="" onChange={onChange} />
      </QueryClientProvider>,
    );
  };

  const getEmojiButton = (label: string): HTMLButtonElement => {
    const button = document.body.querySelector<HTMLButtonElement>(
      `button[title="${label}"]`,
    );

    if (!button) {
      throw new Error(`Could not find ${label} emoji button`);
    }

    return button;
  };

  it('shows emojis by category when search is empty', async () => {
    renderEmojiPicker();

    openPicker();

    expect(await screen.findByText('Smileys & emotion')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Smileys & emotion' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'People & body' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Flags' })).toBeInTheDocument();
    expect(getEmojiButton('grinning face')).toBeInTheDocument();
  });

  it('scrolls to category sections without hiding other categories', async () => {
    renderEmojiPicker();

    openPicker();

    expect(await screen.findByText('Smileys & emotion')).toBeInTheDocument();
    expect(screen.getByText('People & body')).toBeInTheDocument();
    expect(screen.getByText('Flags')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'People & body' }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    expect(screen.getByText('Smileys & emotion')).toBeInTheDocument();
    expect(screen.getByText('Flags')).toBeInTheDocument();
  });

  it('shows search results instead of category sections', async () => {
    renderEmojiPicker();

    openPicker();
    fireEvent.change(screen.getByPlaceholderText('Search emojis...'), {
      target: { value: 'rocket' },
    });

    await waitFor(() => {
      expect(getEmojiButton('rocket')).toBeVisible();
    });
    expect(screen.queryByText('Smileys & emotion')).not.toBeInTheDocument();
  });

  it('stores selected emojis and shows them as recently used', async () => {
    const onChange = jest.fn();
    renderEmojiPicker(onChange);

    openPicker();
    fireEvent.change(screen.getByPlaceholderText('Search emojis...'), {
      target: { value: 'rocket' },
    });
    await waitFor(() => {
      expect(getEmojiButton('rocket')).toBeInTheDocument();
    });
    fireEvent.click(getEmojiButton('rocket'));

    expect(onChange).toHaveBeenCalledWith('🚀');

    openPicker();

    const recentHeading = await screen.findByText('Recently used');
    expect(recentHeading).toBeInTheDocument();
    expect(
      within(recentHeading.parentElement as HTMLElement).getByTitle('rocket'),
    ).toBeInTheDocument();
  });

  it('renders the dropdown through the root portal', async () => {
    const { container } = renderEmojiPicker();

    openPicker();

    await screen.findByText('Smileys & emotion');

    expect(
      within(container).queryByPlaceholderText('Search emojis...'),
    ).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search emojis...')).toHaveAttribute(
      'placeholder',
      'Search emojis...',
    );
  });
});
