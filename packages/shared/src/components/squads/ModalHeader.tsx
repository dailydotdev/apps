import React, { ReactElement } from 'react';
import { Squad } from '../../graphql/squads';
import { cloudinary } from '../../lib/image';
import DailyCircle from '../DailyCircle';
import { Image } from '../image/Image';

type SquadModalHeaderProps = {
  squad: Squad;
};

export const SquadModalHeader = ({
  squad,
}: SquadModalHeaderProps): ReactElement => {
  return (
    <>
      <div className="relative my-4 flex h-40 w-full items-center justify-center">
        <DailyCircle className=" absolute bottom-0 -left-10" size="xsmall" />
        <DailyCircle className=" absolute top-4 left-10" size="xxsmall" />
        <Image
          src={squad.image}
          alt={`${squad.handle}'s logo`}
          className="h-40 w-40 rounded-full object-cover"
          loading="lazy"
          fallbackSrc={cloudinary.squads.imageFallback}
        />
        <DailyCircle className=" absolute top-0 -right-10" size="xsmall" />
        <DailyCircle className=" absolute right-10 bottom-4" size="xxsmall" />
      </div>
      <h3 className="font-bold typo-title2">{squad.name}</h3>
      <h4 className="text-theme-label-tertiary">@{squad.handle}</h4>
    </>
  );
};
