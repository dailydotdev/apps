import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessageComposer } from './MessageComposer';

jest.mock('../../../components/popover/GifPopover', () => ({
  __esModule: true,
  default: () => null,
}));

const onSend = jest.fn();

const renderComposer = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MessageComposer username="ido" onSend={onSend} onSendGif={jest.fn()} />
    </QueryClientProvider>,
  );

const type = (value: string) => {
  const input = screen.getByRole('textbox') as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value } });
  input.setSelectionRange(value.length, value.length);
  fireEvent.select(input);

  return input;
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('should suggest emojis after a colon and insert the picked one on Enter instead of sending', async () => {
  renderComposer();
  const input = type('hey :rocke');

  expect(await screen.findByRole('listbox')).toBeInTheDocument();
  expect(screen.getAllByRole('option')[0]).toHaveTextContent('🚀');

  fireEvent.keyDown(input, { key: 'Enter' });

  expect(onSend).not.toHaveBeenCalled();
  expect(input.value).toBe('hey 🚀 ');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

  fireEvent.keyDown(input, { key: 'Enter' });

  expect(onSend).toHaveBeenCalledWith('hey 🚀');
});

it('should not suggest emojis for a colon inside a word', () => {
  renderComposer();
  type('meet at 10:30');

  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

it('should send on Enter and add a new line on Shift+Enter', () => {
  renderComposer();
  const input = type('first line');

  expect(fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })).toBe(true);
  expect(onSend).not.toHaveBeenCalled();

  type('first line\nsecond line');
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(onSend).toHaveBeenCalledWith('first line\nsecond line');
});

it('should add a new line on Enter on touch screens and send from the button', () => {
  const { matchMedia } = globalThis;
  globalThis.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query === '(pointer: coarse)',
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  try {
    renderComposer();
    const input = type('first line');

    // Not prevented, so the browser inserts the line break.
    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(true);
    expect(onSend).not.toHaveBeenCalled();

    type('first line\nsecond line');
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(onSend).toHaveBeenCalledWith('first line\nsecond line');
  } finally {
    globalThis.matchMedia = matchMedia;
  }
});
