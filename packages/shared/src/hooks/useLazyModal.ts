import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { LazyModal } from '../components/modals/common/types';
import { PropTypes } from '../components/modals/common';

export const MODAL_KEY = 'modal';

interface ModalType {
  type: LazyModal;
  props?: PropTypes;
}
type UseLazyModal = {
  openModal: (data: ModalType) => void;
  closeModal: () => void;
  modal: ModalType;
};

export function useLazyModal(): UseLazyModal {
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
