import React, { ReactElement } from 'react';
import styled from 'styled-components';
import XIcon from '../icons/x.svg';
import { ModalCloseButton } from './modals/StyledModal';
import { size4, size6, sizeN } from '../styles/sizes';
import { typoSmallBase } from '../styles/typography';
import { laptop } from '../styles/media';
import { colorSalt10 } from '../styles/colors';
import DailyDevLogo from './svg/DailyDevLogo';

const Container = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: ${size4};
  color: ${colorSalt10};
  background: #ec542a;
  z-index: 2;
  ${typoSmallBase}

  ${laptop} {
    width: 13.375rem;
    left: unset;
    right: ${size6};
    bottom: ${size6};
    padding: ${size6};
    border: 0.063rem solid var(--theme-separator);
    border-radius: ${size4};
    text-align: center;
  }

  .logo {
    width: 6.5rem;
  }

  ${ModalCloseButton} {
    color: ${colorSalt10};
  }

  div {
    max-width: ${sizeN(70)};
    margin: ${size4} 0;
    text-align: center;
  }
`;

export interface ProductHuntBannerProps {
  onAccepted: () => void;
}

export default function ProductHuntBanner({
  onAccepted,
}: ProductHuntBannerProps): ReactElement {
  return (
    <Container>
      <ModalCloseButton onClick={onAccepted}>
        <XIcon />
      </ModalCloseButton>
      <DailyDevLogo />
      <div>
        Today we launched daily.dev on Product Hunt! Your feedback matters!
      </div>
      <a
        href="https://www.producthunt.com/posts/daily-dev?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-daily-dev"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=271598&theme=light"
          alt="daily.dev - Latest programming news ranked by developers for developers | Product Hunt"
          width="148"
          height="32"
        />
      </a>
    </Container>
  );
}
