import React, { FunctionComponent, ReactElement, useContext } from 'react';
import classNames from 'classnames';
import CopyIcon from '../../icons/copy.svg';
import WhatsappIcon from '../../icons/whatsapp_color.svg';
import TwitterIcon from '../../icons/twitter_color.svg';
import FacebookIcon from '../../icons/facebook_color.svg';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import {
  getFacebookShareLink,
  getShareableLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../lib/share';
import { Button, ButtonProps } from './buttons/Button';
import { getTooltipProps } from '../lib/tooltip';
import styles from './ShareBar.module.css';
import classed from '../lib/classed';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';

const ShareButton = classed(Button, 'my-1');
const ColorfulShareButton = classed(
  ShareButton,
  'text-white',
) as unknown as FunctionComponent<ButtonProps<'a'>>;

export default function ShareBar({ post }: { post: Post }): ReactElement {
  const href = getShareableLink();
  const [copying, copyLink] = useCopyPostLink();
  const { trackEvent } = useContext(AnalyticsContext);

  const onClick = (media: string) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { media, origin: 'share bar' },
      }),
    );

  return (
    <div
      className={classNames('hidden absolute laptopL:block', styles.shareBar)}
    >
      <div className="sticky flex flex-col top-10 w-full items-center -my-1">
        {copying && (
          <div
            className={classNames(
              'absolute flex top-2 right-full items-center mr-1 text-theme-status-success font-bold typo-caption1',
              styles.copied,
            )}
          >
            Copied!
          </div>
        )}
        <ShareButton
          onClick={copyLink}
          pressed={copying}
          icon={<CopyIcon />}
          buttonSize="small"
          className="btn-tertiary-avocado"
          {...getTooltipProps('Copy link')}
        />
        <ColorfulShareButton
          tag="a"
          href={getWhatsappShareLink(href)}
          target="_blank"
          rel="noopener"
          onClick={() => onClick('whatsapp')}
          icon={<WhatsappIcon />}
          buttonSize="small"
          className="btn-tertiary"
          {...getTooltipProps('Share on WhatsApp')}
        />
        <ColorfulShareButton
          tag="a"
          href={getTwitterShareLink(href, post.title)}
          target="_blank"
          rel="noopener"
          onClick={() => onClick('twitter')}
          icon={<TwitterIcon />}
          buttonSize="small"
          className="btn-tertiary"
          {...getTooltipProps('Share on Twitter')}
        />
        <ColorfulShareButton
          tag="a"
          href={getFacebookShareLink(href)}
          target="_blank"
          rel="noopener"
          onClick={() => onClick('facebook')}
          icon={<FacebookIcon />}
          buttonSize="small"
          className="btn-tertiary"
          {...getTooltipProps('Share on Facebook')}
        />
      </div>
    </div>
  );
}
