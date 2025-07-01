import { useEffect, useState } from 'react';
import { ContentPreferenceStatus } from '../graphql/contentPreference';
import type { ContentPreferenceType } from '../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from './contentPreference/useContentPreferenceStatusQuery';

type UseShowFollowActionProps = {
  initialStatus?: ContentPreferenceStatus;
  entityId: string;
  entityType: ContentPreferenceType;
};

const useShowFollowAction = ({
  entityId,
  entityType,
}: UseShowFollowActionProps) => {
  const [showActionBtn, setShowActionBtn] = useState(false);
  const { data, status } = useContentPreferenceStatusQuery({
    id: entityId,
    entity: entityType,
  });

  useEffect(() => {
    if (status === 'success' && !showActionBtn) {
      setShowActionBtn(
        ![
          ContentPreferenceStatus.Follow,
          ContentPreferenceStatus.Subscribed,
        ].includes(data?.status),
      );
    }
  }, [status, data?.status, showActionBtn]);

  return showActionBtn;
};

export default useShowFollowAction;
