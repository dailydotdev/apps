import type { ReactElement } from 'react';
import React from 'react';
import type { LazyModalCommonProps } from '../../components/modals/common/Modal';
import { Modal } from '../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../components/modals/common/types';
import CloseButton from '../../components/CloseButton';
import { ButtonSize } from '../../components/buttons/Button';
import { BriefContextProvider } from '../../components/cards/brief/BriefContext';
import { IntroQuestChecklistProvider } from './IntroQuestChecklistContext';
import { IntroQuestChecklist } from './IntroQuestChecklist';

export const IntroQuestChecklistModal = ({
  onRequestClose,
  ...props
}: LazyModalCommonProps): ReactElement => (
  <Modal
    {...props}
    kind={ModalKind.FlexibleCenter}
    size={ModalSize.XSmall}
    className="overflow-hidden tablet:!max-h-[min(calc(100vh-5rem),46rem)] tablet:!w-96 tablet:!rounded-24 tablet:!bg-background-default"
    onRequestClose={onRequestClose}
    isDrawerOnMobile
    drawerProps={{ className: { drawer: 'px-0' } }}
    contentLabel="Set up daily.dev"
  >
    <CloseButton
      size={ButtonSize.Small}
      className="!absolute right-3 top-3 z-1"
      onClick={onRequestClose}
    />
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain">
      <BriefContextProvider>
        <IntroQuestChecklistProvider onRequestClose={() => onRequestClose()}>
          <IntroQuestChecklist />
        </IntroQuestChecklistProvider>
      </BriefContextProvider>
    </div>
  </Modal>
);

export default IntroQuestChecklistModal;
