import type { ReactElement } from 'react';
import React from 'react';
import { cloudinaryCharmEmptySquads } from '../../lib/image';
import { Image } from '../image/Image';
import { FlexCentered } from '../utilities';

function SquadEmptyScreen(): ReactElement {
  return (
    <FlexCentered className="mt-12 min-h-[calc(100vh-565px)] w-full flex-col p-6 text-center tablet:min-h-[calc(100vh-600px)] laptop:h-full laptop:min-h-[calc(100vh-540px)]">
      <Image
        className="mb-3 h-40 w-40 object-contain tablet:mb-8"
        src={cloudinaryCharmEmptySquads}
        alt="daily.dev charm waving in an empty squad"
        loading="lazy"
      />
      <span className="max-w-lg text-text-primary typo-body tablet:typo-title1">
        Get started by sharing your first post and inviting other developers you
        know and appreciate.
      </span>
    </FlexCentered>
  );
}

export default SquadEmptyScreen;
