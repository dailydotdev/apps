import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { LazyModalType, ModalsType } from '../components/modals/common';

export const MODAL_KEY = 'modal';

type UseLazyModal<K extends keyof ModalsType, T extends LazyModalType<K>> = {
  openModal: (data: T) => void;
  closeModal: () => void;
  modal: T;
};

export function useLazyModal<
  K extends keyof ModalsType,
  T extends LazyModalType<K> = LazyModalType<K>,
>(): UseLazyModal<K, T> {
  const client = useQueryClient();
  const { data: modal } = useQuery<T>(MODAL_KEY);
  const openModal = (data: T) => client.setQueryData(MODAL_KEY, data);
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
