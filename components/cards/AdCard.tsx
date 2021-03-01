/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import {
  forwardRef,
  HTMLAttributes,
  LegacyRef,
  ReactElement,
  useEffect,
} from 'react';
import {
  Card,
  CardImage,
  CardLink,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from './Card';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { typoFootnote } from '../../styles/typography';
import { Ad } from '../../graphql/posts';

type Callback = (ad: Ad) => unknown;

export type AdCardProps = {
  ad: Ad;
  onImpression?: Callback;
  onLinkClick?: Callback;
} & HTMLAttributes<HTMLDivElement>;

const Pixel = styled.img`
  display: none;
  width: 0;
  height: 0;
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: ${sizeN(3)};
  z-index: 1;
`;

const Footer = styled.a`
  margin: ${sizeN(4)} 0 ${sizeN(2)};
  color: var(--theme-label-quaternary);
  text-decoration: none;
  ${typoFootnote}
`;

const StyledCard = styled(Card)`
  ${CardImage} {
    &.blur {
      z-index: -1;
      filter: blur(${sizeN(5)});
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

  ${CardTitle} {
    margin: ${sizeN(4)} 0;
  }
`;

export default forwardRef(function AdCard(
  { ad, onImpression, onLinkClick, ...props }: AdCardProps,
  ref: LegacyRef<HTMLElement>,
): ReactElement {
  const showBlurredImage = ad.source === 'Carbon';

  useEffect(() => {
    onImpression?.(ad);
  }, []);

  return (
    <StyledCard {...props} ref={ref}>
      <CardLink
        href={ad.link}
        target="_blank"
        rel="noopener"
        title={ad.description}
        onClick={() => onLinkClick?.(ad)}
        onMouseUp={(event) => event.button === 1 && onLinkClick?.(ad)}
      />
      <CardTextContainer>
        <CardTitle
          css={css`
            -webkit-line-clamp: 4;
          `}
        >
          {ad.description}
        </CardTitle>
      </CardTextContainer>
      <CardSpace />
      <ImageContainer>
        <CardImage
          imgAlt="Ad image"
          imgSrc={ad.image}
          className={showBlurredImage && 'absolute'}
          eager={true}
        />
        {showBlurredImage && (
          <CardImage
            imgAlt="Ad image background"
            imgSrc={ad.image}
            className="blur"
            eager={true}
          />
        )}
      </ImageContainer>
      <CardTextContainer>
        {ad.referralLink ? (
          <Footer
            href={ad.referralLink}
            target="_blank"
            rel="noopener"
            className="clickable"
          >
            Promoted by {ad.source}
          </Footer>
        ) : (
          <Footer as="div">Promoted</Footer>
        )}
      </CardTextContainer>
      {ad.pixel?.map((pixel) => (
        <Pixel src={pixel} key={pixel} data-testid="pixel" />
      ))}
    </StyledCard>
  );
});
