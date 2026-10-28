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
import { useLayoutV2Fixes } from '../../hooks/layout/useLayoutV2Fixes';

jest.mock('../../hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: () => true,
}));

jest.mock('../../hooks/layout/useLayoutV2Fixes', () => ({
  useLayoutV2Fixes: jest.fn(),
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
  jest.mocked(useLayoutV2Fixes).mockReturnValue(false);
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

describe('SidebarDesktopV2 New post', () => {
  const newPost = () => document.getElementById('sidebar-create-post');
  const isAmongTabs = () =>
    !!screen
      .getByRole('tablist', { name: 'Sidebar categories' })
      .contains(newPost());

  it('sits among the reorderable tabs outside the layout v2 fixes experiment', () => {
    renderRail('/');

    expect(isAmongTabs()).toBe(true);
  });

  it('sits under Search, outside the tabs, in the layout v2 fixes experiment', () => {
    jest.mocked(useLayoutV2Fixes).mockReturnValue(true);
    renderRail('/');

    expect(isAmongTabs()).toBe(false);
    const searchThenNewPost = Array.from(
      document.querySelectorAll('[aria-label="Search"], #sidebar-create-post'),
    );
    expect(searchThenNewPost).toEqual([
      screen.getByLabelText('Search'),
      newPost(),
    ]);
  });
});

describe('SidebarDesktopV2 rail order', () => {
  it('puts Notifications right under Explore, above Squads', () => {
    renderRail('/');

    const tabs = Array.from(
      screen
        .getByRole('tablist', { name: 'Sidebar categories' })
        .querySelectorAll('[role="tab"]'),
    ).map((tab) => tab.getAttribute('id') ?? tab.getAttribute('aria-label'));

    expect(tabs.slice(0, 3)).toEqual([
      'sidebar-category-main',
      'Notifications',
      'sidebar-category-squads',
    ]);
  });
});

describe('SidebarDesktopV2 Following', () => {
  it('opens the You panel, Following row included, outside the layout v2 fixes experiment', async () => {
    renderRail('/following');

    expect(await screen.findByText('History')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('reads /following as a feed tab in the layout v2 fixes experiment', () => {
    jest.mocked(useLayoutV2Fixes).mockReturnValue(true);
    renderRail('/following');

    expect(selectedTabs()).toHaveLength(0);
    expect(screen.queryByText('History')).not.toBeInTheDocument();
  });

  it('drops Following from the You panel in the layout v2 fixes experiment', async () => {
    jest.mocked(useLayoutV2Fixes).mockReturnValue(true);
    renderRail(`/${defaultUser.username}`);

    expect(await screen.findByText('History')).toBeInTheDocument();
    expect(screen.queryByText('Following')).not.toBeInTheDocument();
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
