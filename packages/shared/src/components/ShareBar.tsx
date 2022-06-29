import React, { FunctionComponent, ReactElement, useContext } from 'react';
import CopyIcon from './icons/Copy';
import WhatsappIcon from '../../icons/whatsapp_color.svg';
import TwitterIcon from '../../icons/twitter_color.svg';
import FacebookIcon from '../../icons/facebook_color.svg';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../lib/share';
import { Button, ButtonProps } from './buttons/Button';
import classed from '../lib/classed';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { SimpleTooltip } from './tooltips/SimpleTooltip';
import { WidgetContainer } from './widgets/common';
import { Origin } from '../lib/analytics';

const ShareButton = classed(Button, 'my-1');
const ColorfulShareButton = classed(
  ShareButton,
  'text-white',
) as unknown as FunctionComponent<ButtonProps<'a'>>;

export default function ShareBar({ post }: { post: Post }): ReactElement {
  const href = post.commentsPermalink;
  const [copying, copyLink] = useCopyPostLink(href);
  const { trackEvent } = useContext(AnalyticsContext);

  const onClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );

  return (
    <WidgetContainer className="hidden laptop:flex flex-col p-3">
      <p className="typo-callout text-theme-label-tertiary">
        Would you recommend this article?
      </p>
      <div className="inline-flex relative flex-row items-center mt-3">
        <SimpleTooltip content="Copy link">
          <ShareButton
            onClick={() => copyLink()}
            pressed={copying}
            icon={<CopyIcon />}
            className="btn-tertiary-avocado"
          />
        </SimpleTooltip>
        <SimpleTooltip content="Share on WhatsApp">
          <ColorfulShareButton
            tag="a"
            href={getWhatsappShareLink(href)}
            target="_blank"
            rel="noopener"
            onClick={() => onClick(ShareProvider.WhatsApp)}
            icon={<WhatsappIcon style={{ fontSize: '1.75rem' }} />}
            className="btn-tertiary"
          />
        </SimpleTooltip>
        <SimpleTooltip content="Share on Twitter">
          <ColorfulShareButton
            tag="a"
            href={getTwitterShareLink(href, post.title)}
            target="_blank"
            rel="noopener"
            onClick={() => onClick(ShareProvider.Twitter)}
            icon={<TwitterIcon style={{ fontSize: '1.75rem' }} />}
            className="btn-tertiary"
          />
        </SimpleTooltip>
        <SimpleTooltip content="Share on Facebook">
          <ColorfulShareButton
            tag="a"
            href={getFacebookShareLink(href)}
            target="_blank"
            rel="noopener"
            onClick={() => onClick(ShareProvider.Facebook)}
            icon={<FacebookIcon style={{ fontSize: '1.75rem' }} />}
            className="btn-tertiary"
          />
        </SimpleTooltip>
      </div>
    </WidgetContainer>
  );
}
