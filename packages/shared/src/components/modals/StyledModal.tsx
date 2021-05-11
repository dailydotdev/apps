import { ReactNode } from 'react';
import Modal from 'react-modal';
import { ReactModalAdapter } from './ReactModalAdapter';
import classed from '../../lib/classed';
import styles from './StyledModal.module.css';

export interface ModalProps extends Modal.Props {
  children?: ReactNode;
}

export const StyledModal = classed(ReactModalAdapter, styles.styledModal);
