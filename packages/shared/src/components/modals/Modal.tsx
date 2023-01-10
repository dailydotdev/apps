import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { useModal } from '../../hooks/useModal';
import { LazyModals } from './common/types';

const SquadsBetaModal = dynamic(
  () => import(/* webpackChunkName: "squadsBetaModal" */ './SquadsBetaModal'),
);
const NewSquadModal = dynamic(
  () => import(/* webpackChunkName: "newSquadModal" */ './NewSquadModal'),
);

const modals: Record<LazyModals, React.ComponentType<any>> = {
  [LazyModals.NewSquad]: NewSquadModal,
  [LazyModals.SquadsBeta]: SquadsBetaModal,
};

// LazyModalElement
export function Modal(): ReactElement {
  const { modal, closeModal } = useModal();
  if (!modal) return null;

  const { type, ...props } = modal;
  const ActiveModal = modals[type];
  return <ActiveModal isOpen onRequestClose={closeModal} {...props} />;
}
