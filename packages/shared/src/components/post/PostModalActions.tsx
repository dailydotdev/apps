import React, {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  useContext,
} from 'react';
import classNames from 'classnames';
import MenuIcon from '../icons/Menu';
import CloseIcon from '../icons/MiniClose';
import OpenLinkIcon from '../icons/OpenLink';
import { Roles } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { banPost, Post } from '../../graphql/posts';
import useReportPostMenu from '../../hooks/useReportPostMenu';
import classed from '../../lib/classed';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Button } from '../buttons/Button';
import PostOptionsMenu, { PostOptionsMenuProps } from '../PostOptionsMenu';
import { ShareBookmarkProps } from './PostActions';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import SettingsContext from '../../contexts/SettingsContext';
import { SourcePermissions, SourceType } from '../../graphql/sources';

export interface PostModalActionsProps extends ShareBookmarkProps {
  post: Post;
  onReadArticle?: () => void;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  className?: string;
  style?: CSSProperties;
  inlineActions?: boolean;
  notificactionClassName?: string;
  contextMenuId: string;
  onRemovePost?: PostOptionsMenuProps['onRemovePost'];
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
  onRemovePost,
  ...props
}: PostModalActionsProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);
  const { user } = useContext(AuthContext);
  const { showReportMenu } = useReportPostMenu(contextMenuId);
  const { showPrompt } = usePrompt();

  const showPostOptionsContext = (e) => {
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    showReportMenu(e, {
      position: { x: right, y: bottom + 4 },
    });
  };

  const isModerator = user?.roles?.includes(Roles.Moderator);

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

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {onReadArticle && (
        <SimpleTooltip
          placement="bottom"
          content="Read post"
          disabled={!inlineActions}
        >
          <Button
            className={inlineActions ? 'btn-tertiary' : 'btn-secondary'}
            tag="a"
            href={post.sharedPost?.permalink ?? post.permalink}
            target={openNewTab ? '_blank' : '_self'}
            icon={<OpenLinkIcon />}
            onClick={onReadArticle}
          >
            {!inlineActions && 'Read post'}
          </Button>
        </SimpleTooltip>
      )}
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
        onRemovePost={onRemovePost}
        setShowBanPost={isModerator ? () => banPostPrompt() : null}
        contextId={contextMenuId}
      />
    </Container>
  );
}
