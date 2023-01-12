import React, {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  useContext,
} from 'react';
import classNames from 'classnames';
import MenuIcon from '../icons/Menu';
import CloseIcon from '../icons/Close';
import OpenLinkIcon from '../icons/OpenLink';
import { Roles } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { Post, banPost, deletePost } from '../../graphql/posts';
import useReportPostMenu from '../../hooks/useReportPostMenu';
import classed from '../../lib/classed';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Button } from '../buttons/Button';
import PostOptionsMenu from '../PostOptionsMenu';
import { OnShareOrBookmarkProps } from './PostActions';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';

export interface PostModalActionsProps extends OnShareOrBookmarkProps {
  post: Post;
  onReadArticle?: () => void;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  className?: string;
  style?: CSSProperties;
  inlineActions?: boolean;
  notificactionClassName?: string;
  contextMenuId: string;
}

const Container = classed('div', 'flex flex-row items-center');

export function PostModalActions({
  onReadArticle,
  onShare,
  onBookmark,
  post,
  onClose,
  inlineActions,
  className,
  notificactionClassName,
  contextMenuId,
  ...props
}: PostModalActionsProps): ReactElement {
  const { user } = useContext(AuthContext);
  const { showReportMenu } = useReportPostMenu(contextMenuId);
  const { showPrompt } = usePrompt();

  const showPostOptionsContext = (e) => {
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    showReportMenu(e, {
      position: { x: right, y: bottom + 4 },
    });
  };

  const isModerator = user?.roles?.indexOf(Roles.Moderator) > -1;

  const banPostPrompt = async () => {
    const options: PromptOptions = {
      title: 'Ban post 💩',
      description: 'Are you sure you want to ban this post?',
      okButton: {
        title: 'Ban',
        className: 'btn-primary-ketchup',
      },
    };
    if (await showPrompt(options)) {
      await banPost(post.id);
    }
  };

  const deletePostPrompt = async () => {
    const options: PromptOptions = {
      title: 'Delete post 🚫',
      description:
        'Are you sure you want to delete this post? This action cannot be undone.',
      okButton: {
        title: 'Delete',
        className: 'btn-primary-ketchup',
      },
    };
    if (await showPrompt(options)) {
      await deletePost(post.id);
    }
  };

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <SimpleTooltip
        placement="bottom"
        content="Read article"
        disabled={!inlineActions}
      >
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
      </SimpleTooltip>
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
        onBookmark={onBookmark}
        onShare={onShare}
        post={post}
        setShowBanPost={isModerator ? () => banPostPrompt() : null}
        setShowDeletePost={isModerator ? () => deletePostPrompt() : null}
        contextId={contextMenuId}
      />
    </Container>
  );
}
