import { useContext, useEffect } from 'react';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import AlertContext from '../../contexts/AlertContext';

export const useReferralReminder = (): void => {
  const { alerts, updateLastReferralReminder } = useContext(AlertContext);
  const { openModal } = useLazyModal();

  useEffect(() => {
    if (alerts?.showGenericReferral !== true) {
      return;
    }

    openModal({
      type: LazyModal.GenericReferral,
      persistOnRouteChange: true,
    });
    updateLastReferralReminder();
  }, [alerts?.showGenericReferral, openModal, updateLastReferralReminder]);
};
