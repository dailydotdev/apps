import React, { ReactElement } from 'react';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import { squadsPublicWaitlist } from '../../lib/constants';
import SourceBetaIcon from '../../../icons/source_beta.svg';
import { Origin } from '../../lib/analytics';
import { useSquadNavigation } from '../../hooks';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';

export const SquadsDirectoryHeader = (): ReactElement => {
  const { openNewSquad } = useSquadNavigation();
  const { isActionsFetched, checkHasCompleted } = useActions();
  const isOwner = isActionsFetched && checkHasCompleted(ActionType.CreateSquad);

  return (
    <div className="mb-4">
      <div
        className="flex flex-col items-center p-6 mb-1 text-center bg-center bg-cover rounded-24 bg-theme-bg-primary"
        style={{
          backgroundImage: `url(${cloudinary.squads.directory.banner})`,
        }}
      >
        <SourceBetaIcon
          width="auto"
          height="3rem"
          className="mb-4 text-white"
        />
        <div className="flex justify-center items-center mb-3 text-white typo-large-title">
          Introducing Squads
        </div>
        <div className="mb-4 font-normal text-salt-50 typo-title3 max-w-[40rem]">
          Unleashing the magic of developer communities with Squads. An
          opportunity to dive deep and go niche together with like-minded devs.
        </div>
        <Button
          className="btn-primary"
          tag="a"
          href={isOwner && squadsPublicWaitlist}
          target="_blank"
          onClick={
            !isOwner
              ? () => openNewSquad({ origin: Origin.SquadDirectory })
              : undefined
          }
          data-testid="squad-directory-join-waitlist"
        >
          {isOwner ? 'Join waitlist' : 'Create new squad'}
        </Button>
      </div>
      <div className="text-right typo-footnote text-theme-label-quaternary">
        Squads are just getting started. More awesomeness coming soon.
      </div>
    </div>
  );
};
