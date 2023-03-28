import React, { ReactElement } from 'react';
import { cloudinary } from '../../lib/image';
import { Image } from '../image/Image';
import { FlexCentered } from '../utilities';

function SquadEmptyScreen(): ReactElement {
  return (
    <FlexCentered className="flex-col tablet:self-center py-14 w-full laptop:h-full text-center laptop:min-h-[calc(100vh-442px)]">
      <Image
        className="mb-5"
        width={314}
        height={152}
        src={cloudinary.squads.emptySquad}
      />
      <span className="mb-3 font-bold text-salt-90 opacity-32 typo-mega1">
        Welcome to Squads
      </span>
      <span className="text-salt-90 opacity-32 typo-title1">
        Nothing has been posted yet
      </span>
    </FlexCentered>
  );
}

export default SquadEmptyScreen;
