import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { LayoutVariant } from '@dailydotdev/shared/src/lib/layoutVariant';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { LAYOUT_FRAME_CLASS } from '@dailydotdev/shared/src/lib/layoutVariant';
import * as hooks from '@dailydotdev/shared/src/hooks/useViewSize';
import MainLayout from '../components/layouts/MainLayout';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Reproduces a server render: `isPageReady` is forced true under jest.
jest.mock('@dailydotdev/shared/src/lib/constants', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/lib/constants'),
  isTesting: false,
}));

describe('MainLayout with a server-resolved shell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);
    jest.mocked(useRouter).mockImplementation(
      () =>
        ({
          route: '/layout-v2/posts/[id]',
          pathname: '/layout-v2/posts/[id]',
          asPath: '/posts/abc123',
          query: {},
          isReady: false,
          push: jest.fn(),
          replace: jest.fn(),
          events: { on: jest.fn(), off: jest.fn() },
        } as unknown as NextRouter),
    );
  });

  const renderLayout = (layoutVariant?: LayoutVariant): RenderResult =>
    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isAuthReady: false, isLoggedIn: false, user: undefined }}
      >
        <MainLayout layoutVariant={layoutVariant}>
          <p>prerendered page content</p>
        </MainLayout>
      </TestBootProvider>,
    );

  it('hands the header to the rail before boot resolves', () => {
    const { container } = renderLayout('v2');

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(
      // eslint-disable-next-line testing-library/no-container
      container.querySelector(`.${LAYOUT_FRAME_CLASS}`),
    ).toBeInTheDocument();
    expect(screen.getByText('prerendered page content')).toBeInTheDocument();
  });

  it('keeps rendering the header without a resolved shell', () => {
    renderLayout();

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('hands the header to the rail for a signed-in laptop cookie before boot', () => {
    document.cookie = 'dl_v=v2';

    renderLayout();

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    document.cookie = 'dl_v=; max-age=0';
  });

  it('keeps the page mounted when the shell settles on the rail', () => {
    const onMount = jest.fn();
    const Page = () => {
      React.useEffect(() => onMount(), []);
      return <p>page</p>;
    };
    const client = new QueryClient();
    const layout = (isAuthReady: boolean) => (
      <TestBootProvider
        client={client}
        auth={{
          isAuthReady,
          isLoggedIn: isAuthReady,
          user: isAuthReady ? ({ id: 'u1' } as LoggedUser) : undefined,
        }}
      >
        <MainLayout>
          <Page />
        </MainLayout>
      </TestBootProvider>
    );

    const { rerender } = render(layout(false));
    expect(screen.getByRole('banner')).toBeInTheDocument();

    rerender(layout(true));

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(onMount).toHaveBeenCalledTimes(1);
  });

  // Below laptop the header gives way to SidebarTablet, so the shell shows
  // through the floating card rather than the banner.
  it('drops the painted shell once the viewport turns out narrower', () => {
    jest.spyOn(hooks, 'useViewSize').mockImplementation(() => false);

    const { container } = renderLayout('v2');

    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector(`.${LAYOUT_FRAME_CLASS}`)).toBeNull();
  });
});
