import { useEffect, useState } from 'react';
import { ContentPreferenceStatus } from '../graphql/contentPreference';
import type { ContentPreferenceType } from '../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from './contentPreference/useContentPreferenceStatusQuery';

type UseShowFollowActionProps = {
  entityId: string;
  entityType: ContentPreferenceType;
};

type UseShowFollowAction = {
  showActionBtn: boolean;
  /**
   * For cases where you need to handle loading state separately, like for example wether to hide another element while this check is loading.
   */
  isLoading: boolean;
};
const useShowFollowAction = ({
  entityId,
  entityType,
}: UseShowFollowActionProps): UseShowFollowAction => {
  const [showActionBtn, setShowActionBtn] = useState(false);
  const { data, isSuccess, isLoading } = useContentPreferenceStatusQuery({
    id: entityId,
    entity: entityType,
  });

  useEffect(() => {
    if (isSuccess && !showActionBtn) {
      setShowActionBtn(
        ![
          ContentPreferenceStatus.Follow,
          ContentPreferenceStatus.Subscribed,
        ].includes(data?.status),
      );
    }
  }, [isSuccess, data?.status, showActionBtn]);

  return { showActionBtn, isLoading };
};

export default useShowFollowAction;
