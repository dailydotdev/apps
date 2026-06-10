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
import { EditIcon, OpenLinkIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { anchorDefaultRel } from '../../../lib/strings';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { useContributionCausePicker } from '../hooks/useContributionCausePicker';
import { GivebackSection } from './GivebackSection';
import { CauseEmblem } from './CauseEmblem';
import { GivebackEditCausesModal } from './GivebackEditCausesModal';

// "Your causes" recap on the Campaign tab. Shows only the causes the visitor
// picked, with a quick action to open the picker and edit. Editing lives here
// now instead of a gear button in the tab bar.
export const GivebackSelectedCauses = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { causes, selectedCauseIds } = useContributionCausePicker(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Keep each cause's position in the full list so the fallback emblem tint
  // stays stable between the picker and this recap.
  const selectedCauses = causes
    .map((cause, index) => ({ cause, index }))
    .filter(({ cause }) => selectedCauseIds.includes(cause.id));

  const openEdit = () => {
    logEvent({
      event_name: LogEvent.ClickGivebackEditCauses,
      extra: JSON.stringify({ has_causes: selectedCauses.length > 0 }),
    });
    setIsEditOpen(true);
  };

  const onCauseClick = (causeId: string) =>
    logEvent({ event_name: LogEvent.ClickGivebackCause, target_id: causeId });

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
                    {cause.title}
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
                {cause.url && (
                  <a
                    href={cause.url}
                    target="_blank"
                    rel={anchorDefaultRel}
                    aria-label={`Learn more about ${cause.title}`}
                    onClick={() => onCauseClick(cause.id)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <OpenLinkIcon size={IconSize.Small} />
                  </a>
                )}
              </FlexRow>
            ))}
          </div>
          <FlexRow>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              icon={<EditIcon />}
              onClick={openEdit}
            >
              Edit
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
            onClick={openEdit}
          >
            Pick your causes
          </Button>
        </FlexCol>
      )}

      {isEditOpen && (
        <GivebackEditCausesModal onClose={() => setIsEditOpen(false)} />
      )}
    </GivebackSection>
  );
};
