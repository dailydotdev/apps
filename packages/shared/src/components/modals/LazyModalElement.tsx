import React, { ReactElement } from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import { modals } from './common';

export function LazyModalElement(): ReactElement {
  const { modal, closeModal } = useLazyModal();
  if (!modal) return null;

  const { type, props } = modal;
  const ActiveModal = modals[type];
  return <ActiveModal isOpen onRequestClose={closeModal} {...props} />;
}
