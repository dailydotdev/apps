import React, { ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { Origin } from '../../lib/log';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import { SimpleSquadJoinButton } from './SquadJoinButton';
import { Squad } from '../../graphql/sources';
import usePersistentContext from '../../hooks/usePersistentContext';
import { useJoinSquad, useViewSize, ViewSize } from '../../hooks';
import { labels } from '../../lib';
import { useToastNotification } from '../../hooks/useToastNotification';
import SourceButton from '../cards/SourceButton';
import { SQUAD_COMMENT_JOIN_BANNER_KEY } from '../../graphql/squads';
import { Post } from '../../graphql/posts';
import { ProfileImageSize } from '../ProfilePicture';

export type SquadCommentJoinBannerProps = {
  className?: string;
  squad: Squad;
  logOrigin: Origin;
  post?: Pick<Post, 'id'>;
};

export const SquadCommentJoinBanner = ({
  className,
  squad,
  logOrigin,
  post,
}: SquadCommentJoinBannerProps): ReactElement => {
  const queryClient = useQueryClient();
  const isSquadMember = !!squad?.currentMember;
  const isMobile = useViewSize(ViewSize.MobileL);
  const { displayToast } = useToastNotification();
  const [isJoinSquadBannerDismissed, setJoinSquadBannerDismissed] =
    usePersistentContext(SQUAD_COMMENT_JOIN_BANNER_KEY, false);

  const { mutateAsync: onJoinSquad, isLoading } = useMutation(
    useJoinSquad({
      squad,
      referralToken: squad?.currentMember?.referralToken,
    }),
    {
      onSuccess: () => {
        displayToast(`🙌 You joined the Squad ${squad.name}`);

        if (post?.id) {
          queryClient.invalidateQueries(['post', post.id]);
        }
      },
      onError: () => {
        displayToast(labels.error.generic);
      },
    },
  );

  if (!squad || isJoinSquadBannerDismissed || isSquadMember) {
    return null;
  }

  return (
    <div
      className={classNames(
        'mx-3 mb-3 flex flex-1 flex-row items-start justify-between gap-4 rounded-16 border border-accent-cabbage-default p-4',
        className,
      )}
    >
      <div className="flex flex-1 flex-col">
        <p className="flex flex-1 text-text-tertiary typo-callout">
          Join {squad.name} to see more posts like this one, contribute to
          conversation and more...
        </p>
        <div className="mt-5 flex flex-row gap-3">
          <SimpleSquadJoinButton
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            squad={squad}
            origin={logOrigin}
            onClick={() => {
              onJoinSquad();
            }}
            disabled={isLoading}
          >
            Join squad
          </SimpleSquadJoinButton>
          <Button
            variant={ButtonVariant.Tertiary}
            onClick={() => {
              setJoinSquadBannerDismissed(true);
            }}
          >
            Dismiss
          </Button>
        </div>
      </div>
      <SourceButton
        source={squad}
        size={isMobile ? ProfileImageSize.Large : ProfileImageSize.XXXXLarge}
      />
    </div>
  );
};
