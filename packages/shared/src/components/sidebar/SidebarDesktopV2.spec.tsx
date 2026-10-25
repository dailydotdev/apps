import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { SpotlightProvider } from '../spotlight/SpotlightContext';
import { SidebarDesktopV2 } from './SidebarDesktopV2';

jest.mock('../../hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: () => true,
}));

const renderRail = (activePage: string): RenderResult =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: defaultUser, isLoggedIn: true }}
    >
      <SpotlightProvider>
        <SidebarDesktopV2 activePage={activePage} />
      </SpotlightProvider>
    </TestBootProvider>,
  );

const selectedTabs = () =>
  Array.from(document.querySelectorAll('[role="tab"][aria-selected="true"]'));

beforeEach(() => {
  jest.mocked(useRouter).mockReturnValue({
    query: {},
    pathname: '/',
    asPath: '/',
    push: jest.fn(),
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  } as unknown as NextRouter);
});

describe('SidebarDesktopV2 rail selection', () => {
  it('selects Home and no tab on the home feed', () => {
    renderRail('/');

    expect(screen.getByLabelText('Home')).toHaveAttribute(
      'aria-current',
      'page',
    );
    // Explore is the fallback category, so it used to light up here purely
    // because `/` resolves to it. Home is the only selected affordance now.
    expect(selectedTabs()).toHaveLength(0);
  });

  it('keeps Home selected on a custom feed, which is a top-nav tab', () => {
    renderRail('/feeds/my-custom-feed');

    // Custom feeds live in the feed's own nav beside For You, not in any rail
    // panel, so Explore must not claim them just for being the fallback.
    expect(selectedTabs()).toHaveLength(0);
    // Home is the selected affordance, but the page is not Home, so the link
    // does not claim to point at the current page.
    expect(screen.getByLabelText('Home')).not.toHaveAttribute('aria-current');
  });

  it('selects Explore, and not Home, on an Explore page', () => {
    renderRail('/posts');

    expect(screen.getByLabelText('Home')).not.toHaveAttribute('aria-current');
    expect(selectedTabs().map((tab) => tab.getAttribute('id'))).toEqual([
      'sidebar-category-main',
    ]);
  });
});

describe('SidebarDesktopV2 panel items', () => {
  it('links Happening Now to the highlights page', async () => {
    renderRail('/');

    const item = await screen.findByText('Happening Now');
    // eslint-disable-next-line testing-library/no-node-access
    expect(item.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('/highlights'),
    );
  });

  it.each([
    ['Tags', '/tags'],
    ['Sources', '/sources'],
    ['Leaderboard', '/users'],
  ])('lists %s in the Explore panel', async (name, href) => {
    renderRail('/posts');

    const item = await screen.findByText(name);
    // eslint-disable-next-line testing-library/no-node-access
    expect(item.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining(href),
    );
  });
});

describe('SidebarDesktopV2 for a visitor', () => {
  const showLogin = jest.fn();
  const renderVisitorRail = (): RenderResult =>
    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ user: undefined, isLoggedIn: false, showLogin }}
      >
        <SpotlightProvider>
          <SidebarDesktopV2 activePage="/posts" />
        </SpotlightProvider>
      </TestBootProvider>,
    );

  beforeEach(() => {
    showLogin.mockReset();
  });

  it('keeps the account-only rail items off', () => {
    renderVisitorRail();

    expect(document.getElementById('sidebar-category-gameCenter')).toBeNull();
    expect(screen.queryByLabelText('New post')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Invite friends')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Get the daily.dev mobile app'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Log in' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'You' })).not.toBeInTheDocument();
    expect(document.getElementById('sidebar-category-main')).not.toBeNull();
    expect(document.getElementById('sidebar-category-squads')).not.toBeNull();
  });

  it('keeps the Streak tab and Invite for a member', () => {
    renderRail('/posts');

    expect(
      document.getElementById('sidebar-category-gameCenter'),
    ).not.toBeNull();
    expect(screen.getByLabelText('Invite friends')).toBeInTheDocument();
  });
});
