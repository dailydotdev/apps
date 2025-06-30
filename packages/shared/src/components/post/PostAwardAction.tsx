import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
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

export interface PostAwardActionProps {
  post: Post;
}

const PostAwardAction = ({ post }: PostAwardActionProps) => {
  const { openModal } = useLazyModal();
  const { user, showLogin } = useAuthContext();
  const isSameUser = user?.id === post.author.id;
  const hasAccessToCores = useHasAccessToCores();

  const awardEntity = {
    id: post.id,
    receiver: post.author,
    numAwards: post.numAwards,
  };

  if (!hasAccessToCores || isSameUser) {
    return null;
  }

  const openAwardModal = () => {
    if (!user) {
      return showLogin({ trigger: AuthTriggers.GiveAward });
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

  const disabled = post.userState.awarded;

  return (
    <Tooltip content="Award this post">
      <QuaternaryButton
        id={`post-${post.id}-award-btn`}
        pressed={!!post.userState.awarded}
        onClick={openAwardModal}
        size={ButtonSize.Small}
        aria-disabled={disabled}
        className="btn-tertiary-cabbage"
        variant={ButtonVariant.Tertiary}
        buttonClassName={disabled && '!pointer-events-none'}
        labelClassName={disabled && '!pointer-events-none'}
        color={ButtonColor.Cabbage}
        icon={
          post.featuredAward?.award?.image ? (
            <Image
              src={post?.featuredAward?.award?.image}
              alt={post?.featuredAward?.award?.name}
              className={iconSizeToClassName[IconSize.XSmall]}
            />
          ) : (
            <MedalBadgeIcon secondary size={IconSize.XSmall} />
          )
        }
      >
        {post?.numAwards > 0 && (
          <InteractionCounter
            className="tabular-nums !typo-footnote"
            value={post.numAwards}
          />
        )}
      </QuaternaryButton>
    </Tooltip>
  );
};

export default PostAwardAction;
