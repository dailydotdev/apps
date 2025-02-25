import type { ReactElement } from 'react';
import React from 'react';
import { plusRedBackgroundImage } from '../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { PlusUser } from '../PlusUser';
import { PlusList } from './PlusList';
import { Image } from '../image/Image';
import { PlusTrustReviews } from './PlusTrustReviews';
import { IconSize } from '../Icon';
import { PrivacyIcon } from '../icons';

const PlusListModalSection = (): ReactElement => {
  return (
    <div className="relative flex h-full flex-1 flex-col gap-6 bg-black pr-6">
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
        className="z-1 pb-0 pl-10"
      />
      <div className="z-1 flex flex-col gap-6">
        <div
          aria-label="Refund policy"
          className="mx-auto flex max-w-fit items-center gap-2 rounded-10 bg-surface-float p-2"
        >
          <div
            aria-hidden
            className="grid size-8 place-items-center rounded-10"
          >
            <PrivacyIcon
              className="mx-auto rounded-10 bg-action-comment-float text-accent-blueCheese-default"
              secondary
              size={IconSize.Medium}
            />
          </div>
          <Typography
            className="min-w-0 flex-1"
            color={TypographyColor.Primary}
            type={TypographyType.Callout}
          >
            30 day hassle-free refund. No questions asked.
          </Typography>
        </div>
        <PlusTrustReviews center />
      </div>
    </div>
  );
};

export default PlusListModalSection;
