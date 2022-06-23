import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { Button } from '../buttons/Button';
import XIcon from '../icons/Close';
import { ResponsiveModal } from './ResponsiveModal';
import PostItemCard from '../post/PostItemCard';
import { Post } from '../../graphql/posts';
import CopyIcon from '../icons/Copy';
import { TextField } from '../fields/TextField';
import { useCopyLink } from '../../hooks/useCopyLink';
import ForwardIcon from '../icons/Forward';
import {
  getEmailShareLink,
  getFacebookShareLink,
  getLinkedInShareLink,
  getRedditShareLink,
  getTelegramShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../../lib/share';

type SharePostModalProps = {
  post: Post;
} & ModalProps;

const SocialShareIcon = ({
  href,
  icon,
  className,
  label,
}: {
  href: string;
  icon: React.ReactElement;
  className: string;
  label: string;
}) => {
  return (
    <div className="flex flex-col items-center mr-4 mb-4">
      <Button
        tag="a"
        buttonSize="large"
        href={href}
        target="_blank"
        rel="noopener"
        className={classNames(className, 'mb-2')}
        iconOnly
        icon={icon}
      />
      <span className="typo-caption2 text-theme-label-tertiary">{label}</span>
    </div>
  );
};

export default function SharePostModal({
  post,
  ...props
}: SharePostModalProps): ReactElement {
  const [, copyUrl] = useCopyLink(() => post?.commentsPermalink);

  return (
    <ResponsiveModal padding={false} {...props}>
      <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 flex-row justify-between items-center px-6 w-full h-14 border-b border-theme-divider-tertiary bg-theme-bg-tertiary">
        <h3 className="font-bold typo-title3">Share article</h3>
        <Button
          className="btn-tertiary"
          buttonSize="small"
          title="Close"
          icon={<XIcon />}
          onClick={props.onRequestClose}
        />
      </header>
      <PostItemCard
        className="mt-4 mb-2"
        postItem={{ post }}
        showButtons={false}
        clickable={false}
      />
      <section className="px-6">
        <p className="py-2.5 font-bold typo-callout">Copy article link</p>
        <TextField
          className="mt-2 mb-6"
          name="rssUrl"
          inputId="rssUrl"
          label="Your unique RSS URL"
          type="url"
          fieldType="tertiary"
          actionIcon={<CopyIcon />}
          onActionIconClick={copyUrl}
          value={post?.commentsPermalink}
          readOnly
        />
        <p className="py-2.5 font-bold typo-callout">Share article via</p>
        <section className="flex flex-wrap py-2 mb-2">
          <SocialShareIcon
            href={getWhatsappShareLink(post?.commentsPermalink)}
            icon={<ForwardIcon />}
            className="bg-theme-bg-whatsapp"
            label="Whatsapp"
          />
          <SocialShareIcon
            href={getTwitterShareLink(post?.commentsPermalink, post?.title)}
            icon={<ForwardIcon />}
            className="bg-theme-bg-twitter"
            label="Twitter"
          />
          <SocialShareIcon
            href={getRedditShareLink(post?.commentsPermalink, post?.title)}
            icon={<ForwardIcon />}
            className="bg-theme-bg-reddit"
            label="Reddit"
          />
          <SocialShareIcon
            href={getFacebookShareLink(post?.commentsPermalink)}
            icon={<ForwardIcon />}
            className="bg-theme-bg-facebook"
            label="Facebook"
          />
          <SocialShareIcon
            href={getLinkedInShareLink(post?.commentsPermalink)}
            icon={<ForwardIcon />}
            className="bg-theme-bg-linkedin"
            label="LinkedIn"
          />
          <SocialShareIcon
            href={getTelegramShareLink(post?.commentsPermalink, post?.title)}
            icon={<ForwardIcon />}
            className="bg-theme-bg-telegram"
            label="Telegram"
          />
          <SocialShareIcon
            href={getEmailShareLink(
              post?.commentsPermalink,
              'I found this amazing article',
            )}
            icon={<ForwardIcon />}
            className="bg-theme-bg-email"
            label="Email"
          />
        </section>
      </section>
    </ResponsiveModal>
  );
}
