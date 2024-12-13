import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  useCallback,
  useContext,
} from 'react';
import { MenuIcon, MiniCloseIcon as CloseIcon } from '../icons';
import { Roles } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import {
  banPost,
  clickbaitPost,
  demotePost,
  Post,
  promotePost,
} from '../../graphql/posts';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import PostOptionsMenu, { PostOptionsMenuProps } from '../PostOptionsMenu';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { Origin } from '../../lib/log';
import useContextMenu from '../../hooks/useContextMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

export interface PostMenuOptionsProps {
  post: Post;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  inlineActions?: boolean;
  contextMenuId: string;
  onRemovePost?: PostOptionsMenuProps['onRemovePost'];
  origin: Origin;
  isEnlarged?: boolean;
}

export function PostMenuOptions({
  post,
  onClose,
  inlineActions,
  contextMenuId,
  onRemovePost,
  origin,
  isEnlarged,
}: PostMenuOptionsProps): ReactElement {
  const { user } = useContext(AuthContext);
  const { showPrompt } = usePrompt();
  const { onMenuClick, onHide } = useContextMenu({ id: contextMenuId });
  const isModerator = user?.roles?.includes(Roles.Moderator);

  const banPostPrompt = useCallback(async () => {
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
  }, [post.id, showPrompt]);

  const promotePostPrompt = useCallback(async () => {
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
  }, [post.flags?.promoteToPublic, post.id, showPrompt]);

  const clickbaitPostPrompt = useCallback(async () => {
    const isClickbait = post.clickbaitTitleDetected;

    const options: PromptOptions = {
      title: isClickbait ? 'Remove clickbait' : 'Mark as clickbait',
      description: `Do you want to ${
        isClickbait ? 'remove' : 'mark'
      } this post as clickbait?`,
      okButton: {
        title: isClickbait ? 'Remove' : 'Mark',
      },
    };

    if (await showPrompt(options)) {
      await clickbaitPost(post.id);
    }
  }, [post.clickbaitTitleDetected, post.id, showPrompt]);

  return (
    <>
      <SimpleTooltip placement="bottom" content="Options">
        <Button
          className={!inlineActions && 'ml-auto'}
          icon={<MenuIcon />}
          onClick={onMenuClick}
          size={isEnlarged ? ButtonSize.Medium : ButtonSize.Small}
          variant={isEnlarged ? ButtonVariant.Tertiary : ButtonVariant.Float}
        />
      </SimpleTooltip>
      {onClose && (
        <SimpleTooltip placement="bottom" content="Close">
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<CloseIcon />}
            onClick={(e) => onClose(e)}
          />
        </SimpleTooltip>
      )}
      <PostOptionsMenu
        post={post}
        onRemovePost={onRemovePost}
        setShowBanPost={isModerator ? () => banPostPrompt() : null}
        setShowPromotePost={isModerator ? () => promotePostPrompt() : null}
        setShowClickbaitPost={isModerator ? () => clickbaitPostPrompt() : null}
        contextId={contextMenuId}
        origin={origin}
        onHidden={onHide}
      />
    </>
  );
}
