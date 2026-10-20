import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CodeField } from '@dailydotdev/shared/src/components/fields/CodeField';
import { Checklist, Labeled, Page, Section } from './kit';

const meta: Meta = {
  title: 'Onboarding Fixes/1. Code input',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// Each state gets its own field; only one input on a page can hold focus, so
// the "focused" ones fake it by focusing on mount and the rest blur.
const Field = ({
  defaultValue,
  invalid,
  disabled,
  focus,
}: {
  defaultValue?: string;
  invalid?: boolean;
  disabled?: boolean;
  focus?: boolean;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const input = ref.current?.querySelector('input');
    const timeout = setTimeout(() => (focus ? input?.focus() : input?.blur()));

    return () => clearTimeout(timeout);
  }, [focus]);

  return (
    <div ref={ref}>
      <CodeField
        defaultValue={defaultValue}
        disabled={disabled}
        invalid={invalid}
        onChange={fn()}
        onSubmit={fn()}
      />
    </div>
  );
};

export const Live: StoryObj = {
  name: 'Try it',
  render: () => (
    <Page
      eyebrow="Action item · Check cursor and default state for email verification input"
      title="The code input shows where you type"
      intro={
        <>
          The real input is a transparent field stretched over six boxes, so iOS
          can autofill the whole code. That also hid its caret: the first box
          got a dark border but nothing blinked, so it read as a selected tile,
          not a place to type.
        </>
      }
    >
      <Section
        title="Type here"
        note="Click the boxes, type, paste, backspace."
      >
        <Field focus />
      </Section>
      <Section title="What changed">
        <Checklist
          items={[
            {
              done: true,
              text: 'A blinking caret in the active box, the link blue every other field uses for its caret. It holds still under reduced motion.',
            },
            {
              done: true,
              text: 'An empty field always shows the caret in box 1 when the page opens, on desktop and on phones. iOS ignores autofocus until a tap, so it no longer depends on focus.',
            },
            {
              done: true,
              text: 'The caret moves box to box as digits land and disappears once all six are in, so a full code reads as done.',
            },
            {
              done: true,
              text: 'A wrong code paints all six boxes with the same red border TextField uses, next to the existing message. The input gets aria-invalid.',
            },
            {
              done: true,
              text: 'Boxes after the caret keep the Float fill, so the default state still matches every other field in the flow.',
            },
          ]}
        />
      </Section>
    </Page>
  ),
};

// Focus can't be shown inside a frame that doesn't have it, so the states
// that need focus are their own stories (open them from the sidebar) and the
// overview shows the rest side by side.
const state = (name: string, props: Parameters<typeof Field>[0]): StoryObj => ({
  name,
  render: () => (
    <div className="flex min-h-screen items-center justify-center bg-background-default p-4">
      <Field {...props} />
    </div>
  ),
});

export const StateFocused = state('Focused: caret in box 1', { focus: true });
export const StateTyping = state('Typing: caret in the next box', {
  defaultValue: '123',
  focus: true,
});
export const StateFull = state('Full code: no caret', {
  defaultValue: '123456',
  focus: true,
});

export const States: StoryObj = {
  name: 'Resting, wrong, verifying',
  render: () => (
    <Page
      eyebrow="Code input"
      title="States"
      intro="Typing and a full code need focus, so they are the next stories in the sidebar."
    >
      <div className="grid grid-cols-1 gap-8 tablet:grid-cols-3">
        <Labeled
          label="Empty on arrival: caret in box 1, even without focus"
          tone="after"
        >
          <Field />
        </Labeled>
        <Labeled label="Wrong code: red on every box" tone="after">
          <Field defaultValue="123456" invalid />
        </Labeled>
        <Labeled label="Verifying (disabled)">
          <Field defaultValue="123456" disabled />
        </Labeled>
      </div>
    </Page>
  ),
};
