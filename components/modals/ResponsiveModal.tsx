/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import {
  modalBorderAndRadius,
  StyledModal,
  Props as ModalProps,
} from './StyledModal';
import { mobileL } from '../../styles/media';
import sizeN from '../../macros/sizeN.macro';
import { ReactElement } from 'react';
import { useHideOnModal } from '../../hooks/useHideOnModal';
import { useResetScrollForResponsiveModal } from '../../hooks/useResetScrollForResponsiveModal';

export const responsiveModalBreakpoint = mobileL;

export default function ResponsiveModal(props: ModalProps): ReactElement {
  useResetScrollForResponsiveModal();
  useHideOnModal(props.isOpen);
  return (
    <StyledModal
      {...props}
      css={css`
        .Overlay {
          position: relative;
          min-height: 100vh;
          padding: 0;

          ${responsiveModalBreakpoint} {
            position: fixed;
            min-height: unset;
          }
        }

        .Modal {
          position: absolute;
          max-width: ${sizeN(120)};
          min-height: 100%;
          align-items: stretch;
          padding: ${sizeN(2)};
          border: none;
          border-radius: 0;

          ${responsiveModalBreakpoint} {
            position: relative;
            min-height: unset;
            ${modalBorderAndRadius}
          }
        }
      `}
    />
  );
}
