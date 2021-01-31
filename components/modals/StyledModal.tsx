/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import Modal from 'react-modal';
import { ReactElement, ReactNode } from 'react';
import styled from '@emotion/styled';
import { ReactModalAdapter } from './ReactModalAdapter';
import {
  size10,
  size1px,
  size2,
  size4,
  size5,
  size6,
} from '../../styles/sizes';
import { focusOutline } from '../../styles/helpers';
import { typoCallout, typoTitle3 } from '../../styles/typography';
import TertiaryButton from '../buttons/TertiaryButton';
import { ButtonProps } from '../buttons/BaseButton';
import XIcon from '../../icons/x.svg';

export interface Props extends Modal.Props {
  children?: ReactNode;
}

export const ModalCloseButton = (
  props: ButtonProps<'button'>,
): ReactElement => (
  <TertiaryButton
    {...props}
    buttonSize="small"
    title="Close"
    icon={<XIcon />}
    css={css`
      && {
        position: absolute;
        right: ${size4};
        top: ${size4};
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
    margin: 0 ${size2};

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }
`;

export const modalBorder = `${size1px} solid var(--theme-divider-secondary)`;
export const modalBorderAndRadius = `
border: ${modalBorder};
border-radius: ${size4};
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
    padding-left: ${size5};
    padding-right: ${size5};
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
