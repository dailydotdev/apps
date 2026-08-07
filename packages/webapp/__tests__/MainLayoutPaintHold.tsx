import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import * as hooks from '@dailydotdev/shared/src/hooks/useViewSize';
import * as layoutVariant from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import MainLayout from '../components/layouts/MainLayout';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// `isPageReady` is forced true under jest, which is exactly the condition that
// never holds on the server. Unmocking it is what makes this file reproduce a
// server render at all.
jest.mock('@dailydotdev/shared/src/lib/constants', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/lib/constants'),
  isTesting: false,
}));

const mockRouter = (route: string) => {
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        route,
        pathname: route,
        asPath: route,
        query: {},
        isReady: false,
        push: jest.fn(),
        replace: jest.fn(),
        events: { on: jest.fn(), off: jest.fn() },
      } as unknown as NextRouter),
  );
};

describe('MainLayout before boot resolves', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);
    jest
      .spyOn(layoutVariant, 'useLayoutVariant')
      .mockReturnValue({ isV2: false, isLoading: true });
  });

  const renderLayout = (): RenderResult =>
    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isAuthReady: false, isLoggedIn: false, user: undefined }}
      >
        <MainLayout>
          <p>prerendered page content</p>
        </MainLayout>
      </TestBootProvider>,
    );

  it('keeps prerendered content in the markup so crawlers can read it', () => {
    mockRouter('/posts/[id]');
    renderLayout();

    expect(screen.getByText('prerendered page content')).toBeInTheDocument();
  });

  it('paints prerendered content before boot resolves', () => {
    mockRouter('/posts/[id]');
    renderLayout();

    const content = screen.getByText('prerendered page content');
    expect(content.closest('div.antialiased')).not.toHaveClass('invisible');
  });

  it('renders the header before the layout experiment resolves', () => {
    mockRouter('/posts/[id]');
    renderLayout();

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('still renders nothing for feed-shaped pages', () => {
    mockRouter('/popular');
    renderLayout();

    expect(
      screen.queryByText('prerendered page content'),
    ).not.toBeInTheDocument();
  });
});
