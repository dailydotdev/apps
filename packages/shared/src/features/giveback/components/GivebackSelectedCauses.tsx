import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { EditIcon, OpenLinkIcon, PlusIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';
import { GivebackSection } from './GivebackSection';
import { CauseEmblem } from './CauseEmblem';
import { GivebackCausesModal } from './GivebackCausesModal';
import { CauseSelectionModal } from './CauseSelectionModal';

// "Your causes" recap on the Why tab. Shows only the causes the visitor picked,
// with quick actions to suggest a new one or open the full picker (portal) to
// edit. Editing lives here now instead of a gear button in the tab bar.
export const GivebackSelectedCauses = (): ReactElement => {
  const { causes, suggestedCauses, userProfile } = useGivebackContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  // Keep each cause's position in the full list so the fallback emblem tint
  // stays stable between the picker and this recap.
  const selectedCauses = causes
    .map((cause, index) => ({ cause, index }))
    .filter(({ cause }) => userProfile.selectedCauseIds.includes(cause.id));

  return (
    <GivebackSection
      id="giveback-your-causes"
      title="Your causes"
      description="Where your actions send the money"
    >
      {selectedCauses.length > 0 ? (
        <FlexCol className="gap-4">
          <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
            {selectedCauses.map(({ cause, index }) => (
              <FlexRow
                key={cause.id}
                className="items-center gap-3 rounded-16 bg-surface-float p-3"
              >
                <CauseEmblem cause={cause} index={index} />
                <FlexCol className="min-w-0 flex-1 gap-0.5">
                  <Typography
                    bold
                    type={TypographyType.Callout}
                    className="truncate"
                  >
                    {cause.name}
                  </Typography>
                  {cause.category && (
                    <Typography
                      tag={TypographyTag.Span}
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                      className="truncate"
                    >
                      {cause.category}
                    </Typography>
                  )}
                </FlexCol>
                <a
                  href={cause.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Learn more about ${cause.name}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  <OpenLinkIcon size={IconSize.Small} />
                </a>
              </FlexRow>
            ))}
          </div>
          <FlexRow className="flex-wrap items-center gap-2">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              icon={<EditIcon />}
              onClick={() => setIsEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              icon={<PlusIcon />}
              onClick={() => setIsSuggestOpen(true)}
            >
              Suggest a cause
            </Button>
          </FlexRow>
        </FlexCol>
      ) : (
        <FlexCol className="items-start gap-3 rounded-16 bg-surface-float p-5">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            You haven&apos;t picked any causes yet. Choose where your actions
            send the money.
          </Typography>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            icon={<EditIcon />}
            onClick={() => setIsEditOpen(true)}
          >
            Pick your causes
          </Button>
        </FlexCol>
      )}

      {suggestedCauses.length > 0 && (
        <FlexRow className="flex-wrap items-center gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Your suggestions:
          </Typography>
          {suggestedCauses.map((cause) => (
            <FlexRow
              key={cause.id}
              className="items-center gap-1.5 rounded-8 bg-surface-float px-2.5 py-1"
            >
              <Typography type={TypographyType.Caption1} bold>
                {cause.name}
              </Typography>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
              >
                pending review
              </Typography>
            </FlexRow>
          ))}
        </FlexRow>
      )}

      {isEditOpen && (
        <GivebackCausesModal onClose={() => setIsEditOpen(false)} />
      )}
      {isSuggestOpen && (
        <CauseSelectionModal onClose={() => setIsSuggestOpen(false)} />
      )}
    </GivebackSection>
  );
};
