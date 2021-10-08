import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import AuthContext from '../contexts/AuthContext';
import TwitterIcon from '../../icons/twitter.svg';
import WhatsappIcon from '../../icons/whatsapp.svg';
import FacebookIcon from '../../icons/facebook.svg';
import CopyIcon from '../../icons/copy.svg';
import ShareIcon from '../../icons/share.svg';
import Confetti from '../svg/ConfettiSvg';
import {
  getFacebookShareLink,
  getShareableLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../lib/share';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { ForwardedButton as Button } from './buttons/Button';
import { ModalCloseButton } from './modals/ModalCloseButton';
import classed from '../lib/classed';

const LazyTooltip = dynamic(() => import('./tooltips/Tooltip'));

const ShareButton = classed(Button, 'text-white');

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
    <div
      className="fixed hidden right-6 bottom-6 flex-col pt-10 pb-6 px-6 bg-theme-bg-tertiary shadow-2 z-3 border border-theme-divider-secondary rounded-2xl laptop:flex"
      style={{ width: '20.625rem' }}
    >
      <ModalCloseButton onClick={onRequestClose} />
      <Confetti
        className="absolute left-2 h-16"
        style={{ top: '-4.375rem', width: '6.25rem' }}
      />
      <ShareIcon
        className="absolute left-6 -top-8"
        style={{ fontSize: '4rem' }}
      />
      <h2 className="mt-2 typo-title3">
        That&apos;s a great comment, {user.name?.split(' ')[0]}!
      </h2>
      <div className="mt-4 mb-6 text-theme-label-tertiary typo-callout">
        Discussions are super fun when shared with friends and team members.
        Give it a try!
      </div>
      <div className="grid gap-4 grid-cols-2">
        <LazyTooltip content="Share on Twitter">
          <ShareButton
            tag="a"
            href={getTwitterShareLink(href, post.title)}
            target="_blank"
            rel="noopener"
            icon={<TwitterIcon />}
            className="btn-primary-twitter"
            buttonSize="small"
          >
            Twitter
          </ShareButton>
        </LazyTooltip>
        <LazyTooltip content="Share on WhatsApp">
          <ShareButton
            tag="a"
            href={getWhatsappShareLink(href)}
            target="_blank"
            rel="noopener"
            icon={<WhatsappIcon />}
            className="btn-primary-whatsapp"
            buttonSize="small"
          >
            Whatsapp
          </ShareButton>
        </LazyTooltip>
        <LazyTooltip content="Share on Facebook">
          <ShareButton
            tag="a"
            href={getFacebookShareLink(href)}
            target="_blank"
            rel="noopener"
            icon={<FacebookIcon />}
            className="btn-primary-facebook"
            buttonSize="small"
          >
            Facebook
          </ShareButton>
        </LazyTooltip>
        <Button
          className="btn-primary"
          buttonSize="small"
          onClick={copyLink}
          icon={<CopyIcon />}
        >
          {copying ? 'Copied!' : 'Copy link'}
        </Button>
      </div>
    </div>
  );
}
