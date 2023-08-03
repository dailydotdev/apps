import React, { ReactElement } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import classNames from 'classnames';
import { Origin } from '../../lib/analytics';
import { Button } from '../buttons/Button';
import { SimpleSquadJoinButton } from './SquadJoinButton';
import { Squad } from '../../graphql/sources';
import usePersistentContext from '../../hooks/usePersistentContext';
import { useJoinSquad } from '../../hooks';
import { labels } from '../../lib';
import { useToastNotification } from '../../hooks/useToastNotification';
import SourceButton from '../cards/SourceButton';
import useMedia from '../../hooks/useMedia';
import { mobileL } from '../../styles/media';
import { SQUAD_COMMENT_JOIN_BANNER_KEY } from '../../graphql/squads';
import { Post } from '../../graphql/posts';

export type SquadCommentJoinBannerProps = {
  className?: string;
  squad: Squad;
  analyticsOrigin: Origin;
  post?: Pick<Post, 'id'>;
};

export const SquadCommentJoinBanner = ({
  className,
  squad,
  analyticsOrigin,
  post,
}: SquadCommentJoinBannerProps): ReactElement => {
  const queryClient = useQueryClient();
  const isSquadMember = !!squad?.currentMember;
  const isMobile = !useMedia([mobileL.replace('@media ', '')], [true], false);
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
        'flex flex-row flex-1 gap-4 justify-between items-start p-4 mx-3 mb-3 rounded-16 border border-theme-color-cabbage',
        className,
      )}
    >
      <div className="flex flex-col flex-1">
        <p className="flex flex-1 text-theme-label-tertiary typo-callout">
          Join {squad.name} to see more posts like this one, contribute to
          conversation and more...
        </p>
        <div className="flex flex-row gap-3 mt-5">
          <SimpleSquadJoinButton
            className="btn-primary-cabbage"
            squad={squad}
            origin={analyticsOrigin}
            onClick={() => {
              onJoinSquad();
            }}
            disabled={isLoading}
          >
            Join squad
          </SimpleSquadJoinButton>
          <Button
            className="btn-tertiary"
            onClick={() => {
              setJoinSquadBannerDismissed(true);
            }}
          >
            Dismiss
          </Button>
        </div>
      </div>
      <SourceButton source={squad} size={isMobile ? 'large' : 'xxxxlarge'} />
    </div>
  );
};
