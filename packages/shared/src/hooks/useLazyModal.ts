import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { LazyModalType, ModalsType } from '../components/modals/common';
import { LazyModal } from '../components/modals/common/types';

export const MODAL_KEY = ['modal'];
export const FEEDBACK_MODAL_KEY = ['feedbackModal'];

type UseLazyModal<K extends keyof ModalsType, T extends LazyModalType<K>> = {
  openModal: (data: T) => void;
  closeModal: () => void;
  modal: T;
};

let scrollPosition = 0;
let feedbackScrollPosition = 0;

export function useLazyModal<
  K extends keyof ModalsType,
  T extends LazyModalType<K> = LazyModalType<K>,
>(): UseLazyModal<K, T> {
  const client = useQueryClient();
  const { data: modal } = useQuery({
    queryKey: MODAL_KEY,
    queryFn: () => client.getQueryData<T>(MODAL_KEY),
    enabled: false,
  });
  const openModal = useCallback(
    (data: T) => {
      if (data.type === LazyModal.Feedback) {
        feedbackScrollPosition = window.scrollY;
        client.setQueryData(FEEDBACK_MODAL_KEY, data);
        return;
      }

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

  return useMemo(
    () => ({
      openModal,
      closeModal,
      modal: modal as T,
    }),
    [openModal, closeModal, modal],
  );
}

type UseFeedbackModal = {
  closeModal: () => void;
  modal: LazyModalType<LazyModal.Feedback> | null | undefined;
};

export function useFeedbackModal(): UseFeedbackModal {
  const client = useQueryClient();
  const { data: modal } = useQuery({
    queryKey: FEEDBACK_MODAL_KEY,
    queryFn: () =>
      client.getQueryData<LazyModalType<LazyModal.Feedback>>(
        FEEDBACK_MODAL_KEY,
      ),
    enabled: false,
  });
  const closeModal = useCallback(() => {
    window.scrollTo(0, feedbackScrollPosition);
    feedbackScrollPosition = 0;

    client.setQueryData(FEEDBACK_MODAL_KEY, null);
  }, [client]);

  return useMemo(() => ({ closeModal, modal }), [closeModal, modal]);
}
