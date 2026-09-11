import { renderHook, waitFor } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { trackSharedPostClick } from '../graphql/quests';
import { ReferralCampaignKey } from '../lib/referral';
import {
  getShareLinkClickKey,
  isShareLinkClickCampaign,
  shouldTrackShareLinkClick,
  useShareLinkClick,
} from './useShareLinkClick';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../graphql/quests', () => ({
  ...jest.requireActual('../graphql/quests'),
  trackSharedPostClick: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockTrackSharedPostClick = trackSharedPostClick as jest.MockedFunction<
  typeof trackSharedPostClick
>;

const postId = 'post-1';
const referringUserId = 'sharer-1';

const setRouterQuery = (query: NextRouter['query']) => {
  mockUseRouter.mockReturnValue({
    query,
  } as unknown as NextRouter);
};

const setViewer = ({
  userId,
  isAuthReady = true,
}: {
  userId?: string | null;
  isAuthReady?: boolean;
} = {}) => {
  mockUseAuthContext.mockReturnValue({
    user: userId ? { id: userId } : null,
    isAuthReady,
  } as unknown as ReturnType<typeof useAuthContext>);
};

describe('share link click helpers', () => {
  it('should identify click campaigns and build stable keys', () => {
    expect(isShareLinkClickCampaign(ReferralCampaignKey.SharePost)).toBe(true);
    expect(isShareLinkClickCampaign(ReferralCampaignKey.ShareSlack)).toBe(true);
    expect(isShareLinkClickCampaign(ReferralCampaignKey.ShareComment)).toBe(
      false,
    );
    expect(
      getShareLinkClickKey({
        referringUserId,
        postId,
        campaign: ReferralCampaignKey.SharePost,
      }),
    ).toBe(`${referringUserId}:${postId}:${ReferralCampaignKey.SharePost}`);
  });

  it('should reject incomplete and self-click attribution', () => {
    expect(
      shouldTrackShareLinkClick({
        campaign: ReferralCampaignKey.SharePost,
        referringUserId,
        postId,
        userId: 'visitor-1',
      }),
    ).toBe(true);
    expect(
      shouldTrackShareLinkClick({
        campaign: ReferralCampaignKey.SharePost,
        referringUserId,
        postId,
        userId: referringUserId,
      }),
    ).toBe(false);
    expect(
      shouldTrackShareLinkClick({
        campaign: ReferralCampaignKey.ShareProfile,
        referringUserId,
        postId,
      }),
    ).toBe(false);
    expect(
      shouldTrackShareLinkClick({
        campaign: ReferralCampaignKey.SharePost,
        postId,
      }),
    ).toBe(false);
  });
});

describe('useShareLinkClick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setViewer();
    setRouterQuery({
      cid: ReferralCampaignKey.SharePost,
      userid: referringUserId,
    });
    mockTrackSharedPostClick.mockResolvedValue(undefined);
  });

  it('should track an eligible anonymous post share click once', async () => {
    const { rerender } = renderHook(
      (props: { postId?: string }) => useShareLinkClick(props),
      {
        initialProps: { postId },
      },
    );

    await waitFor(() => {
      expect(mockTrackSharedPostClick).toHaveBeenCalledTimes(1);
    });

    expect(mockTrackSharedPostClick).toHaveBeenCalledWith({
      referringUserId,
      postId,
      campaign: ReferralCampaignKey.SharePost,
    });

    rerender({ postId });

    expect(mockTrackSharedPostClick).toHaveBeenCalledTimes(1);
  });

  it('should use the first query param value and ignore unrelated route changes', async () => {
    const { rerender } = renderHook(
      (props: { postId?: string }) => useShareLinkClick(props),
      {
        initialProps: { postId },
      },
    );

    await waitFor(() => {
      expect(mockTrackSharedPostClick).toHaveBeenCalledTimes(1);
    });

    setRouterQuery({
      cid: [ReferralCampaignKey.SharePost, ReferralCampaignKey.ShareProfile],
      userid: [referringUserId, 'other-sharer'],
      unrelated: '1',
    });
    rerender({ postId });

    expect(mockTrackSharedPostClick).toHaveBeenCalledTimes(1);
  });

  it('should skip self-clicks', () => {
    setViewer({ userId: referringUserId });

    renderHook(() => useShareLinkClick({ postId }));

    expect(mockTrackSharedPostClick).not.toHaveBeenCalled();
  });

  it('should skip when attribution is incomplete or auth is not ready', () => {
    setRouterQuery({ userid: referringUserId });
    renderHook(() => useShareLinkClick({ postId }));

    setRouterQuery({
      cid: ReferralCampaignKey.SharePost,
      userid: referringUserId,
    });
    renderHook(() => useShareLinkClick({}));

    setViewer({ isAuthReady: false });
    renderHook(() => useShareLinkClick({ postId }));

    expect(mockTrackSharedPostClick).not.toHaveBeenCalled();
  });

  it('should not retry after a failed tracking request on rerender', async () => {
    mockTrackSharedPostClick.mockRejectedValue(new Error('network error'));

    const { rerender } = renderHook(
      (props: { postId?: string }) => useShareLinkClick(props),
      {
        initialProps: { postId },
      },
    );

    await waitFor(() => {
      expect(mockTrackSharedPostClick).toHaveBeenCalledTimes(1);
    });

    rerender({ postId });

    expect(mockTrackSharedPostClick).toHaveBeenCalledTimes(1);
  });
});
