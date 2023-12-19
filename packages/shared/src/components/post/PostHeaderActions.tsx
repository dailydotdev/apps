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
import {
  banPost,
  demotePost,
  getReadPostButtonText,
  isInternalReadType,
  Post,
  promotePost,
} from '../../graphql/posts';
import classed from '../../lib/classed';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Button } from '../buttons/Button';
import PostOptionsMenu, { PostOptionsMenuProps } from '../PostOptionsMenu';
import { ShareBookmarkProps } from './PostActions';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import SettingsContext from '../../contexts/SettingsContext';
import { Origin } from '../../lib/analytics';
import useContextMenu from '../../hooks/useContextMenu';

export interface PostHeaderActionsProps extends ShareBookmarkProps {
  post: Post;
  onReadArticle?: () => void;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  className?: string;
  style?: CSSProperties;
  inlineActions?: boolean;
  notificationClassName?: string;
  contextMenuId: string;
  onRemovePost?: PostOptionsMenuProps['onRemovePost'];
}

const Container = classed('div', 'flex flex-row items-center');

export function PostHeaderActions({
  onReadArticle,
  onShare,
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  contextMenuId,
  onRemovePost,
  ...props
}: PostHeaderActionsProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);
  const { user } = useContext(AuthContext);
  const { showPrompt } = usePrompt();
  const { onMenuClick, isOpen } = useContextMenu({ id: contextMenuId });

  const isModerator = user?.roles?.includes(Roles.Moderator);
  const readButtonText = getReadPostButtonText(post);

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

  const promotePostPrompt = async () => {
    const promoteFlag = post.flags?.promoteToPublic;

    const options: PromptOptions = {
      title: promoteFlag ? 'Demote post' : 'Promote post',
      description: `Do you want to ${
        promoteFlag ? 'demote' : 'promote'
      } this post ${promoteFlag ? 'from' : 'to'} the public?`,
      okButton: {
        title: promoteFlag ? 'Demote' : 'Promote',
      },
    };
    if (await showPrompt(options)) {
      if (promoteFlag) {
        await demotePost(post.id);
      } else {
        await promotePost(post.id);
      }
    }
  };

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {!isInternalReadType(post) && onReadArticle && (
        <SimpleTooltip
          placement="bottom"
          content={readButtonText}
          disabled={!inlineActions}
        >
          <Button
            className={inlineActions ? 'btn-tertiary' : 'btn-secondary'}
            tag="a"
            href={post.sharedPost?.permalink ?? post.permalink}
            target={openNewTab ? '_blank' : '_self'}
            icon={<OpenLinkIcon />}
            onClick={onReadArticle}
            data-testid="postActionsRead"
          >
            {!inlineActions && readButtonText}
          </Button>
        </SimpleTooltip>
      )}
      <SimpleTooltip placement="bottom" content="Options">
        <Button
          className={classNames('btn-tertiary', !inlineActions && 'ml-auto')}
          icon={<MenuIcon />}
          onClick={onMenuClick}
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
        onShare={onShare}
        post={post}
        onRemovePost={onRemovePost}
        setShowBanPost={isModerator ? () => banPostPrompt() : null}
        setShowPromotePost={isModerator ? () => promotePostPrompt() : null}
        contextId={contextMenuId}
        origin={Origin.ArticleModal}
        isOpen={isOpen}
      />
    </Container>
  );
}
