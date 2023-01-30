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
      <div className="flex relative justify-center items-center my-4 w-full h-40">
        <DailyCircle className=" absolute bottom-0 -left-10" size="xsmall" />
        <DailyCircle className=" absolute top-4 left-10" size="xxsmall" />
        <Image
          src={squad.image}
          alt={squad.name}
          className="object-cover w-40 h-40 rounded-full"
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
