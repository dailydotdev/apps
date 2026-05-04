import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  const getEmojiButton = (
    container: HTMLElement,
    label: string,
  ): HTMLButtonElement => {
    const button = container.querySelector<HTMLButtonElement>(
      `button[title="${label}"]`,
    );

    if (!button) {
      throw new Error(`Could not find ${label} emoji button`);
    }

    return button;
  };

  it('shows emojis by category when search is empty', async () => {
    const { container } = render(<EmojiPicker value="" onChange={jest.fn()} />);

    openPicker();

    expect(await screen.findByText('Smileys & emotion')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Smileys & emotion' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'People & body' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Flags' })).toBeInTheDocument();
    expect(getEmojiButton(container, 'grinning face')).toBeInTheDocument();
  });

  it('scrolls to category sections without hiding other categories', async () => {
    render(<EmojiPicker value="" onChange={jest.fn()} />);

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
    const { container } = render(<EmojiPicker value="" onChange={jest.fn()} />);

    openPicker();
    fireEvent.change(screen.getByPlaceholderText('Search emojis...'), {
      target: { value: 'rocket' },
    });

    await waitFor(() => {
      expect(getEmojiButton(container, 'rocket')).toBeVisible();
    });
    expect(screen.queryByText('Smileys & emotion')).not.toBeInTheDocument();
  });

  it('stores selected emojis and shows them as recently used', async () => {
    const onChange = jest.fn();
    const { container } = render(<EmojiPicker value="" onChange={onChange} />);

    openPicker();
    fireEvent.change(screen.getByPlaceholderText('Search emojis...'), {
      target: { value: 'rocket' },
    });
    await waitFor(() => {
      expect(getEmojiButton(container, 'rocket')).toBeInTheDocument();
    });
    fireEvent.click(getEmojiButton(container, 'rocket'));

    expect(onChange).toHaveBeenCalledWith('🚀');

    openPicker();

    expect(await screen.findByText('Recently used')).toBeInTheDocument();
    const recentSection = screen.getByText('Recently used').parentElement;
    expect(
      recentSection?.querySelector('button[title="rocket"]'),
    ).toBeInTheDocument();
  });
});
