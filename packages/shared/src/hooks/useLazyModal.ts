import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { LazyModalType } from '../components/modals/common';

export const MODAL_KEY = 'modal';

type UseLazyModal = {
  openModal: (data: LazyModalType) => void;
  closeModal: () => void;
  modal: LazyModalType;
};

export function useLazyModal(): UseLazyModal {
  const client = useQueryClient();
  const { data: modal } = useQuery<LazyModalType>(MODAL_KEY);
  const openModal = (data: LazyModalType) =>
    client.setQueryData(MODAL_KEY, data);
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
