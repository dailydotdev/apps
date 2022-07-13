import React, { ReactElement, useContext, useEffect } from 'react';
import { ModalProps } from './StyledModal';
import { Button } from '../buttons/Button';
import XIcon from '../icons/Close';
import { ResponsiveModal } from './ResponsiveModal';
import PostItemCard from '../post/PostItemCard';
import { Post } from '../../graphql/posts';
import CopyIcon from '../icons/Copy';
import { TextField } from '../fields/TextField';
import { useCopyLink } from '../../hooks/useCopyLink';
import { SocialShare } from '../widgets/SocialShare';
import { Origin } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { FeedItemPosition, postAnalyticsEvent } from '../../lib/feed';
import { ShareProvider } from '../../lib/share';

type SharePostModalProps = {
  post: Post;
  origin: Origin;
} & FeedItemPosition &
  ModalProps;

export default function SharePostModal({
  post,
  origin,
  columns,
  column,
  row,
  ...props
}: SharePostModalProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [, copyUrl] = useCopyLink(() => post?.commentsPermalink);

  const trackAndCopyLink = () => {
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider: ShareProvider.CopyLink, origin },
      }),
    );
    copyUrl();
  };

  useEffect(() => {
    trackEvent(
      postAnalyticsEvent('open share', post, {
        columns,
        column,
        row,
        extra: { origin },
      }),
    );

    return () => {
      trackEvent(
        postAnalyticsEvent('close share', post, {
          columns,
          column,
          row,
          extra: { origin },
        }),
      );
    };
  }, []);

  return (
    <ResponsiveModal
      padding={false}
      {...props}
      contentClassName="!max-w-[26.25rem]"
    >
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
          name="postUrl"
          inputId="postUrl"
          label="Copy post URL"
          type="url"
          fieldType="tertiary"
          actionIcon={<CopyIcon />}
          onActionIconClick={trackAndCopyLink}
          value={post?.commentsPermalink}
          readOnly
        />
        <p className="py-2.5 font-bold typo-callout">Share article via</p>
        <SocialShare
          post={post}
          origin={origin}
          columns={columns}
          column={column}
          row={row}
        />
      </section>
    </ResponsiveModal>
  );
}
