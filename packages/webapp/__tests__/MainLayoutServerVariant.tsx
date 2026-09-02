import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { LayoutVariant } from '@dailydotdev/shared/src/lib/layoutVariant';
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
    renderLayout('v2');

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.getByText('prerendered page content')).toBeInTheDocument();
  });

  it('keeps rendering the header without a resolved shell', () => {
    renderLayout();

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
