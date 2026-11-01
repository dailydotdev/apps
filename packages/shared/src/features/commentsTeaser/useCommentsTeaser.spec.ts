import { renderHook } from '@testing-library/react';
import { useCommentsTeaser } from './useCommentsTeaser';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useViewSize } from '../../hooks/useViewSize';
import { usePhoneBrowser } from '../getApp/hooks/usePhoneBrowser';
import {
  featurePostCommentsTeaserDesktop,
  featurePostCommentsTeaserMobile,
} from '../../lib/featureManagement';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));
jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));
jest.mock('../getApp/hooks/usePhoneBrowser', () => ({
  usePhoneBrowser: jest.fn(),
}));

const mockAuth = jest.mocked(useAuthContext);
const mockFeature = jest.mocked(useConditionalFeature);
const mockTabletUp = jest.mocked(useViewSize);
const mockPhoneBrowser = jest.mocked(usePhoneBrowser);

const setReader = ({
  loggedIn = false,
  tabletUp = false,
  phoneBrowser = false,
}: {
  loggedIn?: boolean;
  tabletUp?: boolean;
  phoneBrowser?: boolean;
}) => {
  mockAuth.mockReturnValue({
    isAuthReady: true,
    isLoggedIn: loggedIn,
  } as ReturnType<typeof useAuthContext>);
  mockTabletUp.mockReturnValue(tabletUp);
  mockPhoneBrowser.mockReturnValue(phoneBrowser);
};

// Which flags were asked to evaluate, by id.
const evaluatedFlags = (): string[] =>
  mockFeature.mock.calls
    .filter(([{ shouldEvaluate }]) => shouldEvaluate)
    .map(([{ feature }]) => feature.id);

describe('useCommentsTeaser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFeature.mockReturnValue({ value: true, isLoading: false });
  });

  it('should read only the desktop flag on tablet and laptop', () => {
    setReader({ tabletUp: true });
    const { result } = renderHook(() => useCommentsTeaser());

    expect(evaluatedFlags()).toEqual([featurePostCommentsTeaserDesktop.id]);
    expect(result.current).toEqual({
      isCommentsTeaser: true,
      isPending: false,
      platform: 'desktop',
    });
  });

  it('should read only the mobile flag in a phone browser', () => {
    setReader({ phoneBrowser: true });
    const { result } = renderHook(() => useCommentsTeaser());

    expect(evaluatedFlags()).toEqual([featurePostCommentsTeaserMobile.id]);
    expect(result.current.platform).toEqual('mobile');
    expect(result.current.isCommentsTeaser).toBe(true);
  });

  it('should read neither flag in a phone-sized app or PWA shell', () => {
    setReader({ phoneBrowser: false });
    const { result } = renderHook(() => useCommentsTeaser());

    expect(evaluatedFlags()).toEqual([]);
    expect(result.current.isCommentsTeaser).toBe(false);
  });

  it('should never enroll members', () => {
    setReader({ loggedIn: true, tabletUp: true });
    const { result } = renderHook(() => useCommentsTeaser());

    expect(evaluatedFlags()).toEqual([]);
    expect(result.current.isCommentsTeaser).toBe(false);
  });

  it('should read neither flag off the post page', () => {
    setReader({ tabletUp: true });
    renderHook(() => useCommentsTeaser(false));

    expect(evaluatedFlags()).toEqual([]);
  });

  it('should be pending while the device flag loads', () => {
    setReader({ phoneBrowser: true });
    mockFeature.mockReturnValue({ value: false, isLoading: true });
    const { result } = renderHook(() => useCommentsTeaser());

    expect(result.current).toEqual({
      isCommentsTeaser: false,
      isPending: true,
      platform: 'mobile',
    });
  });

  it('should stay off when the device flag is off', () => {
    setReader({ tabletUp: true });
    mockFeature.mockReturnValue({ value: false, isLoading: false });
    const { result } = renderHook(() => useCommentsTeaser());

    expect(result.current.isCommentsTeaser).toBe(false);
  });
});
