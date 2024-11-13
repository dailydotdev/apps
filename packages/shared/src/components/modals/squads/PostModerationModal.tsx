import React, { ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import {
  SourcePostModeration,
  verifyPermission,
} from '../../../graphql/squads';
import { SquadModerationActions } from '../../squads/moderation/SquadModerationActions';
import PostSourceInfo from '../../post/PostSourceInfo';
import SquadPostAuthor from '../../post/SquadPostAuthor';
import { CommonSharePostContent } from '../../post/SharePostContent';
import { SourcePermissions, Squad } from '../../../graphql/sources';
import { Origin } from '../../../lib/log';
import { useReadArticle } from '../../../hooks/usePostContent';
import { SharePostTitle } from '../../post/share';
import Markdown from '../../Markdown';
import { MarkdownPostImage } from '../../post/MarkdownPostContent';
import { ModalClose } from '../common/ModalClose';
import { SquadModerationItemContextMenu } from '../../squads/moderation/SquadModerationItemContextMenu';
import { useSourceModerationList } from '../../../hooks/squads/useSourceModerationList';

type ActionHandler = (ids: string[], sourceId: string) => void;

interface PostModerationModalProps extends ModalProps {
  onApprove: ActionHandler;
  onReject: ActionHandler;
  data: SourcePostModeration;
  squad: Squad;
}

function PostModerationModal({
  onApprove,
  onReject,
  data,
  squad,
  ...modalProps
}: PostModerationModalProps): ReactElement {
  const {
    id,
    post: editPost,
    createdAt,
    createdBy,
    image,
    title,
    titleHtml,
    content,
    contentHtml,
    sharedPost,
    sourceId,
  } = data;
  const onReadArticle = useReadArticle({
    origin: Origin.ArticleModal,
    post: sharedPost,
  });
  const isModerator = verifyPermission(squad, SourcePermissions.ModeratePost);
  const { onDelete } = useSourceModerationList({ squad });
  const onDeleteClick = (postId: string) =>
    onDelete(postId).then(() => modalProps.onRequestClose(null));

  return (
    <Modal
      {...modalProps}
      size={Modal.Size.Large}
      kind={Modal.Kind.FlexibleTop}
    >
      <Modal.Body className="gap-6">
        {isModerator && (
          <SquadModerationActions
            onReject={() => onReject([id], sourceId)}
            onApprove={() => onApprove([id], sourceId)}
          />
        )}
        <div className="flex flex-row items-center justify-between">
          <Typography
            bold
            className="flex-1"
            tag={TypographyTag.H3}
            truncate
            type={TypographyType.Title3}
          >
            Post preview
          </Typography>
          {!isModerator && (
            <div className="mr-4">
              <SquadModerationItemContextMenu
                id={id}
                onDelete={onDeleteClick}
              />
            </div>
          )}
          <ModalClose onClick={modalProps.onRequestClose} />
        </div>
        <PostSourceInfo source={squad} />
        <SquadPostAuthor author={createdBy} date={createdAt} />
        <SharePostTitle
          title={title || editPost?.title}
          titleHtml={titleHtml || editPost?.titleHtml}
        />
        {!sharedPost && (image || editPost?.image) && (
          <MarkdownPostImage imgSrc={image || editPost?.image} />
        )}
        {contentHtml ? (
          <Markdown content={contentHtml} />
        ) : (
          <Typography type={TypographyType.Body}>{content}</Typography>
        )}
        {sharedPost && (
          <CommonSharePostContent
            mainSource={squad}
            sharedPost={sharedPost}
            onReadArticle={onReadArticle}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default PostModerationModal;
