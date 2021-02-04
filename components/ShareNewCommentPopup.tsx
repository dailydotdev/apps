import React, { ReactElement, useContext } from 'react';
import styled from '@emotion/styled';
import sizeN from '../macros/sizeN.macro';
import { modalBorderAndRadius, ModalCloseButton } from './modals/StyledModal';
import { laptop } from '../styles/media';
import AuthContext from './AuthContext';
import { typoCallout, typoTitle3 } from '../styles/typography';
import TwitterIcon from '../icons/twitter.svg';
import WhatsappIcon from '../icons/whatsapp.svg';
import FacebookIcon from '../icons/facebook.svg';
import CopyIcon from '../icons/copy.svg';
import ShareIcon from '../icons/share.svg';
import Confetti from './svg/ConfettiSvg';
import {
  getFacebookShareLink,
  getShareableLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../lib/share';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../lib/useCopyPostLink';
import PrimaryButton from './buttons/PrimaryButton';
import { ButtonProps } from './buttons/BaseButton';

const Container = styled.div`
  position: fixed;
  display: none;
  right: ${sizeN(6)};
  bottom: ${sizeN(6)};
  width: ${sizeN(82)};
  flex-direction: column;
  padding: ${sizeN(10)} ${sizeN(6)} ${sizeN(6)};
  background: var(--theme-background-tertiary);
  box-shadow: var(--theme-shadow2);
  z-index: 3;
  ${modalBorderAndRadius}

  ${laptop} {
    display: flex;
  }
`;

const Title = styled.h2`
  margin: ${sizeN(2)} 0 0;
  ${typoTitle3}
`;

const Description = styled.div`
  margin: ${sizeN(4)} 0 ${sizeN(6)};
  color: var(--theme-label-tertiary);
  ${typoCallout}
`;

const Buttons = styled.div`
  display: grid;
  column-gap: ${sizeN(4)};
  row-gap: ${sizeN(4)};
  grid-template-columns: 1fr 1fr;
`;

const ShareButton = styled(PrimaryButton)<ButtonProps<'a'>>`
  &&& {
    color: #ffffff;
  }
`;

const StyledConfetti = styled(Confetti)`
  position: absolute;
  left: ${sizeN(2)};
  top: -4.375rem;
  width: 6.25rem;
  height: 4rem;
`;

const StyledShare = styled(ShareIcon)`
  position: absolute;
  left: ${sizeN(6)};
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
          tag="a"
          title="Share on Twitter"
          href={getTwitterShareLink(href, post.title)}
          target="_blank"
          rel="noopener"
          icon={<TwitterIcon />}
          themeColor="twitter"
        >
          Twitter
        </ShareButton>
        <ShareButton
          tag="a"
          title="Share on WhatsApp"
          href={getWhatsappShareLink(href)}
          target="_blank"
          rel="noopener"
          icon={<WhatsappIcon />}
          themeColor="whatsapp"
        >
          Whatsapp
        </ShareButton>
        <ShareButton
          tag="a"
          title="Share on Facebook"
          href={getFacebookShareLink(href)}
          target="_blank"
          rel="noopener"
          icon={<FacebookIcon />}
          themeColor="facebook"
        >
          Facebook
        </ShareButton>
        <PrimaryButton onClick={copyLink} icon={<CopyIcon />}>
          {copying ? 'Copied!' : 'Copy link'}
        </PrimaryButton>
      </Buttons>
    </Container>
  );
}
