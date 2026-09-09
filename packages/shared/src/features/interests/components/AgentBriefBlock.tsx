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
import MarkdownInput from '../../../components/fields/MarkdownInput';
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
    isBriefOpen,
    confirmBrief,
    isConfirmingBrief,
    briefDraft: draft,
    setBriefDraft: setDraft,
  } = useAgent();
  // Gated on the step too: once it advances there are no buttons under the
  // editor, so a stray draft would leave a textarea that does nothing.
  const isEditing = draft !== null && isBriefOpen;

  return (
    <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Here is the brief I will run against
      </Typography>

      {isEditing ? (
        <MarkdownInput
          allowPreview={false}
          showMarkdownGuide={false}
          initialContent={draft}
          textareaProps={{
            'aria-label': 'Edit the brief',
            rows: 5,
            maxLength: 1500,
          }}
          // A brief is an instruction to the agent, so neither mentioning
          // someone nor attaching an image means anything here.
          enabledCommand={{ upload: false, mention: false }}
          onValueUpdate={setDraft}
        />
      ) : (
        <blockquote className="border-l-2 border-brand-default pl-3">
          {/* Always the stored HTML: a rewrite re-renders the block server
              side, so there is no raw-text case left to fall back to. */}
          <Markdown className={transcriptProse} content={html} />
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
                onClick={() => setDraft(brief)}
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
