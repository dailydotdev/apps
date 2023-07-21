import React, { ReactElement, useContext } from 'react';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import { SquadsPublicWaitlist } from '../../lib/constants';
import SourceBetaIcon from '../../../icons/source_beta.svg';
import { useCreateSquadModal } from '../../hooks/useCreateSquadModal';
import FeaturesContext from '../../contexts/FeaturesContext';
import { Origin } from '../../lib/analytics';

interface SquadListingHeaderProps {
  isOwner?: boolean;
}

export const SquadListingHeader = ({
  isOwner = false,
}: SquadListingHeaderProps): ReactElement => {
  const { hasSquadAccess, isFlagsFetched } = useContext(FeaturesContext);
  const { openNewSquadModal } = useCreateSquadModal({
    hasSquads: true,
    hasAccess: hasSquadAccess,
    isFlagsFetched,
  });

  return (
    <div className="mb-4">
      <div
        className="flex flex-col items-center p-6 mb-1 text-center bg-center bg-cover rounded-24 bg-theme-bg-primary"
        style={{
          backgroundImage: `url(${cloudinary.squads.listingBanner})`,
        }}
      >
        <div className="mb-4">
          <SourceBetaIcon
            width="auto"
            height="3rem"
            className="text-theme-label-primary"
          />
        </div>
        <div className="flex justify-center items-center mb-3 text-theme-label-primary typo-large-title">
          Introducing Squads
        </div>
        <div className="mb-4 font-normal typo-title3 text-theme-label-secondary max-w-[40rem]">
          Unleashing the magic of developer communities with Squads. An
          opportunity to dive deep and go niche together with like-minded devs.
        </div>
        <Button
          className="btn-primary"
          tag="a"
          href={isOwner && SquadsPublicWaitlist}
          target="_blank"
          onClick={
            !isOwner
              ? () => openNewSquadModal({ origin: Origin.SquadDirectory })
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
