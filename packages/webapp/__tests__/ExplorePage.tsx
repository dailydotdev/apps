import nock from 'nock';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import {
  useViewSize,
  useViewSizeClient,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { checkIsExtension } from '@dailydotdev/shared/src/lib/func';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import Posts from '../pages/posts/index';

jest.setTimeout(30000);

jest.mock('@dailydotdev/shared/src/hooks/useConditionalFeature', () => ({
  __esModule: true,
  useConditionalFeature: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/lib/func', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/lib/func'),
  checkIsExtension: jest.fn(() => false),
}));

jest.mock('@dailydotdev/shared/src/hooks/useViewSize', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks/useViewSize'),
  useViewSize: jest.fn(),
  useViewSizeClient: jest.fn(),
  useIsPhone: jest.fn(() => true),
}));

const mockFeature = jest.mocked(useConditionalFeature);

const sponsorStripEvaluations = () =>
  mockFeature.mock.calls
    .filter(([args]) => args.feature.id === 'sponsor_strip')
    .map(([args]) => args.shouldEvaluate);

beforeAll(async () => {
  await import('@dailydotdev/shared/src/components/MainFeedLayout');
});

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  jest.mocked(checkIsExtension).mockReturnValue(false);
  jest.mocked(useViewSize).mockReturnValue(true);
  jest.mocked(useViewSizeClient).mockReturnValue(true);
  mockFeature.mockImplementation(({ feature }) => ({
    value: feature.defaultValue,
    isLoading: false,
  }));
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/posts',
        query: {},
        replace: jest.fn(),
        push: jest.fn(),
        isReady: true,
      } as unknown as NextRouter),
  );
});

const tree = (auth: Partial<AuthContextData>) => (
  <TestBootProvider
    client={new QueryClient()}
    auth={{ user: undefined, isLoggedIn: false, ...auth }}
  >
    {Posts.getLayout(<Posts />, {}, Posts.layoutProps)}
  </TestBootProvider>
);

const bannerHeadline = 'Where developers suffer together';

it('should give an anonymous laptop visitor the signup banner and never the sponsor dock', async () => {
  const { rerender } = render(tree({ isAuthReady: false }));

  expect(screen.queryByText(bannerHeadline)).not.toBeInTheDocument();
  expect(sponsorStripEvaluations()).not.toContain(true);

  rerender(tree({ isAuthReady: true }));

  expect(await screen.findByText(bannerHeadline)).toBeInTheDocument();
  expect(screen.queryByTestId('sponsorStrip')).not.toBeInTheDocument();
  expect(sponsorStripEvaluations()).not.toContain(true);
});

it('should leave the extension new tab alone', async () => {
  jest.mocked(checkIsExtension).mockReturnValue(true);
  render(tree({ isAuthReady: true }));

  expect(screen.queryByText(bannerHeadline)).not.toBeInTheDocument();
  expect(sponsorStripEvaluations()).toContain(true);
});

it('should release the dock to a member known from the boot cache before boot', async () => {
  render(
    tree({
      isAuthReady: false,
      isAuthReadyOrCached: true,
      isLoggedIn: true,
      user: defaultUser,
    }),
  );

  expect(screen.queryByText(bannerHeadline)).not.toBeInTheDocument();
  expect(sponsorStripEvaluations()).toContain(true);
});

it('should leave the sponsor dock to members', async () => {
  render(tree({ isAuthReady: true, isLoggedIn: true, user: defaultUser }));

  expect(screen.queryByText(bannerHeadline)).not.toBeInTheDocument();
  expect(sponsorStripEvaluations()).toContain(true);
});
