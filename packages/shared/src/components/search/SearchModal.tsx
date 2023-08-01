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
import { Comment, getCommentHash } from '../../graphql/comments';
// import { Modal, ModalProps } from '../common/Modal';
import { ExperimentWinner } from '../../lib/featureValues';
import useMedia from '../../hooks/useMedia';
import { tablet } from '../../styles/media';
import MarkdownInput, { MarkdownRef } from '../fields/MarkdownInput';
import { WriteLinkPreview } from '../post/write';
import { Modal, ModalProps } from '../modals/common/Modal';

type SearchModalProps = {
  post?: Post;
  comment?: Comment;
  origin?: Origin;
} & FeedItemPosition &
  ModalProps;

export default function SearchModal({
  post,
  comment,
  origin,
  columns,
  column,
  row,
  onRequestClose,
  ...props
}: SearchModalProps): ReactElement {
  const isComment = !!comment;
  const link = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
  const { trackEvent } = useContext(AnalyticsContext);
  const [commentary, setCommentary] = useState('');
  const isMobile = !useMedia([tablet.replace('@media ', '')], [true], false);
  const markdownRef = useRef<MarkdownRef>();

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
      kind={Modal.Kind.FixedBottom}
      onRequestClose={onRequestClose}
      {...props}
      className="overflow-hidden"
    >
      <Modal.Header title="Title" />
      <Modal.Body {...handlers}>
        <p>Hi tom</p>
      </Modal.Body>
    </Modal>
  );
}
