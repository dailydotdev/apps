import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { trackSharedPostClick } from '../graphql/quests';
import { getFirstQueryParam } from '../lib/func';
import { ReferralCampaignKey } from '../lib/referral';

const SHARE_LINK_CLICK_CAMPAIGNS = new Set<string>([
  ReferralCampaignKey.SharePost,
  ReferralCampaignKey.ShareSlack,
]);

export const isShareLinkClickCampaign = (
  campaign?: string | null,
): campaign is ReferralCampaignKey =>
  !!campaign && SHARE_LINK_CLICK_CAMPAIGNS.has(campaign);

interface UseShareLinkClickProps {
  postId?: string | null;
  enabled?: boolean;
}

export const getShareLinkClickKey = ({
  referringUserId,
  postId,
  campaign,
}: {
  referringUserId: string;
  postId: string;
  campaign: string;
}): string => `${referringUserId}:${postId}:${campaign}`;

export const shouldTrackShareLinkClick = ({
  campaign,
  referringUserId,
  postId,
  userId,
}: {
  campaign?: string | null;
  referringUserId?: string | null;
  postId?: string | null;
  userId?: string | null;
}): boolean =>
  isShareLinkClickCampaign(campaign) &&
  !!referringUserId &&
  !!postId &&
  referringUserId !== userId;

export const useShareLinkClick = ({
  postId,
  enabled = true,
}: UseShareLinkClickProps): void => {
  const { user, isAuthReady } = useAuthContext();
  const router = useRouter();
  const trackedKeysRef = useRef(new Set<string>());
  const campaign = getFirstQueryParam(router.query.cid);
  const referringUserId = getFirstQueryParam(router.query.userid);

  useEffect(() => {
    if (
      !enabled ||
      !isAuthReady ||
      !isShareLinkClickCampaign(campaign) ||
      !referringUserId ||
      !postId ||
      referringUserId === user?.id
    ) {
      return;
    }

    const clickKey = getShareLinkClickKey({
      referringUserId,
      postId,
      campaign,
    });

    if (trackedKeysRef.current.has(clickKey)) {
      return;
    }

    trackedKeysRef.current.add(clickKey);

    trackSharedPostClick({
      referringUserId,
      postId,
      campaign,
    }).catch(() => undefined);
  }, [campaign, enabled, isAuthReady, postId, referringUserId, user?.id]);
};
