import React, { ReactElement } from 'react';
import { ModalProps } from './StyledModal';
import { Button } from '../buttons/Button';
import XIcon from '../icons/Close';
import { ResponsiveModal } from './ResponsiveModal';
import PostItemCard from '../post/PostItemCard';
import { Post } from '../../graphql/posts';
import CopyIcon from '../icons/Copy';
import { TextField } from '../fields/TextField';
import { useCopyLink } from '../../hooks/useCopyLink';

type SharePostModalProps = {
  post: Post;
} & ModalProps;

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
      </section>
    </ResponsiveModal>
  );
}
