import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { ActiveFeedNameContext } from '../../contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '../../components/utilities/common';
import { useFeedExplainMode } from './useFeedExplainMode';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest
    .mocked(useRouter)
    .mockImplementation(
      () => ({ pathname: '/', query: {} } as unknown as NextRouter),
    );
});

const renderMode = ({
  version,
  isFlagOn,
  feedName = SharedFeedPage.MyFeed,
  isRecommended = true,
}: {
  version: number;
  isFlagOn: boolean;
  feedName?: SharedFeedPage;
  isRecommended?: boolean;
}) => {
  const gb = new GrowthBook({
    features: {
      feed_version: { defaultValue: version },
      feed_explain: { defaultValue: isFlagOn },
    },
  });
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <TestBootProvider client={client} auth={{ user: defaultUser }} gb={gb}>
      <ActiveFeedNameContext.Provider value={{ feedName }}>
        {children}
      </ActiveFeedNameContext.Provider>
    </TestBootProvider>
  );

  return renderHook(() => useFeedExplainMode({ isRecommended }), { wrapper });
};

describe('useFeedExplainMode', () => {
  it.each([116, 118])(
    'should turn on for the challenger version %i with the flag on',
    async (version) => {
      const { result } = renderMode({ version, isFlagOn: true });

      expect(result.current.isAvailable).toBe(true);
      expect(result.current.isExplaining).toBe(false);
      act(() => result.current.setIsExplaining(true));
      await waitFor(() => expect(result.current.isExplaining).toBe(true));
      expect(result.current.version).toBe(version);
    },
  );

  it.each([
    ['another feed version', { version: 15, isFlagOn: true }],
    ['the flag off', { version: 116, isFlagOn: false }],
    [
      'the By date sort',
      { version: 116, isFlagOn: true, isRecommended: false },
    ],
    [
      'another feed',
      { version: 116, isFlagOn: true, feedName: SharedFeedPage.Popular },
    ],
  ])('should stay off with %s', (_, props) => {
    const { result } = renderMode(props);

    act(() => result.current.setIsExplaining(true));
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isExplaining).toBe(false);
  });

  it('should keep offering it on the By date sort, for the phone sheet', () => {
    const { result } = renderMode({
      version: 116,
      isFlagOn: true,
      isRecommended: false,
    });

    expect(result.current.isOffered).toBe(true);
    expect(result.current.isAvailable).toBe(false);
  });
});
