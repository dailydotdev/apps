import { ReactElement, useEffect } from 'react';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from './common/types';
import { useAuthContext } from '../../contexts/AuthContext';

const threshold = 250;

export const ReputationPrivilegesModalTrigger = (): ReactElement => {
  const { checkHasCompleted, isActionsFetched } = useActions();
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }

    if (checkHasCompleted(ActionType.AckRep250)) {
      return;
    }

    if (user?.reputation >= threshold) {
      openModal({
        type: LazyModal.ReputationPrivileges,
        persistOnRouteChange: true,
      });
    }
  }, [checkHasCompleted, isActionsFetched, openModal, user?.reputation]);

  return null;
};
