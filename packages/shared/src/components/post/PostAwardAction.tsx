import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCanAwardUser } from '../../hooks/useCoresFeature';
import { useLazyModal } from '../../hooks/useLazyModal';
import { ButtonColor } from '../buttons/ButtonV2';
import type { CardActionDensity } from '../buttons/CardAction';
import { CardAction } from '../buttons/CardAction';
import { IconSize, iconSizeToClassName } from '../Icon';
import { MedalBadgeIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import type { Post } from '../../graphql/posts';
import { Image } from '../image/Image';
import { AuthTriggers } from '../../lib/auth';
import { LazyModal } from '../modals/common/types';
import type { LoggedUser } from '../../lib/user';

export interface PostAwardActionProps {
  post: Post;
  /**
   * Density passes through to `CardAction`. Default `compact` matches
   * the feed-grid card width contract; overridable for surfaces where
   * the bar is the comfortable 40 px row.
   */
  density?: CardActionDensity;
  /**
   * Optional fixed icon size for the featured-award `Image` thumbnail.
   * Falls back to the density-derived default. Kept so feed cards can
   * lock the medal at the same dimension as sibling icons.
   */
  iconSize?: IconSize;
}

const PostAwardAction = ({
  post,
  density = 'compact',
  iconSize,
}: PostAwardActionProps) => {
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

  // Featured-award thumbnail uses an explicit fixed size override
  // (matches v1: 20 px square via `iconSizeToClassName[XSmall]`) so
  // the medal asset doesn't get rescaled by the CardAction icon
  // wrapper. Keeps parity with the previous QuaternaryButton behaviour.
  const renderedIcon =
    post.userState?.awarded && post.featuredAward?.award?.image ? (
      <Image
        src={post?.featuredAward?.award?.image}
        alt={post?.featuredAward?.award?.name}
        className={iconSizeToClassName[iconSize ?? IconSize.XSmall]}
      />
    ) : (
      <MedalBadgeIcon size={iconSize} />
    );

  return (
    <Tooltip
      content={
        post.userState?.awarded
          ? 'You already awarded this post!'
          : 'Award this post'
      }
    >
      <CardAction
        id={`post-${post.id}-award-btn`}
        pressed={!!post.userState?.awarded}
        onClick={openAwardModal}
        density={density}
        icon={renderedIcon}
        iconPressed={
          post.userState?.awarded && post.featuredAward?.award?.image ? (
            renderedIcon
          ) : (
            <MedalBadgeIcon secondary size={iconSize} />
          )
        }
        label="Award"
        count={post?.numAwards}
        color={ButtonColor.Cabbage}
        buttonClassName="pointer-events-auto"
      />
    </Tooltip>
  );
};

export default PostAwardAction;
