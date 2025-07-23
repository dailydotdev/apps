import React from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCanAwardUser } from '../../hooks/useCoresFeature';
import { useLazyModal } from '../../hooks/useLazyModal';
import { ButtonColor, ButtonSize, ButtonVariant } from '../buttons/Button';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import { IconSize, iconSizeToClassName } from '../Icon';
import { MedalBadgeIcon } from '../icons';
import InteractionCounter from '../InteractionCounter';
import { Tooltip } from '../tooltip/Tooltip';
import type { Post } from '../../graphql/posts';
import { Image } from '../image/Image';
import { AuthTriggers } from '../../lib/auth';
import { LazyModal } from '../modals/common/types';
import type { LoggedUser } from '../../lib/user';

export interface PostAwardActionProps {
  post: Post;
  iconSize?: IconSize;
}

const PostAwardAction = ({ post, iconSize }: PostAwardActionProps) => {
  const { openModal } = useLazyModal();
  const { user, showLogin } = useAuthContext();
  const isSameUser = user?.id === post?.author?.id;
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: post?.author as LoggedUser,
  });

  if (!canAward && !isSameUser) {
    return null;
  }
  const awardEntity = {
    id: post.id,
    receiver: post.author,
    numAwards: post.numAwards,
  };

  const openAwardModal = () => {
    if (!user) {
      return showLogin({ trigger: AuthTriggers.GiveAward });
    }

    if (isSameUser || post.userState?.awarded) {
      return openModal({
        type: LazyModal.ListAwards,
        props: {
          queryProps: { id: post.id, type: 'POST' },
        },
      });
    }

    return openModal({
      type: LazyModal.GiveAward,
      props: {
        type: 'POST',
        entity: awardEntity,
        post,
      },
    });
  };

  return (
    <Tooltip
      content={
        post.userState?.awarded
          ? 'You already awarded this post!'
          : 'Award this post'
      }
    >
      <QuaternaryButton
        id={`post-${post.id}-award-btn`}
        pressed={!!post.userState?.awarded}
        onClick={openAwardModal}
        size={ButtonSize.Small}
        className="btn-tertiary-cabbage pointer-events-auto"
        variant={ButtonVariant.Tertiary}
        labelClassName="!pl-[1px]"
        color={ButtonColor.Cabbage}
        icon={
          post.featuredAward?.award?.image ? (
            <Image
              src={post?.featuredAward?.award?.image}
              alt={post?.featuredAward?.award?.name}
              className={iconSizeToClassName[IconSize.XSmall]}
            />
          ) : (
            <MedalBadgeIcon secondary size={iconSize} />
          )
        }
      >
        {post?.numAwards > 0 && (
          <InteractionCounter
            className={classNames(
              'tabular-nums !typo-footnote',
              !post.numAwards && 'invisible',
            )}
            value={post.numAwards}
          />
        )}
      </QuaternaryButton>
    </Tooltip>
  );
};

export default PostAwardAction;
