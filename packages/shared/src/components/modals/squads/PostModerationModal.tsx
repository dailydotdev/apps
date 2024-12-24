import type { ReactElement } from 'react';
import React from 'react';
import Link from 'next/link';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { SourcePostModeration } from '../../../graphql/squads';
import { verifyPermission } from '../../../graphql/squads';
import { SquadModerationActions } from '../../squads/moderation/SquadModerationActions';
import PostSourceInfo from '../../post/PostSourceInfo';
import SquadPostAuthor from '../../post/SquadPostAuthor';
import { CommonSharePostContent } from '../../post/SharePostContent';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import { Origin } from '../../../lib/log';
import { useReadArticle } from '../../../hooks/usePostContent';
import { SharePostTitle } from '../../post/share';
import Markdown from '../../Markdown';
import { MarkdownPostImage } from '../../post/MarkdownPostContent';
import { ModalClose } from '../common/ModalClose';
import { SquadModerationItemContextMenu } from '../../squads/moderation/SquadModerationItemContextMenu';
import { useSourceModerationList } from '../../../hooks/squads/useSourceModerationList';
import { ProfileImageSize } from '../../ProfilePicture';
import ConditionalWrapper from '../../ConditionalWrapper';
import { anchorDefaultRel } from '../../../lib/strings';

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
    source,
    externalLink,
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
      className="tablet:max-h-[calc(100vh-5rem)]"
    >
      <Modal.Body className="gap-6 !p-6">
        {isModerator && (
          <SquadModerationActions
            onReject={() => onReject([id], source.id)}
            onApprove={() => onApprove([id], source.id)}
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
            <SquadModerationItemContextMenu id={id} onDelete={onDeleteClick} />
          )}
          <ModalClose
            className="!flex"
            onClick={modalProps.onRequestClose}
            position="relative"
            right="0"
          />
        </div>
        <PostSourceInfo source={squad} size={ProfileImageSize.Small} />
        <SquadPostAuthor author={createdBy} date={createdAt} />
        <SharePostTitle
          title={title || editPost?.title}
          titleHtml={titleHtml || editPost?.titleHtml}
        />
        {!sharedPost && (image || editPost?.image) && (
          <ConditionalWrapper
            condition={!!externalLink}
            wrapper={(component) => (
              <Link href={externalLink} target="_blank" rel={anchorDefaultRel}>
                {component}
              </Link>
            )}
          >
            <MarkdownPostImage imgSrc={image || editPost?.image} />
          </ConditionalWrapper>
        )}
        {!!contentHtml?.length && (
          <Markdown className="!mt-0" content={contentHtml} />
        )}
        {!contentHtml?.length && !!content?.length && (
          <Typography type={TypographyType.Body}>{content}</Typography>
        )}
        {sharedPost && (
          <div className="-mt-8">
            <CommonSharePostContent
              source={squad}
              sharedPost={sharedPost}
              onReadArticle={onReadArticle}
            />
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default PostModerationModal;
