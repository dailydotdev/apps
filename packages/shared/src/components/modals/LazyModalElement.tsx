import React, { ComponentType, ReactElement } from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyPropTypes, modals } from './common';

interface LazyModalElementProps {
  modalSelection?: Record<string, ComponentType>;
}

export function LazyModalElement({
  modalSelection = modals,
}: LazyModalElementProps): ReactElement {
  const { modal, closeModal } = useLazyModal();
  if (!modal) return null;

  const { type, props } = modal;
  const ActiveModal = modalSelection[type] as React.FC<LazyPropTypes>;
  return <ActiveModal isOpen onRequestClose={closeModal} {...props} />;
}
