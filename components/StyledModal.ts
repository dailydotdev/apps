import Modal from 'react-modal';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { ReactModalAdapter } from './ReactModalAdapter';
import { size4 } from '../styles/sizes';
import { focusOutline } from '../styles/utilities';
import { IconButton } from './Buttons';
import { mobileL } from '../styles/media';

export interface Props extends Modal.Props {
  children?: ReactNode;
}

export const ModalCloseButton = styled(IconButton).attrs({ size: 'small' })`
  position: absolute;
  right: ${size4};
  top: ${size4};
`;

export const StyledModal = styled(ReactModalAdapter)`
  .Overlay {
    display: flex;
    position: fixed;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--theme-backdrop);

    ${mobileL} {
      justify-content: center;
    }
  }

  .Modal {
    display: flex;
    position: relative;
    width: 100%;
    flex-direction: column;
    align-items: center;
    background: var(--theme-background-highlight);
    border: 0.063rem solid var(--theme-separator);
    border-radius: ${size4} ${size4} 0 0;
    ${focusOutline}

    ${mobileL} {
      max-width: 26.25rem;
      border-radius: ${size4};
    }
  }
`;
