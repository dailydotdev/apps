import React, { ReactElement, MouseEvent, useState, useRef } from 'react';
import { StyledModal } from '@dailydotdev/shared/src/components/modals/StyledModal';
import { ModalCloseButton } from '@dailydotdev/shared/src/components/modals/ModalCloseButton';

export default function DisableCompanionModal(props): ReactElement {
  return (
    <StyledModal {...props}>
      <header className="flex justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Disable the companion widget?</h3>
        <ModalCloseButton />
      </header>
      <section className="overflow-auto relative w-full h-full shrink max-h-full">
        You can always re-enable it
      </section>
    </StyledModal>
  );
}
