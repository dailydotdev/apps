import React, { FunctionComponent, ReactElement } from 'react';
import CopyIcon from '@dailydotdev/shared/icons/copy.svg';
import WhatsappIcon from '@dailydotdev/shared/icons/whatsapp_color.svg';
import TwitterIcon from '@dailydotdev/shared/icons/twitter_color.svg';
import FacebookIcon from '@dailydotdev/shared/icons/facebook_color.svg';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import {
  getFacebookShareLink,
  getShareableLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../lib/share';
import { Button, ButtonProps } from '@dailydotdev/shared';
import { trackEvent } from '../lib/analytics';
import { getTooltipProps } from '../lib/tooltip';
import styles from '../styles/shareBar.module.css';
import classNames from 'classnames';
import classed from '../lib/classed';

const ShareButton = classed(Button, 'my-1');
const ColorfulShareButton = (classed(
  ShareButton,
  'text-white',
) as unknown) as FunctionComponent<ButtonProps<'a'>>;

export default function ShareBar({ post }: { post: Post }): ReactElement {
  const href = getShareableLink();
  const [copying, copyLink] = useCopyPostLink();

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
          onClick={() =>
            trackEvent({
              category: 'Post',
              action: 'Share',
              label: 'WhatsApp',
            })
          }
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
          onClick={() =>
            trackEvent({
              category: 'Post',
              action: 'Share',
              label: 'Twitter',
            })
          }
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
          onClick={() =>
            trackEvent({
              category: 'Post',
              action: 'Share',
              label: 'Facebook',
            })
          }
          icon={<FacebookIcon />}
          buttonSize="small"
          className="btn-tertiary"
          {...getTooltipProps('Share on Facebook')}
        />
      </div>
    </div>
  );
}
