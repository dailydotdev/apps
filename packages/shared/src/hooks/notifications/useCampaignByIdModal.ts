import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLazyModal } from '../useLazyModal';
import { useAuthContext } from '../../contexts/AuthContext';
import { LazyModal } from '../../components/modals/common/types';

export const useCampaignByIdModal = (): void => {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const {
    query: { post_boost: postBoost, c_id: campaignId },
    replace,
    pathname,
  } = useRouter();

  useEffect(() => {
    if (!user || !postBoost || !campaignId) {
      return;
    }
    openModal({
      type: LazyModal.FetchBoostedPostView,
      props: {
        campaignId: campaignId as string,
        onAfterClose: () => replace(pathname),
      },
    });
  }, [openModal, pathname, replace, postBoost, user, campaignId]);
};
