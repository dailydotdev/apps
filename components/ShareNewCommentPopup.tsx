import React, { ReactElement, useContext } from 'react';
import styled from 'styled-components';
import { size10, size2, size4, size6, size8, sizeN } from '../styles/sizes';
import { ModalCloseButton } from './modals/StyledModal';
import { laptop } from '../styles/media';
import AuthContext from './AuthContext';
import { typoDouble, typoLil1, typoNuggets } from '../styles/typography';
import { ColorButton } from './OldButtons';
import TwitterIcon from '../icons/twitter.svg';
import WhatsappIcon from '../icons/whatsapp.svg';
import FacebookIcon from '../icons/facebook.svg';
import CopyIcon from '../icons/copy.svg';
import ShareIcon from '../icons/share.svg';
import Confetti from './svg/ConfettiSvg';
import { colorPepper80, colorSalt10 } from '../styles/colors';
import {
  getFacebookShareLink,
  getShareableLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../lib/share';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../lib/useCopyPostLink';

const Container = styled.div`
  position: fixed;
  display: none;
  right: ${size6};
  bottom: ${size6};
  width: ${sizeN(82)};
  flex-direction: column;
  padding: ${size10} ${size6} ${size6};
  background: var(--theme-background-highlight);
  border: 0.063rem solid var(--theme-separator);
  border-radius: ${size4};
  z-index: 3;

  ${laptop} {
    display: flex;
  }
`;

const Title = styled.h2`
  ${typoDouble}
`;

const Description = styled.div`
  margin: ${size4} 0 ${size6};
  color: var(--theme-secondary);
  ${typoLil1}
`;

const Buttons = styled.div`
  display: grid;
  column-gap: ${size4};
  row-gap: ${size4};
  grid-template-columns: 1fr 1fr;
`;

const ShareButton = styled(ColorButton)`
  height: ${size8};
  color: ${colorSalt10};
  ${typoNuggets}
`;

const CopyButton = styled(ShareButton).attrs({ background: colorSalt10 })`
  color: ${colorPepper80};
`;

const StyledConfetti = styled(Confetti)`
  position: absolute;
  left: ${size2};
  top: -4.375rem;
  width: 6.25rem;
  height: 4rem;
`;

const StyledShare = styled(ShareIcon)`
  position: absolute;
  left: ${size6};
  top: -2rem;
  font-size: 4rem;
`;

interface ShareNewCommentPopupProps {
  onRequestClose: () => void;
  post: Post;
}

export default function ShareNewCommentPopup({
  post,
  onRequestClose,
}: ShareNewCommentPopupProps): ReactElement {
  const href = getShareableLink();
  const { user } = useContext(AuthContext);
  const [copying, copyLink] = useCopyPostLink();

  return (
    <Container>
      <ModalCloseButton onClick={onRequestClose} />
      <StyledConfetti />
      <StyledShare />
      <Title>That&apos;s a great comment, {user.name?.split(' ')[0]}!</Title>
      <Description>
        Discussions are super fun when shared with friends and team members.
        Give it a try!
      </Description>
      <Buttons>
        <ShareButton
          as="a"
          background="#1DA0F2"
          title="Share on Twitter"
          href={getTwitterShareLink(href, post.title)}
          target="_blank"
          rel="noopener"
        >
          <TwitterIcon />
          <span>Twitter</span>
        </ShareButton>
        <ShareButton
          as="a"
          background="#20B038"
          title="Share on WhatsApp"
          href={getWhatsappShareLink(href)}
          target="_blank"
          rel="noopener"
        >
          <WhatsappIcon />
          <span>Whatsapp</span>
        </ShareButton>
        <ShareButton
          as="a"
          background="#3B5998"
          title="Share on Facebook"
          href={getFacebookShareLink(href)}
          target="_blank"
          rel="noopener"
        >
          <FacebookIcon />
          <span>Facebook</span>
        </ShareButton>
        <CopyButton onClick={copyLink}>
          <CopyIcon />
          <span>{copying ? 'Copied!' : 'Copy link'}</span>
        </CopyButton>
      </Buttons>
    </Container>
  );
}
