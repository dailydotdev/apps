import { useContext, useEffect } from 'react';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import AlertContext from '../../contexts/AlertContext';
import useDebounce from '../useDebounce';

export const useReferralReminder = (): void => {
  const { alerts, updateLastReferralReminder } = useContext(AlertContext);
  const { openModal } = useLazyModal();
  // We need a small debounce to avoid it not being opened due to fast re-renders
  const [openModalDebounce] = useDebounce(
    () =>
      openModal({
        type: LazyModal.GenericReferral,
      }),
    10,
  );

  useEffect(() => {
    if (alerts?.showGenericReferral !== true) {
      return;
    }

    updateLastReferralReminder();
    openModalDebounce();
  }, [
    alerts?.showGenericReferral,
    openModalDebounce,
    updateLastReferralReminder,
  ]);
};
