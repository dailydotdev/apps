import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { LazyModals } from '../components/modals/common/types';

export const MODAL_KEY = 'modal';

type UseModal = {
  openModal: (data: LazyModals) => void;
  closeModal: () => void;
  modal: LazyModals;
};

export function useModal(): UseModal {
  const client = useQueryClient();
  const { data: modal } = useQuery<LazyModals>(MODAL_KEY);
  const openModal = (data: LazyModals) => client.setQueryData(MODAL_KEY, data);
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
