import React, { ReactElement, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import {
  TwitterIcon,
  WhatsappIcon,
  FacebookIcon,
  CopyIcon,
  ShareIcon,
} from './icons';
import Confetti from '../svg/ConfettiSvg';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../lib/share';
import { Post } from '../graphql/posts';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import classed from '../lib/classed';
import { SimpleTooltip } from './tooltips/SimpleTooltip';
import { useCopyLink } from '../hooks/useCopy';
import { getCommentHash } from '../graphql/comments';
import { IconSize } from './Icon';
import { ModalClose } from './modals/common/ModalClose';

const ShareButton = classed(Button, 'text-theme-label-primary');
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
      className="fixed bottom-6 right-6 z-3 hidden flex-col rounded-16 border border-theme-divider-secondary bg-theme-bg-tertiary px-6 pb-6 pt-10 shadow-2 laptop:flex"
      style={{ width: '20.625rem' }}
    >
      <ModalClose onClick={onRequestClose} top="2" />
      <Confetti
        className="absolute left-2 h-16"
        style={{ top: '-4.375rem', width: '6.25rem' }}
      />
      <ShareIcon className="absolute -top-8 left-6" size={IconSize.XXXLarge} />
      <h2 className="mt-2 typo-title3">
        That&apos;s a great comment, {user.name?.split(' ')[0]}!
      </h2>
      <div className="mb-6 mt-4 text-theme-label-tertiary typo-callout">
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
            variant={ButtonVariant.Primary}
            color={ButtonColor.Twitter}
            size={ButtonSize.Small}
          >
            X
          </ShareButton>
        </SimpleTooltip>
        <SimpleTooltip content="Share on WhatsApp">
          <ShareButton
            tag="a"
            href={getWhatsappShareLink(href)}
            target="_blank"
            rel="noopener"
            icon={<WhatsappIcon />}
            variant={ButtonVariant.Primary}
            color={ButtonColor.WhatsApp}
            size={ButtonSize.Small}
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
            variant={ButtonVariant.Primary}
            color={ButtonColor.Facebook}
            size={ButtonSize.Small}
          >
            Facebook
          </ShareButton>
        </SimpleTooltip>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={() => copyLink()}
          icon={<CopyIcon />}
        >
          {copying ? 'Copied!' : 'Copy link'}
        </Button>
      </div>
    </div>
  );
}
