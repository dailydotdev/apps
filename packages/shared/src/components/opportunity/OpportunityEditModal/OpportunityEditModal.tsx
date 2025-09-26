import React from 'react';

import type { OpportunityEditInfoModalProps } from './OpportunityEditInfoModal';
import { OpportunityEditInfoModal } from './OpportunityEditInfoModal';
import type { OpportunityEditContentModalProps } from './OpportunityEditContentModal';
import { OpportunityEditContentModal } from './OpportunityEditContentModal';
import type { ModalProps } from '../../modals/common/Modal';
import type { OpportunityEditQuestionModalProps } from './OpportunityEditQuestionModal';
import { OpportunityEditQuestionModal } from './OpportunityEditQuestionModal';

type PayloadMap = {
  info: OpportunityEditInfoModalProps;
  content: OpportunityEditContentModalProps;
  question: OpportunityEditQuestionModalProps;
};

export type OpportunityEditModalProps = {
  [K in keyof PayloadMap]: { type: K; payload: PayloadMap[K] };
}[keyof PayloadMap] &
  ModalProps;

export const OpportunityEditModal = (props: OpportunityEditModalProps) => {
  const { type, payload, ...rest } = props;

  switch (type) {
    case 'info':
      return <OpportunityEditInfoModal {...rest} {...payload} />;
    case 'content':
      return <OpportunityEditContentModal {...rest} {...payload} />;
    case 'question':
      return <OpportunityEditQuestionModal {...rest} {...payload} />;
    default:
      return null;
  }
};
