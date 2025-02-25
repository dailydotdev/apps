import type { ReactElement } from 'react';
import React from 'react';
import { plusRedBackgroundImage } from '../../lib/image';
import type { TypographyColor } from '../typography/Typography';
import { IconSize } from '../Icon';
import { PlusUser } from '../PlusUser';
import { TypographyType } from '../typography/Typography';
import { PlusList } from './PlusList';
import { Image } from '../image/Image';

const PlusListModalSection = (): ReactElement => {
  return (
    <div className="relative flex h-full flex-1 flex-col gap-8 bg-black pr-6">
      <PlusUser
        iconSize={IconSize.Large}
        typographyType={TypographyType.Title1}
        className="invisible"
        aria-hidden
      />
      <Image className="absolute bottom-0" src={plusRedBackgroundImage} />
      <PlusList
        typographyProps={{
          color: 'text-white' as TypographyColor,
        }}
        iconProps={{
          className: 'text-white',
        }}
        className="z-1 pl-10"
      />
    </div>
  );
};

export default PlusListModalSection;
