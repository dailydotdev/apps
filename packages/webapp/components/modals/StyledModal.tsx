/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import Modal from 'react-modal';
import { ReactElement, ReactNode } from 'react';
import styled from '@emotion/styled';
import { ReactModalAdapter } from './ReactModalAdapter';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
import { focusOutline } from '../../styles/helpers';
import { typoCallout, typoTitle3 } from '../../styles/typography';
import Button, { ButtonProps } from '../buttons/Button';
import XIcon from '../../icons/x.svg';

export interface ModalProps extends Modal.Props {
  children?: ReactNode;
}

export const ModalCloseButton = (
  props: ButtonProps<'button'>,
): ReactElement => (
  <Button
    {...props}
    className="btn-tertiary"
    buttonSize="small"
    title="Close"
    icon={<XIcon />}
    css={css`
      && {
        position: absolute;
        right: ${sizeN(4)};
        top: ${sizeN(4)};
      }
    `}
  />
);

export const ConfirmationButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;

  > button {
    flex: 1;
    margin: 0 ${sizeN(2)};

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }
`;

export const modalBorder = `${rem(1)} solid var(--theme-divider-secondary)`;
export const modalBorderAndRadius = `
border: ${modalBorder};
border-radius: ${sizeN(4)};
`;

export const StyledModal = styled(ReactModalAdapter)`
  .Overlay {
    display: flex;
    position: fixed;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 100vh;
    padding-left: ${sizeN(5)};
    padding-right: ${sizeN(5)};
    background: var(--theme-overlay-quaternary);
    z-index: 10;
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
    box-shadow: var(--theme-shadow2);
    ${modalBorderAndRadius}
    ${focusOutline}
  }
`;

export const ConfirmationModal = styled(StyledModal)`
  .Overlay {
    justify-content: center;
    padding-left: ${sizeN(6)};
    padding-right: ${sizeN(6)};
  }

  .Modal {
    max-width: 23.25rem;
    padding: ${sizeN(6)} ${sizeN(10)};
    border: 0.063rem solid var(--theme-divider-secondary);
    border-radius: ${sizeN(4)};
  }
`;

export const ConfirmationHeading = styled.h1`
  font-weight: bold;
  ${typoTitle3}
`;

export const ConfirmationDescription = styled.div`
  margin: ${sizeN(2)} 0 ${sizeN(6)};
  color: var(--theme-label-secondary);
  text-align: center;
  ${typoCallout}
`;
