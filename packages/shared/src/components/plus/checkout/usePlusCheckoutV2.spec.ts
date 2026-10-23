import { renderHook } from '@testing-library/react';
import { usePlusCheckoutV2 } from './usePlusCheckoutV2';

let mockRouter: {
  pathname: string;
  query: Record<string, string>;
  isReady: boolean;
};
let mockUser: { isPlus?: boolean } | null;
let mockIsIOS = false;
const mockUseConditionalFeature = jest.fn();

jest.mock('next/router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ isAuthReady: true, user: mockUser }),
}));
jest.mock('../../../lib/func', () => ({
  isIOSNative: () => mockIsIOS,
}));
jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: (props: { shouldEvaluate: boolean }) =>
    mockUseConditionalFeature(props),
}));

const render = () => renderHook(() => usePlusCheckoutV2()).result.current;

beforeEach(() => {
  mockRouter = { pathname: '/plus', query: {}, isReady: true };
  mockUser = { isPlus: false };
  mockIsIOS = false;
  window.sessionStorage.clear();
  mockUseConditionalFeature.mockReset();
  mockUseConditionalFeature.mockImplementation(({ shouldEvaluate }) => ({
    value: shouldEvaluate,
    isLoading: false,
  }));
});

describe('usePlusCheckoutV2', () => {
  it('follows the flag for a member who is not on Plus', () => {
    expect(render()).toEqual({ isV2: true, isLoading: false });
  });

  it('keeps Plus members buying for themselves on today’s page', () => {
    mockUser = { isPlus: true };
    expect(render().isV2).toBe(false);
  });

  it('keeps a Plus member buying for a team or a gift in the test', () => {
    mockUser = { isPlus: true };
    mockRouter.query = { type: 'team' };
    expect(render().isV2).toBe(true);
    mockRouter.query = { gift: 'someone' };
    expect(render().isV2).toBe(true);
  });

  it('shows the new thank-you page to a buyer who is now on Plus', () => {
    mockUser = { isPlus: true };
    mockRouter.pathname = '/plus/success';
    expect(render().isV2).toBe(true);
  });

  it('never runs in the iOS app', () => {
    mockIsIOS = true;
    expect(render()).toEqual({ isV2: false, isLoading: false });
  });

  it('waits for the router before deciding', () => {
    mockRouter.isReady = false;
    expect(render()).toEqual({ isV2: false, isLoading: true });
  });

  it('lets ?checkout= pick the version on local dev, for the tab', () => {
    // jsdom runs on localhost, one of the preview hosts.
    mockRouter.query = { checkout: 'v1' };
    expect(render().isV2).toBe(false);
    mockRouter.query = {};
    expect(render().isV2).toBe(false);
    expect(mockUseConditionalFeature).toHaveBeenLastCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });
});
