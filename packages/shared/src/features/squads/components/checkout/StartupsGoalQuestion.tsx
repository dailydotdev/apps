import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { TextField } from '../../../../components/fields/TextField';

// Which value people come for, so the messaging can lead with it. Every answer
// is a real part of the Starter plan, and every plan gets all of them: the answers
// are only logged, they change nothing that comes next.

export enum StartupsGoal {
  Users = 'users',
  AiAnswers = 'ai_answers',
  WhatToPost = 'what_to_post',
  Agent = 'agent',
  Page = 'page',
  Other = 'other',
}

export interface StartupsGoalAnswers {
  goals: StartupsGoal[];
  /** What they typed for "Something else". */
  text: string;
}

const QUESTION = 'What do you want to achieve?';
const OTHER_MAX_LENGTH = 100;

const goalOptions: { value: StartupsGoal; label: string }[] = [
  { value: StartupsGoal.Users, label: 'Get developers to try my product' },
  { value: StartupsGoal.AiAnswers, label: 'Show up in AI answers' },
  { value: StartupsGoal.WhatToPost, label: 'Know what to post' },
  { value: StartupsGoal.Agent, label: 'Let my agent handle distribution' },
  { value: StartupsGoal.Page, label: 'Have a page developers can find' },
  { value: StartupsGoal.Other, label: 'Something else' },
];

/** "Something else" with nothing typed says nothing, so it isn't an answer */
export const getStartupsGoalAnswers = ({
  goals,
  text,
}: StartupsGoalAnswers): { goal: StartupsGoal; text?: string }[] => {
  const typed = text.trim();

  return goals
    .filter((goal) => goal !== StartupsGoal.Other || !!typed)
    .map((goal) =>
      goal === StartupsGoal.Other ? { goal, text: typed } : { goal },
    );
};

export const StartupsGoalQuestion = ({
  value: { goals, text },
  onChange,
}: {
  value: StartupsGoalAnswers;
  onChange: (value: StartupsGoalAnswers) => void;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <p className="font-bold typo-callout">{QUESTION}</p>
    <div role="group" aria-label={QUESTION} className="flex flex-wrap gap-2">
      {goalOptions.map(({ value, label }) => {
        const isPicked = goals.includes(value);

        return (
          <Button
            key={value}
            type="button"
            role="checkbox"
            aria-checked={isPicked}
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            style={
              isPicked
                ? {
                    borderColor: 'var(--theme-brand-default)',
                    background: 'var(--theme-brand-active)',
                  }
                : undefined
            }
            onClick={() =>
              onChange({
                goals: isPicked
                  ? goals.filter((goal) => goal !== value)
                  : [...goals, value],
                text,
              })
            }
          >
            {label}
          </Button>
        );
      })}
    </div>
    {goals.includes(StartupsGoal.Other) && (
      <TextField
        // Only ever mounted by choosing "Something else"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        inputId="startups-goal-other"
        name="goalOther"
        label="In your own words"
        maxLength={OTHER_MAX_LENGTH}
        showMaxLength={false}
        className={{ container: 'w-full' }}
        value={text}
        valueChanged={(next) => onChange({ goals, text: next })}
      />
    )}
  </div>
);
