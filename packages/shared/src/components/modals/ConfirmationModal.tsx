import { StyledModal } from './StyledModal';
import classed from '../../lib/classed';
import styles from './ConfirmationModal.module.css';

export const ConfirmationModal = classed(StyledModal, styles.confirmationModal);
export const ConfirmationButtons = classed(
  'div',
  'flex items-center justify-between self-stretch',
  styles.buttons,
);
export const ConfirmationButtonsCenter = classed(
  'div',
  'flex items-center justify-between self-center',
  styles.buttons,
);
export const ConfirmationHeading = classed(
  'h1',
  'font-bold typo-title3 text-center',
);
export const ConfirmationDescription = classed(
  'div',
  'mt-2 mb-6 text-theme-label-secondary text-center typo-callout',
);
