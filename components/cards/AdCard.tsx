import React, { HTMLAttributes, ReactElement, useEffect } from 'react';
import {
  Card,
  CardImage,
  CardLink,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from './Card';
import styled from 'styled-components/macro';
import { size2, size3, size4, size5 } from '../../styles/sizes';
import { typoFootnote } from '../../styles/typography';

export interface Ad {
  pixel?: string[];
  source: string;
  link: string;
  description: string;
  image: string;
  placeholder?: string;
  referralLink?: string;
}

type Callback = (ad: Ad) => unknown;

export type AdCardProps = {
  ad: Ad;
  onImpression: Callback;
  onClick: Callback;
} & HTMLAttributes<HTMLDivElement>;

const Pixel = styled.img`
  display: none;
  width: 0;
  height: 0;
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: ${size3};
  z-index: 1;
`;

const Footer = styled.div`
  margin: ${size4} 0 ${size2};
  color: var(--theme-label-quaternary);
  text-decoration: none;
  ${typoFootnote};
`;

const StyledCard = styled(Card)`
  ${CardImage} {
    &.blur {
      z-index: -1;
      filter: blur(${size5});
    }

    &.absolute {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;

      img {
        object-fit: contain;
      }
    }
  }
`;

export function AdCard({
  ad,
  onImpression,
  onClick,
  ...props
}: AdCardProps): ReactElement {
  const showBlurredImage = ad.source === 'Carbon';

  useEffect(() => {
    onImpression(ad);
  }, []);

  return (
    <StyledCard {...props}>
      <CardLink
        href={ad.link}
        target="_blank"
        rel="noopener"
        onClick={() => onClick(ad)}
        onMouseUp={(event) => event.button === 1 && onClick(ad)}
      />
      <CardTextContainer>
        <CardTitle>{ad.description}</CardTitle>
      </CardTextContainer>
      <CardSpace />
      <ImageContainer>
        <CardImage
          imgAlt="Ad image"
          imgSrc={ad.image}
          lowsrc={ad.placeholder}
          className={showBlurredImage && 'absolute'}
        />
        {showBlurredImage && (
          <CardImage
            imgAlt="Ad image background"
            imgSrc={ad.image}
            lowsrc={ad.placeholder}
            className="blur"
          />
        )}
      </ImageContainer>
      <CardTextContainer>
        {ad.referralLink ? (
          <Footer
            as="a"
            href={ad.referralLink}
            target="_blank"
            rel="noopener"
            className="clickable"
          >
            Promoted by {ad.source}
          </Footer>
        ) : (
          <Footer>Promoted</Footer>
        )}
      </CardTextContainer>
      {ad.pixel?.map((pixel) => (
        <Pixel src={pixel} key={pixel} data-testid="pixel" />
      ))}
    </StyledCard>
  );
}
