import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import { laptop } from '../styles/media';
import { pageMaxWidth } from '../styles/helpers';
import { size1, size10, size2, size4, size7 } from '../styles/sizes';
import CopyIcon from '../icons/copy.svg';
import WhatsappIcon from '../icons/whatsapp_color.svg';
import TwitterIcon from '../icons/twitter_color.svg';
import FacebookIcon from '../icons/facebook_color.svg';
import ReactGA from 'react-ga';
import { Post } from '../graphql/posts';
import { typoCaption1 } from '../styles/typography';
import { useCopyPostLink } from '../lib/useCopyPostLink';
import {
  getFacebookShareLink,
  getShareableLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../lib/share';
import TertiaryButton from './buttons/TertiaryButton';
import { ButtonProps } from './buttons/BaseButton';

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
  color: var(--theme-status-success);
  font-weight: bold;
  ${typoCaption1}
`;

const ShareButton = styled(TertiaryButton)<
  ButtonProps<'button'> | ButtonProps<'a'>
>`
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
        <ShareButton
          title="Copy link"
          themeColor="avocado"
          onClick={copyLink}
          pressed={copying}
          icon={<CopyIcon />}
          buttonSize="small"
        />
        <ColorfulShareButton
          title="Share on WhatsApp"
          tag="a"
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
          icon={<WhatsappIcon />}
          buttonSize="small"
        />
        <ColorfulShareButton
          title="Share on Twitter"
          tag="a"
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
          icon={<TwitterIcon />}
          buttonSize="small"
        />
        <ColorfulShareButton
          title="Share on Facebook"
          tag="a"
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
          icon={<FacebookIcon />}
          buttonSize="small"
        />
      </Sticky>
    </Container>
  );
}
