import type { ReactElement } from 'react';
import React from 'react';
import Markdown from '../../../components/Markdown';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { transcriptProse } from '../prose';
import { useAgent } from '../AgentContext';

export const AgentBriefBlock = ({
  html,
  brief,
}: {
  html: string;
  brief: string;
}): ReactElement => {
  const {
    interest,
    isBriefOpen,
    confirmBrief,
    isConfirmingBrief,
    briefDraft: draft,
    setBriefDraft: setDraft,
  } = useAgent();
  const isEditing = draft !== null;
  // Reflects a rewrite immediately, rather than the snapshot the run stored.
  const current = interest?.brief ?? brief;

  return (
    <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Here is the brief I will run against
      </Typography>

      {isEditing ? (
        <textarea
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          aria-label="Edit the brief"
          rows={5}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="agent-scroll w-full resize-none rounded-12 border border-border-subtlest-secondary bg-transparent px-3 py-2 text-text-primary outline-none typo-callout"
        />
      ) : (
        <blockquote className="border-l-2 border-brand-default pl-3">
          {current === brief ? (
            <Markdown className={transcriptProse} content={html} />
          ) : (
            <Typography
              type={TypographyType.Callout}
              className="!leading-relaxed"
            >
              {current}
            </Typography>
          )}
        </blockquote>
      )}

      {isBriefOpen && (
        <FlexRow className="items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                loading={isConfirmingBrief}
                disabled={!draft.trim()}
                onClick={() => confirmBrief(draft.trim())}
              >
                Save and continue
              </Button>
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                onClick={() => setDraft(null)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                loading={isConfirmingBrief}
                onClick={() => confirmBrief()}
              >
                Looks right
              </Button>
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Float}
                onClick={() => setDraft(current)}
              >
                Edit it
              </Button>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="hidden tablet:inline"
              >
                or press Enter
              </Typography>
            </>
          )}
        </FlexRow>
      )}
    </FlexCol>
  );
};
