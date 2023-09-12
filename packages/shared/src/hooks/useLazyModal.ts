import { useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { LazyModalType, ModalsType } from '../components/modals/common';

export const MODAL_KEY = 'modal';

type UseLazyModal<K extends keyof ModalsType, T extends LazyModalType<K>> = {
  updateProps: (data: T['props']) => void;
  openModal: (data: T) => void;
  closeModal: () => void;
  modal: T;
};

let scrollPosition = 0;

export function useLazyModal<
  K extends keyof ModalsType,
  T extends LazyModalType<K> = LazyModalType<K>,
>(): UseLazyModal<K, T> {
  const client = useQueryClient();
  const { data: modal } = useQuery<T>(MODAL_KEY, () =>
    client.getQueryData<T>(MODAL_KEY),
  );
  const openModal = useCallback(
    (data: T) => {
      scrollPosition = window.scrollY;

      client.setQueryData(MODAL_KEY, data);
    },
    [client],
  );
  const closeModal = useCallback(() => {
    window.scrollTo(0, scrollPosition);
    scrollPosition = 0;

    client.setQueryData(MODAL_KEY, null);
  }, [client]);

  const updateProps = useCallback(
    (data: T['props']) => {
      client.setQueryData<T>(MODAL_KEY, (current) => {
        if (!current) {
          return null;
        }

        return { ...current, props: { ...current.props, ...data } };
      });
    },
    [client],
  );

  return {
    openModal,
    closeModal,
    updateProps,
    modal,
  };
}
