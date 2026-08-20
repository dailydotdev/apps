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

  // A tooltip needs a ref, and `Link` is a plain function component.
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

  it('is dead until there is a prompt to share', () => {
    renderHeader(undefined);

    expect(screen.getByLabelText('Copy link')).toBeDisabled();
  });

  it('becomes a tick once the link is copied', () => {
    copied();
    renderHeader(interest());

    expect(screen.getByLabelText('Link copied')).toBeInTheDocument();
  });

  // `headerIcon` appends the header's tertiary ink after the caller's colour,
  // and equal specificity leaves the stylesheet order to decide.
  it('draws that tick in the success colour, not the header’s grey', () => {
    copied();
    renderHeader(interest());

    const tick = screen.getByLabelText('Link copied').querySelector('svg');

    expect(tick).toHaveClass('text-status-success');
    expect(tick).not.toHaveClass('text-text-tertiary');
  });
});

describe('the panel buttons', () => {
  // `Button` spreads incoming props before its own `aria-pressed={pressed}`, so
  // an undefined `pressed` deletes a raw `aria-pressed`.
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
