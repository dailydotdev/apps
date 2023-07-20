import React, { ReactElement } from 'react';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';

interface SquadListingHeaderProps {
  isOwner?: boolean;
}

export const SquadListingHeader = ({
  isOwner = false,
}: SquadListingHeaderProps): ReactElement => {
  return (
    <div className="mb-4">
      <div
        className="flex flex-col items-center p-6 mb-1 text-center bg-center bg-cover rounded-24 bg-theme-bg-primary"
        style={{
          backgroundImage: `url(${cloudinary.squads.listingBanner})`,
        }}
      >
        <div className="flex justify-center items-center mb-3 text-theme-label-primary typo-large-title">
          Introducing Squads
        </div>
        <div className="mb-4 typo-title3 font-normal text-theme-label-secondary max-w-[40rem]">
          Unleashing the magic of developer communities with Squads. An
          opportunity to dive deep and go niche together with like-minded devs.
        </div>
        <Button
          className="btn-primary"
          onClick={() =>
            isOwner ? alert('Join waitlist...') : alert('Create new squad...')
          }
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
