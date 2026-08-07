import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  mockMatchMedia,
  noHoverQuery,
} from '../../../../__tests__/helpers/media';
import { AgentProvider, useAgent } from '../AgentContext';
import { AgentAddToChatButton } from './AgentAddToChatButton';

const setPointer = (canHover: boolean) =>
  mockMatchMedia((query) => query === noHoverQuery && !canHover);

const attachment = {
  id: 'post:p1',
  kind: 'post' as const,
  label: 'Zig 0.15 release notes',
};

const Chips = () => {
  const { attachments } = useAgent();

  return <div data-testid="chips">{attachments.length}</div>;
};

const renderButton = (props: Partial<{ reveal: boolean }> = {}) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" isDemo initialMessages={[]}>
        <AgentAddToChatButton attachment={attachment} {...props} />
        <Chips />
      </AgentProvider>
    </TestBootProvider>,
  );

const chipCount = () => screen.getByTestId('chips').textContent;

beforeEach(() => {
  jest.clearAllMocks();
  setPointer(true);
});

describe('AgentAddToChatButton', () => {
  it('says what it does, since nobody arrives knowing this control', () => {
    renderButton();

    expect(screen.getByText('Add to chat')).toBeInTheDocument();
  });

  it('points the next prompt at the thing it belongs to', () => {
    renderButton();

    fireEvent.click(screen.getByLabelText(/^Add to chat:/));

    expect(chipCount()).toBe('1');
  });

  it('says so once the thing is already in the chat', () => {
    renderButton();

    fireEvent.click(screen.getByLabelText(/^Add to chat:/));

    expect(screen.getByText('In the chat')).toBeInTheDocument();
    expect(screen.getByLabelText(/^In the chat:/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('pressing it twice leaves one chip, not two', () => {
    renderButton();

    fireEvent.click(screen.getByLabelText(/^Add to chat:/));
    fireEvent.click(screen.getByLabelText(/^In the chat:/));

    expect(chipCount()).toBe('1');
  });

  // A finger has no hover, so a revealed button is on screen the whole time —
  // and a 130px button beside a post title in a 375px column leaves the title
  // four words wide.
  it('keeps the glyph and drops the words on a touch device', () => {
    setPointer(false);
    renderButton({ reveal: true });

    expect(screen.queryByText('Add to chat')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Add to chat:/)).toBeInTheDocument();
  });

  it('keeps the words where there is a pointer to reveal them', () => {
    renderButton({ reveal: true });

    expect(screen.getByText('Add to chat')).toBeInTheDocument();
  });

  it('names what it is pointing at, for anyone listening rather than looking', () => {
    renderButton();

    expect(
      screen.getByLabelText('Add to chat: Zig 0.15 release notes'),
    ).toBeInTheDocument();
  });
});
