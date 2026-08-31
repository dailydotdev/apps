import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
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
import { VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { AgentQuestionBlock as QuestionBlock } from '../chat';
import { transcriptProse } from '../prose';
import { useAgent } from '../AgentContext';

export const AgentQuestionBlock = ({
  block,
}: {
  block: QuestionBlock;
}): ReactElement => {
  const {
    activeQuestion,
    answerQuestion,
    isWorking,
    pendingAnswer,
    togglePendingAnswer,
  } = useAgent();
  const isLive = activeQuestion?.questionId === block.questionId;
  // An answered question keeps showing what was chosen, not the live selection.
  const selected = isLive ? pendingAnswer : block.selected ?? [];

  const labelsFor = (values: string[]): string =>
    (block.choices ?? [])
      .filter(({ value }) => values.includes(value))
      .map(({ label }) => label)
      .join(', ');

  const submit = (values: string[]) => {
    const text = labelsFor(values);

    if (!text) {
      return;
    }

    answerQuestion({ text, questionId: block.questionId });
  };

  const toggle = (value: string, event: React.MouseEvent<HTMLElement>) => {
    if (!block.multi) {
      submit([value]);
      return;
    }

    togglePendingAnswer(value);

    // A pointer click leaves focus on the chip, where Enter re-fires the click
    // and un-picks it instead of reaching the workspace handler. Keyboard
    // activation reports no detail, and keeps focus so tab order survives.
    if (event.detail > 0) {
      event.currentTarget.blur();
    }
  };

  return (
    <FlexCol
      className={classNames(
        'gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
        !isLive && 'opacity-60',
      )}
    >
      <Markdown className={transcriptProse} content={block.html} />

      {block.input === 'text' && !isLive && (
        <FlexRow className="items-center gap-1.5">
          <VIcon size={IconSize.Size16} className="text-status-success" />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Answered
          </Typography>
        </FlexRow>
      )}

      {isLive && block.input === 'text' && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Answer below.
        </Typography>
      )}

      {block.input === 'chips' && (
        <FlexCol className="gap-3">
          <FlexRow className="flex-wrap gap-2">
            {(block.choices ?? []).map(({ value, label }) => {
              const isOn = selected.includes(value);

              return (
                <Button
                  key={value}
                  size={ButtonSize.Small}
                  variant={isOn ? ButtonVariant.Primary : ButtonVariant.Float}
                  pressed={isOn}
                  aria-pressed={isOn}
                  disabled={!isLive || isWorking}
                  onClick={(event: React.MouseEvent<HTMLElement>) =>
                    toggle(value, event)
                  }
                >
                  {label}
                </Button>
              );
            })}
          </FlexRow>
          {isLive && block.multi && (
            <FlexRow className="items-center gap-3">
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                disabled={!selected.length || isWorking}
                onClick={() => submit(selected)}
              >
                Continue
              </Button>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="hidden tablet:inline"
              >
                or press Enter
              </Typography>
            </FlexRow>
          )}
        </FlexCol>
      )}
    </FlexCol>
  );
};
