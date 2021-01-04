import Modal from 'react-modal';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { ReactModalAdapter } from './ReactModalAdapter';
import { size10, size2, size4, size6 } from '../../styles/sizes';
import { focusOutline } from '../../styles/helpers';
import { BaseButton, IconButton } from '../Buttons';
import { mobileL } from '../../styles/media';
import { typoCallout, typoLil2, typoTitle3 } from '../../styles/typography';
import { overlayTertiary } from '../../styles/colors';

export interface Props extends Modal.Props {
  children?: ReactNode;
}

export const ModalCloseButton = styled(IconButton).attrs({
  size: 'small',
  title: 'Close',
})`
  position: absolute;
  right: ${size4};
  top: ${size4};
`;

export const ConfirmationButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;

  ${BaseButton} {
    flex: 1;
    padding: ${size2} ${size4};
    margin: 0 ${size2};
    color: var(--theme-primary);
    border-radius: ${size2};
    ${typoLil2}

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }
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
    max-height: 100vh;
    background-color: ${overlayTertiary('white')};
    z-index: 2;

    ${mobileL} {
      justify-content: center;
    }
  }

  .Modal {
    display: flex;
    position: relative;
    width: 100%;
    max-width: 26.25rem;
    max-height: 100%;
    overflow-y: auto;
    flex-direction: column;
    align-items: center;
    background: var(--theme-background-tertiary);
    border-radius: ${size4} ${size4} 0 0;
    box-shadow: var(--theme-shadow2);
    ${focusOutline}

    ${mobileL} {
      border: 0.063rem solid var(--theme-divider-secondary);
      border-radius: ${size4};
    }
  }
`;

export const ConfirmationModal = styled(StyledModal)`
  .Overlay {
    justify-content: center;
    padding-left: ${size6};
    padding-right: ${size6};
  }

  .Modal {
    max-width: 23.25rem;
    padding: ${size6} ${size10};
    border: 0.063rem solid var(--theme-divider-secondary);
    border-radius: ${size4};
  }
`;

export const ConfirmationHeading = styled.h1`
  font-weight: bold;
  ${typoTitle3}
`;

export const ConfirmationDescription = styled.div`
  margin: ${size2} 0 ${size6};
  color: var(--theme-label-secondary);
  text-align: center;
  ${typoCallout}
`;
