import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  ModalKind,
  ModalSize,
} from '@dailydotdev/shared/src/components/modals/common/types';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { featuredAwardImage } from '@dailydotdev/shared/src/lib/image';
import type { AwardWithRarity } from '../../lib/gameCenter';

type TrophyGridProps = {
  awards: AwardWithRarity[];
};

const Cell = ({ award }: { award: AwardWithRarity }): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  // The glow art is drawn for a large render, the way the give-award flow
  // uses it; the grid tile keeps the flat one.
  const largeImage = award.imageGlow || award.image;

  return (
    <div role="listitem" className="min-w-0">
      <button
        type="button"
        aria-label={`View the ${award.name} award`}
        className="group flex w-full min-w-0 flex-col items-center gap-0.5 py-2 transition hover:-translate-y-1"
        onClick={() => setIsExpanded(true)}
      >
        <Image
          src={award.image}
          alt={award.name}
          fallbackSrc={featuredAwardImage}
          loading="lazy"
          className="size-20 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-105"
        />
        <Typography
          type={TypographyType.Subhead}
          bold
          className="w-full truncate text-center"
        >
          {award.name}
        </Typography>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          ×{award.count.toLocaleString()}
        </Typography>
      </button>

      {isExpanded && (
        <Modal
          isOpen
          onRequestClose={() => setIsExpanded(false)}
          kind={ModalKind.FlexibleCenter}
          size={ModalSize.XSmall}
          className="overflow-hidden"
        >
          <div className="relative flex flex-col items-center px-6 pb-6 pt-10">
            <CloseButton
              variant={ButtonVariant.Tertiary}
              className="absolute right-2.5 top-2.5"
              onClick={() => setIsExpanded(false)}
            />
            <Image
              src={largeImage}
              alt={award.name}
              fallbackSrc={featuredAwardImage}
              className="max-h-60 w-auto max-w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
            />
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Title3}
              bold
              className="mt-4 text-center"
            >
              {award.name}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="mt-1"
            >
              You hold {award.count.toLocaleString()}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              bold
              className="mt-3 flex items-center gap-1"
            >
              <CoreIcon size={IconSize.Size16} />
              {(award.value * award.count).toLocaleString()}
            </Typography>
          </div>
        </Modal>
      )}
    </div>
  );
};

export const TrophyGrid = ({ awards }: TrophyGridProps): ReactElement => {
  return (
    <div
      className="grid grid-cols-3 gap-x-2 gap-y-4 tablet:grid-cols-5"
      role="list"
      aria-label="Award collection"
    >
      {awards.map((award) => (
        <Cell key={award.id} award={award} />
      ))}
    </div>
  );
};
