import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import sizeN from '../macros/sizeN.macro';
import LazyImage from './LazyImage';
import { typoCallout } from '../styles/typography';
import { pageMaxWidth } from '../styles/helpers';
import { mobileL } from '../styles/media';
import Button from './buttons/Button';

const promotionWidth = sizeN(36);

const Container = styled.div`
  position: fixed;
  display: none;
  right: calc((100vw - ${pageMaxWidth}) / 4 - ${promotionWidth} / 2);
  bottom: ${sizeN(6)};
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
  border-radius: ${sizeN(2)};
`;

const Content = styled.div`
  margin: ${sizeN(4)} 0 ${sizeN(6)};
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
      <Button className="btn-primary" tag="a" href="/api/get?r=webapp">
        Get it now
      </Button>
    </Container>
  );
}
