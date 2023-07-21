import React, { ReactElement } from 'react';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
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

export type SquadJoinBannerProps = {
  squad: Squad;
  analyticsOrigin: Origin;
  storageKey: string;
};

export const SquadJoinBanner = ({
  squad,
  analyticsOrigin,
  storageKey,
}: SquadJoinBannerProps): ReactElement => {
  const isMobile = !useMedia([mobileL.replace('@media ', '')], [true], false);
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const [isJoinSquadBannerDismissed, setJoinSquadBannerDismissed] =
    usePersistentContext(storageKey, false);

  const { mutateAsync: onJoinSquad, isLoading } = useMutation(
    useJoinSquad({
      squad,
      referralToken: squad?.currentMember?.referralToken,
    }),
    {
      onSuccess: () => {
        router.push(squad.permalink);
      },
      onError: () => {
        displayToast(labels.error.generic);
      },
    },
  );

  if (!squad || isJoinSquadBannerDismissed) {
    return null;
  }

  return (
    <div className="flex flex-row flex-1 gap-4 justify-between items-start p-4 mx-3 mb-3 rounded-16 border border-theme-color-cabbage">
      <div className="flex flex-col flex-1">
        <p className="flex flex-1 text-theme-label-tertiary typo-callout">
          Join {squad.name} to see more posts like this one, contribute to
          conversation and more...
        </p>
        <div className="flex flex-row gap-3 mt-5">
          <SimpleSquadJoinButton
            className="btn-primary-cabbage text-theme-label-primary"
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
