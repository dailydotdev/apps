import styled from '@emotion/styled';
import LazyImage from './LazyImage';
import sizeN from '../macros/sizeN.macro';
import rem from '../macros/rem.macro';
import { typoCallout, typoCaption1, typoTitle2 } from '../styles/typography';
import Loader from './Loader';
import { laptop, mobileL, tablet } from '../styles/media';
import { pageMaxWidth } from '../styles/helpers';
import { css, keyframes } from '@emotion/react';

export const RoundedImage = styled(LazyImage)`
  width: ${sizeN(10)};
  height: ${sizeN(10)};
  border-radius: 100%;
`;

export const SmallRoundedImage = styled(LazyImage)`
  width: ${sizeN(6)};
  height: ${sizeN(6)};
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
  padding: ${sizeN(6)} ${sizeN(4)} ${sizeN(16)};
  z-index: 1;

  ${mobileL} {
    padding-bottom: ${sizeN(6)};
  }

  ${tablet} {
    padding-left: ${sizeN(8)};
    padding-right: ${sizeN(8)};
    align-self: center;
  }

  ${laptop} {
    min-height: 100vh;
    border-left: ${rem(1)} solid var(--theme-divider-tertiary);
    border-right: ${rem(1)} solid var(--theme-divider-tertiary);
  }
`;

export const FeedPage = styled.main`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${sizeN(15)} ${sizeN(6)} ${sizeN(3)};

  ${laptop} {
    padding-left: ${sizeN(16)};
    padding-right: ${sizeN(16)};
  }

  &.notReady {
    & > * {
      visibility: hidden;
    }
  }
`;

export const FormErrorMessage = styled.div`
  margin-top: ${sizeN(4)};
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
  width: ${sizeN(4)};
  height: ${sizeN(0.5)};
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
    width: ${sizeN(2)};
    background-color: transparent;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: ${sizeN(1)};
    background: var(--theme-label-tertiary);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--theme-label-primary);
  }

  &::-webkit-scrollbar-thumb:active {
    background: var(--theme-label-primary);
  }
`;

export const noScrollbars = css`
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
`;

export const CustomFeedHeader = styled.div`
  display: flex;
  align-self: stretch;
  align-items: center;
  margin-bottom: ${sizeN(3)};
  color: var(--theme-label-secondary);
  font-weight: bold;
  ${typoCallout}

  button.laptop {
    display: none;
  }

  ${laptop} {
    button {
      display: none;

      &.laptop {
        display: flex;
      }
    }
  }
`;

export const customFeedIcon = css`
  font-size: ${sizeN(6)};
  color: var(--theme-label-tertiary);
  margin-right: ${sizeN(2)};
`;
