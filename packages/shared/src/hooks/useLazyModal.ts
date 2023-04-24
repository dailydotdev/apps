import { useCallback, useMemo } from 'react';
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
  const { data: modal } = useQuery<T>(MODAL_KEY, () =>
    client.getQueryData<T>(MODAL_KEY),
  );
  const openModal = useCallback(
    (data: T) => client.setQueryData(MODAL_KEY, data),
    [client],
  );
  const closeModal = useCallback(
    () => client.setQueryData(MODAL_KEY, null),
    [client],
  );

  return useMemo(
    () => ({
      openModal,
      closeModal,
      modal,
    }),
    [openModal, closeModal, modal],
  );
}
