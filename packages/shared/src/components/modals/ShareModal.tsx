import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSwipeable } from 'react-swipeable';
import { Post } from '../../graphql/posts';
import { SocialShare } from '../widgets/SocialShare';
import { Origin } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { FeedItemPosition, postAnalyticsEvent } from '../../lib/feed';
import { SocialShareType } from '../../lib/share';
import { Comment, getCommentHash } from '../../graphql/comments';
import { Modal, ModalProps } from './common/Modal';
import { ExperimentWinner } from '../../lib/featureValues';
import useMedia from '../../hooks/useMedia';
import { tablet } from '../../styles/media';
import MarkdownInput, { MarkdownRef } from '../fields/MarkdownInput';
import { WriteLinkPreview, WriteLinkPreviewGutterSize } from '../post/write';

type ShareModalProps = {
  post: Post;
  comment?: Comment;
  origin: Origin;
} & FeedItemPosition &
  ModalProps;

export default function ShareModal({
  post,
  comment,
  origin,
  columns,
  column,
  row,
  onRequestClose,
  ...props
}: ShareModalProps): ReactElement {
  const isComment = !!comment;
  const link = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
  const { trackEvent } = useContext(AnalyticsContext);
  const [commentary, setCommentary] = useState<string>('');
  const isMobile = !useMedia([tablet.replace('@media ', '')], [true], false);
  const markdownRef = useRef<MarkdownRef>();

  const baseTrackingEvent = (
    eventName: string,
    extra?: Record<string, unknown>,
  ) =>
    trackEvent(
      postAnalyticsEvent(eventName, post, {
        extra: {
          ...extra,
          origin,
          variant: ExperimentWinner.PostCardShareVersion,
          ...(comment && { commentId: comment.id }),
        },
      }),
    );

  useEffect(() => {
    baseTrackingEvent('open share');

    return () => baseTrackingEvent('close share');
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSwipedDown = (e) => {
    const { scrollTop } = e.event.currentTarget;

    if (scrollTop === 0) {
      onRequestClose(e);
    }
  };

  const handlers = useSwipeable({ onSwipedDown });

  return (
    <Modal
      size={Modal.Size.Small}
      kind={isMobile ? Modal.Kind.FixedBottom : Modal.Kind.FlexibleCenter}
      onRequestClose={onRequestClose}
      {...props}
    >
      <Modal.Header title={isComment ? 'Share comment' : 'Share post'} />
      <Modal.Body {...handlers}>
        <MarkdownInput
          className="mb-4"
          ref={markdownRef}
          showUserAvatar
          textareaProps={{ rows: 5, name: 'commentary' }}
          allowPreview={false}
          enabledCommand={{ mention: true }}
          onValueUpdate={(value) => setCommentary(value)}
          footer={
            <WriteLinkPreview
              className="flex-col-reverse m-3 !w-auto"
              preview={post}
              link={link}
              showOpenLink={false}
              showPreviewLink={false}
              sourceInfoFormat="avatar"
              gutterSize={WriteLinkPreviewGutterSize.Small}
            />
          }
        />

        <SocialShare
          type={SocialShareType.Squad}
          post={post}
          comment={comment}
          origin={origin}
          columns={columns}
          column={column}
          row={row}
          onSquadShare={() => onRequestClose(null)}
          commentary={commentary}
        />
        <SocialShare
          type={SocialShareType.External}
          post={post}
          comment={comment}
          origin={origin}
          columns={columns}
          column={column}
          row={row}
          onSquadShare={() => onRequestClose(null)}
        />
      </Modal.Body>
    </Modal>
  );
}
