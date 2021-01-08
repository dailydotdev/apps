import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { laptop } from '../styles/media';
import { pageMaxWidth } from '../styles/helpers';
import { size1, size10, size2, size4, size7 } from '../styles/sizes';
import { IconButton } from './OldButtons';
import CopyIcon from '../icons/copy.svg';
import WhatsappIcon from '../icons/whatsapp_color.svg';
import TwitterIcon from '../icons/twitter_color.svg';
import FacebookIcon from '../icons/facebook_color.svg';
import ReactGA from 'react-ga';
import { Post } from '../graphql/posts';
import { typoNuggets } from '../styles/typography';
import { useCopyPostLink } from '../lib/useCopyPostLink';
import {
  getFacebookShareLink,
  getShareableLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../lib/share';

const barWidth = size7;

const Container = styled.div`
  display: none;
  position: absolute;
  top: 11.5rem;
  bottom: 0;
  left: calc((100vw - ${pageMaxWidth}) / 2 - ${barWidth} - ${size4});
  width: ${barWidth};

  ${laptop} {
    display: block;
  }
`;

const Sticky = styled.div`
  position: sticky;
  display: flex;
  top: ${size10};
  width: 100%;
  flex-direction: column;
  align-items: center;
  margin: -${size1} 0;
`;

const Copied = styled.div`
  position: absolute;
  display: flex;
  top: ${size2};
  right: 100%;
  height: ${barWidth};
  align-items: center;
  margin-right: ${size1};
  color: var(--theme-avocado);
  ${typoNuggets}
`;

const ShareButton = styled(IconButton)`
  margin: ${size1} 0;
`;

const ColorfulShareButton = styled(ShareButton)`
  color: #ffffff;
`;

export default function ShareBar({ post }: { post: Post }): ReactElement {
  const href = getShareableLink();
  const [copying, copyLink] = useCopyPostLink();

  return (
    <Container>
      <Sticky>
        {copying && <Copied>Copied!</Copied>}
        <ShareButton title="Copy link" onClick={copyLink} done={copying}>
          <CopyIcon />
        </ShareButton>
        <ColorfulShareButton
          title="Share on WhatsApp"
          as="a"
          href={getWhatsappShareLink(href)}
          target="_blank"
          rel="noopener"
          onClick={() =>
            ReactGA.event({
              category: 'Post',
              action: 'Share',
              label: 'WhatsApp',
            })
          }
        >
          <WhatsappIcon />
        </ColorfulShareButton>
        <ColorfulShareButton
          title="Share on Twitter"
          as="a"
          href={getTwitterShareLink(href, post.title)}
          target="_blank"
          rel="noopener"
          onClick={() =>
            ReactGA.event({
              category: 'Post',
              action: 'Share',
              label: 'Twitter',
            })
          }
        >
          <TwitterIcon />
        </ColorfulShareButton>
        <ColorfulShareButton
          title="Share on Facebook"
          as="a"
          href={getFacebookShareLink(href)}
          target="_blank"
          rel="noopener"
          onClick={() =>
            ReactGA.event({
              category: 'Post',
              action: 'Share',
              label: 'Facebook',
            })
          }
        >
          <FacebookIcon />
        </ColorfulShareButton>
      </Sticky>
    </Container>
  );
}
