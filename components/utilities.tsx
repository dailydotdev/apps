import styled from '@emotion/styled';
import LazyImage from './LazyImage';
import {
  size05,
  size1,
  size10,
  size1px,
  size2,
  size3,
  size4,
  size6,
  size8,
  sizeN,
} from '../styles/sizes';
import { typoCaption1, typoTitle2 } from '../styles/typography';
import Loader from './Loader';
import { laptop, mobileL, tablet } from '../styles/media';
import { pageMaxWidth } from '../styles/helpers';
import { css, keyframes } from '@emotion/react';

export const RoundedImage = styled(LazyImage)`
  width: ${size10};
  height: ${size10};
  border-radius: 100%;
`;

export const SmallRoundedImage = styled(LazyImage)`
  width: ${size6};
  height: ${size6};
  border-radius: 100%;
`;

export const ButtonLoader = styled(Loader)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
`;

export const LegalNotice = styled.div`
  color: var(--theme-label-quaternary);
  text-align: center;
  ${typoCaption1}

  a {
    display: inline-block;
    text-decoration: underline;
    color: inherit;
    @supports (display: contents) {
      display: contents;
    }
  }
`;

export const PageContainer = styled.main`
  position: relative;
  display: flex;
  width: 100%;
  max-width: ${pageMaxWidth};
  flex-direction: column;
  align-items: stretch;
  padding: ${size6} ${size4} ${sizeN(16)};
  z-index: 1;

  ${mobileL} {
    padding-bottom: ${size6};
  }

  ${tablet} {
    padding-left: ${size8};
    padding-right: ${size8};
    align-self: center;
  }

  ${laptop} {
    min-height: 100vh;
    border-left: ${size1px} solid var(--theme-divider-tertiary);
    border-right: ${size1px} solid var(--theme-divider-tertiary);
  }
`;

export const FeedPage = styled.main`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${sizeN(15)} ${size6} ${size3};

  ${laptop} {
    padding-left: ${sizeN(16)};
    padding-right: ${sizeN(16)};
  }
`;

export const FormErrorMessage = styled.div`
  margin-top: ${size4};
  color: var(--theme-status-error);
  ${typoCaption1}
`;

export const ProfileHeading = styled.h1`
  margin: 0;
  align-self: flex-start;
  ${typoTitle2}
`;

export const ActiveTabIndicator = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: ${size4};
  height: ${size05};
  margin: 0 auto;
  background: var(--theme-label-primary);
  border-radius: 0.063rem;
`;

const PlaceholderShimmer = keyframes`
  100% {
    transform: translateX(100%);
  }
`;

export const ElementPlaceholder = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--theme-background-secondary);

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--theme-background-secondary),
      var(--theme-background-tertiary) 15%,
      var(--theme-background-secondary)
    );
    transform: translateX(-100%);
    animation: ${PlaceholderShimmer} 1.25s infinite linear;
    will-change: transform;
  }
`;

export const customScrollbars = css`
  &::-webkit-scrollbar {
    width: ${size2};
    background-color: transparent;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: ${size1};
    background: var(--theme-label-tertiary);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--theme-label-primary);
  }

  &::-webkit-scrollbar-thumb:active {
    background: var(--theme-label-primary);
  }
`;
