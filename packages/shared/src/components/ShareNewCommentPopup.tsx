import React, { ReactElement, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import TwitterIcon from './icons/Twitter';
import WhatsappIcon from './icons/Whatsapp';
import FacebookIcon from './icons/Facebook';
import CopyIcon from './icons/Copy';
import ShareIcon from './icons/Share';
import Confetti from '../svg/ConfettiSvg';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../lib/share';
import { Post } from '../graphql/posts';
import { Button } from './buttons/Button';
import { ModalCloseButton } from './modals/ModalCloseButton';
import classed from '../lib/classed';
import { SimpleTooltip } from './tooltips/SimpleTooltip';
import { useCopyLink } from '../hooks/useCopyLink';
import { getCommentHash } from '../graphql/comments';

const ShareButton = classed(Button, 'text-white');
interface ShareNewCommentPopupProps {
  onRequestClose: () => void;
  commentId: string;
  post: Post;
}

export default function ShareNewCommentPopup({
  post,
  commentId,
  onRequestClose,
}: ShareNewCommentPopupProps): ReactElement {
  const href = `${post?.commentsPermalink}${getCommentHash(commentId)}`;
  const { user } = useContext(AuthContext);
  const [copying, copyLink] = useCopyLink(() => href);

  return (
    <div
      className="hidden laptop:flex fixed right-6 bottom-6 z-3 flex-col px-6 pt-10 pb-6 rounded-2xl border shadow-2 bg-theme-bg-tertiary border-theme-divider-secondary"
      style={{ width: '20.625rem' }}
    >
      <ModalCloseButton onClick={onRequestClose} className="top-2" />
      <Confetti
        className="absolute left-2 h-16"
        style={{ top: '-4.375rem', width: '6.25rem' }}
      />
      <ShareIcon className="absolute -top-8 left-6" size="xxxxlarge" />
      <h2 className="mt-2 typo-title3">
        That&apos;s a great comment, {user.name?.split(' ')[0]}!
      </h2>
      <div className="mt-4 mb-6 text-theme-label-tertiary typo-callout">
        Discussions are super fun when shared with friends and team members.
        Give it a try!
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SimpleTooltip content="Share on Twitter">
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
        </SimpleTooltip>
        <SimpleTooltip content="Share on WhatsApp">
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
        </SimpleTooltip>
        <SimpleTooltip content="Share on Facebook">
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
        </SimpleTooltip>
        <Button
          className="btn-primary"
          buttonSize="small"
          onClick={() => copyLink()}
          icon={<CopyIcon />}
        >
          {copying ? 'Copied!' : 'Copy link'}
        </Button>
      </div>
    </div>
  );
}
