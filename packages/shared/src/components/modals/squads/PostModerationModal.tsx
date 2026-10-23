import type { ReactElement } from 'react';
import React from 'react';
import Link from '../../utilities/Link';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { Typography, TypographyType } from '../../typography/Typography';
import type { SourcePostModeration } from '../../../graphql/squads';
import { SquadModerationActions } from '../../squads/moderation/SquadModerationActions';
import { CommonSharePostContent } from '../../post/SharePostContent';
import { Origin } from '../../../lib/log';
import { useReadArticle } from '../../../hooks/usePostContent';
import { SharePostTitle } from '../../post/share';
import Markdown from '../../Markdown';
import { MarkdownPostImage } from '../../post/MarkdownPostContent';
import { SquadModerationItemContextMenu } from '../../squads/moderation/SquadModerationItemContextMenu';
import { SquadModerationAuthorMenu } from '../../squads/moderation/SquadModerationAuthorMenu';
import {
  SquadModerationAuthor,
  SquadModerationSignals,
} from '../../squads/moderation/SquadModerationAuthor';
import { LinkPreview } from '../../squads/moderation/SquadModerationContent';
import { useSourceModerationList } from '../../../hooks/squads/useSourceModerationList';
import { useLazyModal } from '../../../hooks/useLazyModal';
import ConditionalWrapper from '../../ConditionalWrapper';
import { anchorDefaultRel } from '../../../lib/strings';
import { getDomainFromUrl } from '../../../lib/links';
import { PostType } from '../../../types';
import { PollOptionButtons } from '../../cards/poll/PollOptions';

interface PostModerationModalProps extends ModalProps {
  data: SourcePostModeration;
  isModerator: boolean;
  /** Names the post's squad, on the queue of every squad. */
  showSource?: boolean;
}

const SharedPostContent = ({
  sharedPost,
  source,
}: Required<Pick<SourcePostModeration, 'sharedPost' | 'source'>>) => {
  const onReadArticle = useReadArticle({
    origin: Origin.ArticleModal,
    post: sharedPost,
  });

  return (
    <div className="-mt-8">
      <CommonSharePostContent
        source={source}
        sharedPost={sharedPost}
        onReadArticle={onReadArticle}
      />
    </div>
  );
};

function PostModerationModal({
  data,
  isModerator,
  showSource = false,
  ...modalProps
}: PostModerationModalProps): ReactElement {
  const {
    id,
    post: editPost,
    image,
    title,
    titleHtml,
    content,
    contentHtml,
    sharedPost,
    source,
    externalLink,
    pollOptions,
    type,
  } = data;
  const { closeModal: onClose } = useLazyModal();
  const moderation = useSourceModerationList();
  // A link new to daily.dev keeps its own title and image; the commentary is
  // the content.
  const newLink =
    type === PostType.Share && !sharedPost ? externalLink : undefined;
  const postImage = image || editPost?.image;
  const body = (
    <>
      {!!contentHtml?.length && (
        <Markdown className="!mt-0" content={contentHtml} />
      )}
      {!contentHtml?.length && !!content?.length && (
        <Typography type={TypographyType.Body}>{content}</Typography>
      )}
    </>
  );

  return (
    <Modal
      {...modalProps}
      size={Modal.Size.Large}
      kind={Modal.Kind.FlexibleTop}
      className="tablet:max-h-[calc(100vh-5rem)]"
    >
      <Modal.Header title={isModerator ? 'Review post' : 'Post preview'} />
      <Modal.Body className="gap-5 !p-4 tablet:!p-6">
        <div className="flex items-center gap-2">
          <SquadModerationAuthor data={data} className="flex-1" />
          {isModerator ? (
            <SquadModerationAuthorMenu
              data={data}
              onReject={moderation.onReject}
              onMute={(item) => moderation.onMute(item).then(onClose)}
              onBlock={(item) => moderation.onBlock(item).then(onClose)}
            />
          ) : (
            <SquadModerationItemContextMenu
              id={id}
              onDelete={(postId) => moderation.onDelete(postId).then(onClose)}
              canEdit={type !== PostType.Poll}
            />
          )}
        </div>
        {isModerator && (
          <SquadModerationSignals data={data} showSource={showSource} />
        )}
        {newLink ? (
          <>
            {body}
            <Link href={newLink}>
              <a href={newLink} target="_blank" rel={anchorDefaultRel}>
                <LinkPreview
                  title={title}
                  image={image}
                  domain={getDomainFromUrl(newLink)}
                />
              </a>
            </Link>
          </>
        ) : (
          <>
            <SharePostTitle
              title={title || editPost?.title}
              titleHtml={titleHtml || editPost?.titleHtml}
            />
            {!sharedPost && postImage && (
              <ConditionalWrapper
                condition={!!externalLink}
                wrapper={(component) => (
                  <Link href={externalLink ?? ''}>
                    <a target="_blank" rel={anchorDefaultRel}>
                      {component}
                    </a>
                  </Link>
                )}
              >
                <MarkdownPostImage imgSrc={postImage} />
              </ConditionalWrapper>
            )}
            {!!pollOptions && (
              <div className="flex flex-col gap-2">
                <PollOptionButtons options={pollOptions} />
              </div>
            )}
            {body}
          </>
        )}
        {sharedPost && source && (
          <SharedPostContent sharedPost={sharedPost} source={source} />
        )}
      </Modal.Body>
      {isModerator && (
        <Modal.Footer>
          <SquadModerationActions
            className="w-full tablet:w-auto"
            isLoading={moderation.isPending}
            onReject={() => moderation.onReject([data])}
            onApprove={() => moderation.onApprove([data]).then(onClose)}
          />
        </Modal.Footer>
      )}
    </Modal>
  );
}

export default PostModerationModal;
