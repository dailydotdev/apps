import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  mockDesktop,
  mockMatchMedia,
} from '../../../../__tests__/helpers/media';
import * as copy from '../../../hooks/useCopy';
import type { UserInterest } from '../../../graphql/interests';
import {
  UserInterestCadence,
  UserInterestStatus,
} from '../../../graphql/interests';
import { AgentProvider } from '../AgentContext';
import { AgentWorkspaceHeader } from './AgentWorkspaceHeader';

const interest = (over: Partial<UserInterest> = {}): UserInterest =>
  ({
    id: 'i1',
    query: 'Cool zig projects',
    status: UserInterestStatus.Active,
    cadence: UserInterestCadence.Daily,
    createdAt: '2026-01-01T09:00:00.000Z',
    ...over,
  } as UserInterest);

const renderHeader = (agent?: UserInterest) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" interest={agent} isDemo initialMessages={[]}>
        <AgentWorkspaceHeader />
      </AgentProvider>
    </TestBootProvider>,
  );

/** The press has already happened and the link is on the clipboard. */
const copied = () =>
  jest.spyOn(copy, 'useCopyLink').mockReturnValue([true, jest.fn()] as never);

beforeEach(() => {
  jest.clearAllMocks();
  mockDesktop();
});

afterEach(() => jest.restoreAllMocks());

describe('the workspace header', () => {
  it('is where the agent’s name is written', () => {
    renderHeader(interest());

    expect(
      screen.getByRole('heading', { name: 'Cool zig projects' }),
    ).toBeInTheDocument();
  });

  it('leads back to the agents screen', () => {
    renderHeader(interest());

    expect(
      screen.getByRole('link', { name: 'Back to agents' }),
    ).toHaveAttribute('href', '/agent');
  });

  // The tooltip round that link takes a ref. Handing it straight to `Link` — a
  // plain function component — dropped the ref, so the tooltip had no anchor.
  it('gives its tooltip something that can hold a ref', () => {
    const warn = jest.spyOn(console, 'error').mockImplementation();

    renderHeader(interest());

    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('Function components cannot be given refs'),
      expect.anything(),
      expect.anything(),
    );
  });
});

/**
 * The share control has to say which of the two things this press does: on a
 * desktop it copies a link, on a phone it opens the system sheet.
 */
describe('the share control', () => {
  it('says it copies a link on a desktop', () => {
    renderHeader(interest());

    expect(screen.getByLabelText('Copy link')).toBeInTheDocument();
    expect(screen.queryByLabelText('Share this agent')).not.toBeInTheDocument();
  });

  it('says it opens the sheet on a phone', () => {
    mockMatchMedia(() => false);
    renderHeader(interest());

    expect(screen.getByLabelText('Share this agent')).toBeInTheDocument();
    expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
  });

  // There is nothing to share before the agent has loaded.
  it('is dead until there is a prompt to share', () => {
    renderHeader(undefined);

    expect(screen.getByLabelText('Copy link')).toBeDisabled();
  });

  // The same control confirming, rather than a second one arriving: the toast is
  // a corner of the screen away and this is the only feedback there is.
  it('becomes a tick once the link is copied', () => {
    copied();
    renderHeader(interest());

    expect(screen.getByLabelText('Link copied')).toBeInTheDocument();
  });

  // The bug: the tick was built through `headerIcon`, which appends the header's
  // tertiary ink *after* whatever the caller asked for. Two text-colour
  // utilities of equal specificity, so the stylesheet's order decided, and the
  // tick came out grey.
  it('draws that tick in the success colour, not the header’s grey', () => {
    copied();
    renderHeader(interest());

    const tick = screen.getByLabelText('Link copied').querySelector('svg');

    expect(tick).toHaveClass('text-status-success');
    expect(tick).not.toHaveClass('text-text-tertiary');
  });
});

describe('the panel buttons', () => {
  // `Button` spreads incoming props *before* writing its own
  // `aria-pressed={pressed}`, so a raw `aria-pressed` attribute was deleted by
  // an undefined `pressed` and the toggles announced nothing.
  it('report whether the panel they own is open', () => {
    renderHeader(interest());

    const activity = screen.getByLabelText('Activity');

    expect(activity).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(activity);

    expect(screen.getByLabelText('Activity')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
