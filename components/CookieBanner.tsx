import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import {
  modalBorder,
  modalBorderAndRadius,
  ModalCloseButton,
} from './modals/StyledModal';
import { size4, size6, sizeN } from '../styles/sizes';
import { cookiePolicy } from '../lib/constants';
import { laptop } from '../styles/media';
import CookieIcon from '../icons/cookie.svg';
import PrimaryButton from './buttons/PrimaryButton';
import { typoFootnote } from '../styles/typography';

const AgreeButton = styled(PrimaryButton)`
  margin-top: ${size4};
  align-self: flex-start;
`;

const Art = styled(CookieIcon)`
  display: none;
  margin-bottom: ${size4};
  color: var(--theme-label-primary);
  font-size: 3.5rem;
`;

const Container = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  width: 100%;
  flex-direction: column;
  padding: ${size4} ${sizeN(14)} ${size4} ${size4};
  color: var(--theme-label-secondary);
  background: var(--theme-background-tertiary);
  border-top: ${modalBorder};
  z-index: 2;
  ${typoFootnote}

  a {
    display: inline-block;
    text-decoration: underline;
    color: inherit;
    @supports (display: contents) {
      display: contents;
    }
  }

  ${laptop} {
    width: ${sizeN(48)};
    left: unset;
    right: ${size6};
    bottom: ${size6};
    padding: ${size6};
    align-items: center;
    text-align: center;
    ${modalBorderAndRadius}

    ${AgreeButton} {
      align-self: stretch;
    }

    ${Art} {
      display: block;
    }
  }
`;

export interface CookieBannerProps {
  onAccepted: () => void;
}

export default function CookieBanner({
  onAccepted,
}: CookieBannerProps): ReactElement {
  // const scrollThreshold = 10;

  const close = () => {
    // window.removeEventListener('scroll', onScroll, false);
    onAccepted();
  };

  // const onScroll = () => {
  //   if (window.pageYOffset > scrollThreshold) {
  //     close();
  //   }
  // };
  //
  // useEffect(() => {
  //   window.addEventListener('scroll', onScroll, false);
  // }, []);

  return (
    <Container>
      <ModalCloseButton onClick={close} />
      <Art />
      <div>
        Our lawyers advised us to tell you that we use{' '}
        <a href={cookiePolicy} target="_blank" rel="noopener">
          cookies
        </a>{' '}
        to improve user experience.
      </div>
      <AgreeButton onClick={close} buttonSize="small">
        I like cookies
      </AgreeButton>
    </Container>
  );
}
