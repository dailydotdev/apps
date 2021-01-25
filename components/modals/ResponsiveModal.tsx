import styled from '@emotion/styled';
import { modalBorderAndRadius, StyledModal } from './StyledModal';
import { mobileL } from '../../styles/media';
import { size2, sizeN } from '../../styles/sizes';

export const responsiveModalBreakpoint = mobileL;

const ResponsiveModal = styled(StyledModal)`
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
    padding: ${size2};
    border: none;
    border-radius: 0;

    ${responsiveModalBreakpoint} {
      position: relative;
      min-height: unset;
      ${modalBorderAndRadius}
    }
  }
`;

export default ResponsiveModal;
