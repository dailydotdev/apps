import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CompassIcon } from '../../../../components/icons';

// Which value people come for, so the messaging can lead with it. Every answer
// is a real part of the Starter plan, and every plan gets all of them: the answer
// is only logged, it changes nothing that comes next.

export enum StartupsGoal {
  Users = 'users',
  AiAnswers = 'ai_answers',
  WhatToPost = 'what_to_post',
  Agent = 'agent',
  Page = 'page',
  Other = 'other',
}

export interface StartupsGoalAnswer {
  goal?: StartupsGoal;
  /** What they typed for "Something else". */
  text: string;
}

const QUESTION = 'What do you want to achieve first?';
const OTHER_PLACEHOLDER = 'In your own words';
const OTHER_MAX_LENGTH = 100;

const goals: { value: StartupsGoal; label: string }[] = [
  { value: StartupsGoal.Users, label: 'More users' },
  { value: StartupsGoal.AiAnswers, label: 'AI answers' },
  { value: StartupsGoal.WhatToPost, label: 'What to post' },
  { value: StartupsGoal.Agent, label: 'Agent on autopilot' },
  { value: StartupsGoal.Page, label: 'A company page' },
  { value: StartupsGoal.Other, label: 'Something else' },
];

/** "Something else" with nothing typed says nothing, so it counts as no answer */
export const getStartupsGoalAnswer = ({
  goal,
  text,
}: StartupsGoalAnswer): StartupsGoalAnswer | undefined => {
  const typed = text.trim();

  if (!goal || (goal === StartupsGoal.Other && !typed)) {
    return undefined;
  }

  return { goal, text: goal === StartupsGoal.Other ? typed : '' };
};

export const StartupsGoalQuestion = ({
  value: { goal, text },
  onChange,
}: {
  value: StartupsGoalAnswer;
  onChange: (value: StartupsGoalAnswer) => void;
}): ReactElement => {
  const isOther = goal === StartupsGoal.Other;
  const cell = { gridArea: '1 / 1' };

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-baseline justify-between gap-2 font-bold typo-callout">
        {QUESTION}
        <span className="font-normal text-text-tertiary typo-footnote">
          Optional
        </span>
      </p>
      {/* The chips and the text box share a cell, so swapping them moves nothing */}
      <div style={{ display: 'grid' }}>
        <div
          role="radiogroup"
          aria-label={QUESTION}
          className="flex flex-wrap gap-2"
          style={{ ...cell, visibility: isOther ? 'hidden' : undefined }}
        >
          {goals.map(({ value, label }) => (
            <Button
              key={value}
              type="button"
              role="radio"
              aria-checked={goal === value}
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              style={
                goal === value
                  ? {
                      borderColor: 'var(--theme-brand-default)',
                      background: 'var(--theme-brand-active)',
                    }
                  : undefined
              }
              onClick={() =>
                onChange({ goal: goal === value ? undefined : value, text })
              }
            >
              {label}
            </Button>
          ))}
        </div>
        {isOther && (
          <div className="flex items-start gap-2" style={cell}>
            <label
              className="flex min-h-14 min-w-0 flex-1 cursor-text items-center gap-3 rounded-8 border border-solid border-brand-default bg-brand-active px-4 typo-body"
              htmlFor="startups-goal-other"
            >
              <span className="flex size-6 items-center justify-center">
                <CompassIcon secondary className="text-text-tertiary" />
              </span>
              <input
                // Only ever mounted by choosing "Something else"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                aria-label={QUESTION}
                className="min-w-0 flex-1 bg-transparent py-3 text-text-primary outline-none placeholder:text-text-tertiary"
                id="startups-goal-other"
                maxLength={OTHER_MAX_LENGTH}
                onChange={(event) =>
                  onChange({ goal, text: event.target.value })
                }
                placeholder={OTHER_PLACEHOLDER}
                type="text"
                value={text}
              />
            </label>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              style={{ marginTop: 12 }}
              onClick={() => onChange({ goal: undefined, text })}
            >
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
