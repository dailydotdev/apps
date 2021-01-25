import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import { size2, size4, size6, sizeN } from '../styles/sizes';
import LazyImage from './LazyImage';
import { typoCallout } from '../styles/typography';
import { pageMaxWidth } from '../styles/helpers';
import { mobileL } from '../styles/media';
import PrimaryButton from './buttons/PrimaryButton';

const promotionWidth = sizeN(36);

const Container = styled.div`
  position: fixed;
  display: none;
  right: calc((100vw - ${pageMaxWidth}) / 4 - ${promotionWidth} / 2);
  bottom: ${size6};
  width: ${promotionWidth};
  flex-direction: column;
  align-items: stretch;

  a {
    align-self: flex-start;
  }

  ${mobileL} {
    display: flex;
  }
`;

const Cover = styled(LazyImage)`
  border-radius: ${size2};
`;

const Content = styled.div`
  margin: ${size4} 0 ${size6};
  color: var(--theme-label-tertiary);
  ${typoCallout}
`;

export default function Promotion(): ReactElement {
  return (
    <Container>
      <Cover
        imgSrc="https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1597305902/webapp/promotion"
        imgAlt="Promotional cover for daily.dev extension"
        ratio="52.8%"
      />
      <Content>
        Daily delivers the best programming news every new tab. It is a browser
        extension that boosts your professional growth.
      </Content>
      <PrimaryButton tag="a" href="/api/get?r=webapp">
        Get it now
      </PrimaryButton>
    </Container>
  );
}
