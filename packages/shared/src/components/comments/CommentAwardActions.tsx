import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  useCanAwardUser,
  useHasAccessToCores,
} from '../../hooks/useCoresFeature';
import type { LoggedUser } from '../../lib/user';
import { getCompanionWrapper } from '../../lib/extension';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { AwardButton } from '../award/AwardButton';
import type { Comment } from '../../graphql/comments';
import type { Post } from '../../graphql/posts';
import { ClickableText } from '../buttons/ClickableText';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { largeNumberFormat } from '../../lib/numberFormat';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { MedalBadgeIcon } from '../icons';
import { IconSize } from '../Icon';

export type CommentAwardActionsProps = {
  comment: Comment;
  post?: Post;
};

export const CommentAwardActions = ({
  comment,
  post,
}: CommentAwardActionsProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { isCompanion } = useRequestProtocol();
  const appendTo = isCompanion ? getCompanionWrapper : 'parent';
  const { user } = useAuthContext();
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: comment.author as LoggedUser,
  });
  const hasAccessToCores = useHasAccessToCores();

  const awardEntity = {
    id: comment.id,
    receiver: comment.author,
    numAwards: comment.numAwards,
  };

  if (!hasAccessToCores) {
    return null;
  }

  // no awards yet, so we show award medal icon
  if (!comment.numAwards) {
    if (canAward) {
      return (
        <AwardButton
          appendTo={appendTo}
          type="COMMENT"
          entity={awardEntity}
          pressed={!!comment.userState?.awarded}
          post={post}
          className="mr-3"
        />
      );
    }

    // if user can not award we don't show anything
    return null;
  }

  // if comment has awards, we show the number of awards
  return (
    <ClickableText
      onClick={() => {
        // if user can award and not awarded yet, we open the give award modal
        // user can see list of awards from give award modal
        if (canAward && !comment.userState?.awarded) {
          openModal({
            type: LazyModal.GiveAward,
            props: {
              type: 'COMMENT',
              entity: awardEntity,
              post,
            },
          });

          return;
        }

        // if user can not award, we open the list awards modal
        openModal({
          type: LazyModal.ListAwards,
          props: {
            queryProps: {
              id: comment.id,
              type: 'COMMENT',
            },
          },
        });
      }}
    >
      {!!comment.featuredAward?.award && (
        <Image
          src={comment.featuredAward.award.image}
          alt={comment.featuredAward.award.name}
          className="size-6"
        />
      )}
      {!comment.featuredAward?.award && (
        <MedalBadgeIcon size={IconSize.Small} secondary />
      )}
      <Typography
        className="ml-1 mr-3 flex items-center gap-1"
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        bold
      >
        {largeNumberFormat(comment.numAwards)}
        <span className="hidden tablet:block">
          Award
          {comment.numAwards > 1 ? 's' : ''}
        </span>
      </Typography>
    </ClickableText>
  );
};
