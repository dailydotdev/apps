import React, { ReactElement, useEffect } from 'react';
import styled from 'styled-components';
import XIcon from '../icons/x.svg';
import { ModalCloseButton } from './modals/StyledModal';
import { size1, size3, size4, size6, sizeN } from '../styles/sizes';
import { typoNuggets, typoSmallBase } from '../styles/typography';
import { cookiePolicy } from '../lib/constants';
import { InvertButton } from './Buttons';
import { laptop } from '../styles/media';
import CookieIcon from '../icons/cookie.svg';

const AgreeButton = styled(InvertButton)`
  height: unset;
  margin-top: ${size4};
  padding: ${size1} ${size3};
  align-self: flex-start;
  ${typoNuggets}
`;

const Art = styled(CookieIcon)`
  display: none;
  margin-bottom: ${size4};
  color: var(--theme-primary);
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
  color: var(--theme-secondary);
  background: var(--theme-background-highlight);
  border-top: 0.063rem solid var(--theme-separator);
  z-index: 2;
  ${typoSmallBase}

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
    border: 0.063rem solid var(--theme-separator);
    border-radius: ${size4};
    text-align: center;

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
  const scrollThreshold = 10;

  const close = () => {
    window.removeEventListener('scroll', onScroll, false);
    onAccepted();
  };

  const onScroll = () => {
    if (window.pageYOffset > scrollThreshold) {
      close();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll, false);
  }, []);

  return (
    <Container>
      <ModalCloseButton onClick={close}>
        <XIcon />
      </ModalCloseButton>
      <Art />
      <div>
        Our lawyers advised us to tell you that we use{' '}
        <a href={cookiePolicy} target="_blank" rel="noopener">
          cookies
        </a>{' '}
        to improve user experience.
      </div>
      <AgreeButton onClick={close}>I like cookies</AgreeButton>
    </Container>
  );
}
