import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { useLazyModal } from '../useLazyModal';
import { useAuthContext } from '../../contexts/AuthContext';
import { LazyModal } from '../../components/modals/common/types';
import {
  CampaignState,
  CampaignType,
  useCampaignByIdOptions,
} from '../../graphql/campaigns';
import { getBoostManagerUrl } from '../../lib/constants';
import { Origin } from '../../lib/log';
import { lastBoostOf } from '../../features/boost/common';

/** A boost notification's link: a live boost opens Boost manager, an ended
 * one the boost form again, with its last budget */
export const useCampaignByIdModal = (): void => {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const client = useQueryClient();
  const {
    query: { c_id: campaignId },
    replace,
    push,
    pathname,
  } = useRouter();
  const campaignOptions = useCampaignByIdOptions(campaignId as string);

  useEffect(() => {
    if (!user || !campaignId) {
      return;
    }

    const openCampaign = async () => {
      // _app closes the open modal on every route change
      await replace(pathname);
      const campaign = await client
        .fetchQuery(campaignOptions)
        .catch(() => null);

      if (!campaign || campaign.user.id !== user.id) {
        return;
      }

      if (campaign.state === CampaignState.Active) {
        push(getBoostManagerUrl(campaign.id));
        return;
      }

      if (campaign.type === CampaignType.Post && campaign.post) {
        openModal({
          type: LazyModal.BoostPost,
          props: {
            post: campaign.post,
            origin: Origin.BoostAgain,
            lastBoost: lastBoostOf(campaign),
          },
        });
        return;
      }

      if (campaign.type === CampaignType.Squad && campaign.source) {
        openModal({
          type: LazyModal.BoostSquad,
          props: { squad: campaign.source, origin: Origin.BoostAgain },
        });
      }
    };

    openCampaign();
    // campaignOptions is rebuilt on every render; the id is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal, pathname, replace, push, user, campaignId, client]);
};
