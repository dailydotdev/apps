import { StyledModal } from './StyledModal';
import classed from '../../lib/classed';
import styles from './ReportModal.module.css';

export const ReportModal = classed(StyledModal, styles.reportModal);
export const ReportButtonsCenter = classed(
  'div',
  'flex items-center justify-between self-center',
);
export const ReportHeading = classed('h1', 'font-bold typo-title2 px-2');
export const ReportDescription = classed(
  'div',
  'mt-2 mb-6 px-2 text-theme-label-secondary text-center typo-callout',
);
