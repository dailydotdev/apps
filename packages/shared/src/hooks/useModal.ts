import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { LazyModals } from '../components/modals/common/types';
import { NewSquadModalProps } from '../components/modals/NewSquadModal';
import { SquadsBetaModalProps } from '../components/modals/SquadsBetaModal';

export const MODAL_KEY = 'modal';

interface ModalType<T> {
  type: LazyModals;
  props?: T;
}
type UseModal = {
  openModal: <T>(data: ModalType<Partial<T>>) => void;
  closeModal: () => void;
  modal: ModalType;
};

type OpenModalType = {
  type: LazyModals.NewSquad;
  props: NewSquadModalProps;
} | {
  type: LazyModals.SquadsBeta;
  props: SquadsBetaModalProps;
}

// useLazyModal
export function useModal(): UseModal {
  const client = useQueryClient();
  const { data: modal } = useQuery<ModalType>(MODAL_KEY);
  const openModal = (data: OpenModalType) => client.setQueryData(MODAL_KEY, data);
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
