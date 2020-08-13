import React, { ReactElement, useState } from 'react';
import styled from 'styled-components';
import { laptop } from '../styles/media';
import { postPageMaxWidth } from '../styles/utilities';
import { size1, size10, size4, size7 } from '../styles/sizes';
import { IconButton } from './Buttons';
import CopyIcon from '../icons/copy.svg';
import WhatsappIcon from '../icons/whatsapp.svg';
import TwitterIcon from '../icons/twitter.svg';
import FacebookIcon from '../icons/facebook.svg';
import ReactGA from 'react-ga';
import { Post } from '../graphql/posts';
import { typoNuggets } from '../styles/typography';

const barWidth = size7;

const Container = styled.div`
  display: none;
  position: absolute;
  top: 11.5rem;
  bottom: 0;
  left: calc((100vw - ${postPageMaxWidth}) / 2 - ${barWidth} - ${size4});
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
  top: ${size1};
  right: 100%;
  height: ${barWidth};
  align-items: center;
  margin-right: ${size1};
  color: var(--theme-avocado);
  ${typoNuggets}
`;

const ShareButton = styled(IconButton).attrs({ size: 'small' })`
  margin: ${size1} 0;
`;

const ColorfulShareButton = styled(ShareButton)`
  color: #ffffff;
`;

export default function ShareBar({ post }: { post: Post }): ReactElement {
  const href = encodeURIComponent(window.location.href);
  const [copying, setCopying] = useState<boolean>(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopying(true);
    ReactGA.event({
      category: 'Post',
      action: 'Share',
      label: 'Copy',
    });
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

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
          href={`https://wa.me/?text=${href}`}
          target="_blank"
          rel="noopener noreferrer"
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
          href={`http://twitter.com/share?url=${href}&text=${encodeURIComponent(
            `${post.title} via @dailydotdev`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
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
          href={`https://www.facebook.com/sharer/sharer.php?display=page&u=${href}`}
          target="_blank"
          rel="noopener noreferrer"
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
