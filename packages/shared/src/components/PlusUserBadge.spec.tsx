import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { PlusUserBadge } from './PlusUserBadge';

const member = { isPlus: true, plusMemberSince: new Date('2024-11-10') };

const renderBadge = ({
  viewerIsPlus = false,
  clickable,
}: { viewerIsPlus?: boolean; clickable?: boolean } = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: { ...loggedUser, isPlus: viewerIsPlus } }}
    >
      <PlusUserBadge user={member} clickable={clickable} />
    </TestBootProvider>,
  );

describe('PlusUserBadge', () => {
  it('should open the Plus page from the badge for free readers', () => {
    renderBadge();

    expect(
      screen.getByRole('button', { name: 'Plus member' }),
    ).toBeInTheDocument();
  });

  it('should not pitch Plus to readers who already have it', () => {
    renderBadge({ viewerIsPlus: true });

    expect(
      screen.queryByRole('button', { name: 'Plus member' }),
    ).not.toBeInTheDocument();
  });

  it('should not render a button when the badge sits inside a link', () => {
    renderBadge({ clickable: false });

    expect(
      screen.queryByRole('button', { name: 'Plus member' }),
    ).not.toBeInTheDocument();
  });
});
