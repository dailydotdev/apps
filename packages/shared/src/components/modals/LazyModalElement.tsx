import type { ReactElement } from 'react';
import React from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import type { LazyPropTypes } from './common';
import { modals } from './common';

export function LazyModalElement(): ReactElement {
  const { modal, closeModal } = useLazyModal();
  if (!modal) {
    return null;
  }

  const { type, props } = modal;
  const ActiveModal = modals[type] as React.FC<LazyPropTypes>;
  return <ActiveModal isOpen onRequestClose={closeModal} {...props} />;
}
