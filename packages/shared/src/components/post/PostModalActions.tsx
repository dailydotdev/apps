import React, {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  useContext,
  useState,
} from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import MenuIcon from '../../../icons/menu.svg';
import CloseIcon from '../../../icons/x.svg';
import OpenLinkIcon from '../../../icons/open_link.svg';
import { Roles } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { Post } from '../../graphql/posts';
import useNotification from '../../hooks/useNotification';
import useReportPostMenu from '../../hooks/useReportPostMenu';
import classed from '../../lib/classed';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { CardNotification } from '../cards/Card';
import { Button } from '../buttons/Button';
import PostOptionsMenu from '../PostOptionsMenu';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';

export interface PostModalActionsProps {
  post: Post;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  className?: string;
  style?: CSSProperties;
  inlineActions?: boolean;
  origin?: PostOrigin;
  notificactionClassName?: string;
}

const Container = classed('div', 'flex flex-row items-center');

const BanPostModal = dynamic(() => import('../modals/BanPostModal'));

const DeletePostModal = dynamic(() => import('../modals/DeletePostModal'));

export function PostModalActions({
  post,
  onClose,
  inlineActions,
  className,
  origin = 'article page',
  notificactionClassName,
  ...props
}: PostModalActionsProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user } = useContext(AuthContext);
  const { notification, onMessage } = useNotification();
  const { showReportMenu } = useReportPostMenu();
  const [showBanPost, setShowBanPost] = useState(false);
  const [showDeletePost, setShowDeletePost] = useState(false);

  const showPostOptionsContext = (e) => {
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    showReportMenu(e, {
      position: { x: right, y: bottom + 4 },
    });
  };

  const onReadArticle = () => {
    trackEvent(
      postAnalyticsEvent('go to link', post, {
        extra: { origin },
      }),
    );
  };

  if (notification) {
    return (
      <Container className={notificactionClassName}>
        <CardNotification className="flex-1 py-2.5 text-center">
          {notification}
        </CardNotification>
      </Container>
    );
  }

  const isModerator = user?.roles?.indexOf(Roles.Moderator) > -1;

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <Button
        className={inlineActions ? 'btn-tertiary' : 'btn-secondary'}
        tag="a"
        href={post.permalink}
        target="_blank"
        icon={<OpenLinkIcon />}
        onClick={onReadArticle}
      >
        {!inlineActions && 'Read article'}
      </Button>
      <SimpleTooltip placement="bottom" content="Options">
        <Button
          className={classNames('btn-tertiary', !inlineActions && 'ml-auto')}
          icon={<MenuIcon />}
          onClick={(event) => showPostOptionsContext(event)}
        />
      </SimpleTooltip>
      {onClose && (
        <SimpleTooltip placement="bottom" content="Close">
          <Button
            className="btn-tertiary"
            icon={<CloseIcon />}
            onClick={(e) => onClose(e)}
          />
        </SimpleTooltip>
      )}
      <PostOptionsMenu
        post={post}
        onMessage={onMessage}
        setShowBanPost={isModerator ? () => setShowBanPost(true) : null}
        setShowDeletePost={isModerator ? () => setShowDeletePost(true) : null}
      />
      {showBanPost && (
        <BanPostModal
          postId={post.id}
          isOpen={showBanPost}
          onRequestClose={() => setShowBanPost(false)}
        />
      )}
      {showDeletePost && (
        <DeletePostModal
          postId={post.id}
          isOpen={showDeletePost}
          onRequestClose={() => setShowDeletePost(false)}
        />
      )}
    </Container>
  );
}
