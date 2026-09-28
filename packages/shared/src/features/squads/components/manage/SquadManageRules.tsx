import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { TextField } from '../../../../components/fields/TextField';
import Textarea from '../../../../components/fields/Textarea';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ArrowIcon, PlusIcon, TrashIcon } from '../../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { SquadRule } from '../../../../graphql/sources';
import { useSquadPageContext } from '../../SquadPageContext';
import { useUpdateSquadRules } from '../../hooks/useUpdateSquadRules';
import {
  SQUAD_RULE_DESCRIPTION_MAX_LENGTH,
  SQUAD_RULE_TITLE_MAX_LENGTH,
  SQUAD_RULES_MAX,
} from '../../lib/limits';
import { moveItem } from '../../lib/order';
import { SquadManageSection } from '../../lib/routes';
import {
  SquadManageSaveButton,
  SquadManageSectionPanel,
} from './SquadManageLayout';

const formId = 'squad-manage-rules';

interface RuleDraft {
  key: number;
  title: string;
  description: string;
}

let nextKey = 0;
const toDraft = ({ title, description }: SquadRule): RuleDraft => {
  nextKey += 1;
  return { key: nextKey, title, description: description ?? '' };
};

export const SquadManageRules = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { mutate: onSave, isPending } = useUpdateSquadRules(squad);
  const [rules, setRules] = useState<RuleDraft[]>(() =>
    (squad.rules ?? []).map(toDraft),
  );
  const [showErrors, setShowErrors] = useState(false);
  const isFull = rules.length >= SQUAD_RULES_MAX;

  const updateRule = (key: number, change: Partial<RuleDraft>) =>
    setRules((current) =>
      current.map((rule) => (rule.key === key ? { ...rule, ...change } : rule)),
    );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (rules.some(({ title }) => !title.trim())) {
      setShowErrors(true);
      return;
    }

    onSave(
      rules.map(({ title, description }) => ({
        title: title.trim(),
        description: description.trim() || null,
      })),
    );
  };

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Rules}
      action={<SquadManageSaveButton formId={formId} isLoading={isPending} />}
    >
      <form
        id={formId}
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-6 px-4 py-6 tablet:px-6"
      >
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {`Up to ${SQUAD_RULES_MAX} rules, shown on the page and beside the composer in this order. Moderators remove what breaks them.`}
        </Typography>
        {!rules.length && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            No rules. Add one to show the Rules widget on the page.
          </Typography>
        )}
        <ol className="flex flex-col gap-6">
          {rules.map((rule, index) => (
            <li key={rule.key} className="flex gap-3">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Quaternary}
                bold
                className="w-5 shrink-0 pt-4 tabular-nums"
              >
                {index + 1}
              </Typography>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <TextField
                  inputId={`squad-rule-title-${rule.key}`}
                  name={`rule-title-${rule.key}`}
                  label="Rule"
                  fieldType="secondary"
                  maxLength={SQUAD_RULE_TITLE_MAX_LENGTH}
                  value={rule.title}
                  valueChanged={(title) => updateRule(rule.key, { title })}
                  valid={!showErrors || !!rule.title.trim()}
                />
                <Textarea
                  inputId={`squad-rule-description-${rule.key}`}
                  name={`rule-description-${rule.key}`}
                  label="Why it matters (optional)"
                  rows={2}
                  maxLength={SQUAD_RULE_DESCRIPTION_MAX_LENGTH}
                  value={rule.description}
                  valueChanged={(description) =>
                    updateRule(rule.key, { description })
                  }
                />
              </div>
              <div className="flex shrink-0 flex-col gap-1 pt-2">
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<ArrowIcon />}
                  aria-label={`Move rule ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() =>
                    setRules((current) => moveItem(current, index, index - 1))
                  }
                />
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<ArrowIcon className="rotate-180" />}
                  aria-label={`Move rule ${index + 1} down`}
                  disabled={index === rules.length - 1}
                  onClick={() =>
                    setRules((current) => moveItem(current, index, index + 1))
                  }
                />
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<TrashIcon />}
                  aria-label={`Remove rule ${index + 1}`}
                  onClick={() =>
                    setRules((current) =>
                      current.filter(({ key }) => key !== rule.key),
                    )
                  }
                />
              </div>
            </li>
          ))}
        </ol>
        {!isFull && (
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            className="self-start"
            onClick={() =>
              setRules((current) => [
                ...current,
                toDraft({ title: '', description: null }),
              ])
            }
          >
            Add rule
          </Button>
        )}
      </form>
    </SquadManageSectionPanel>
  );
};
