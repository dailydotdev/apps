import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { LazyModals } from '../components/modals/common/types';

export const MODAL_KEY = 'modal';

interface ModalType<T> {
  type: LazyModals;
  props?: T;
}
type UseModal = {
  openModal: (data: ModalType) => void;
  closeModal: () => void;
  modal: ModalType;
};

// useLazyModal
export function useModal(): UseModal {
  const client = useQueryClient();
  const { data: modal } = useQuery<ModalType>(MODAL_KEY);
  const openModal = (data: ModalType) => client.setQueryData(MODAL_KEY, data);
  const closeModal = () => client.setQueryData(MODAL_KEY, null);

  return useMemo(
    () => ({
      openModal,
      closeModal,
      modal,
    }),
    [modal],
  );
}
