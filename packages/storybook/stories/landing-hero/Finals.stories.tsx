import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page, Table, VariationPage2 } from './parts';
import { LAPTOP, PHONE, Shot } from './shot';
import { finals } from './variations2';

const GOAL =
  'One board with every pick from the review, so the test plan can be written against it.';
const METRIC =
  'Signup picks: hero signup rate, D7 retained accounts per visitor. Extension picks: account + extension within 7 days, hero signups as the guardrail.';

const meta: Meta = {
  title: 'Landing Hero/Finals',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const status = (id: string): string =>
  finals.find((variation) => variation.id === id)?.final ? 'Final' : 'Pick';

export const Board: StoryObj = {
  name: 'All finals',
  render: () => (
    <Page
      chapter="Finals"
      question="What survived the review, and what does each one bet on?"
      title="The board"
      goal={GOAL}
      metric={METRIC}
    >
      <Case
        title="Status"
        note="Final = chosen to build. Pick = liked in review, in the running for a test arm."
      >
        <Table
          head={['Arm', 'Status', 'What it changes', 'Judge it on']}
          rows={finals.map((variation) => [
            `${variation.id} · ${variation.title}`,
            status(variation.id),
            variation.change,
            variation.id.startsWith('S')
              ? 'Hero signup rate, D7 per visitor'
              : 'Account + extension in 7 days; signups must hold',
          ])}
        />
      </Case>
      {finals.map((variation) => (
        <Case
          key={variation.id}
          title={`${variation.id} · ${variation.title} · ${status(
            variation.id,
          )}`}
          note={variation.hypothesis}
        >
          <Shot width={LAPTOP} height={variation.scroll ? 900 : undefined}>
            {variation.render()}
          </Shot>
          {variation.renderSecond && (
            <Shot width={LAPTOP} label={variation.secondLabel}>
              {variation.renderSecond()}
            </Shot>
          )}
          <div className="w-[390px]">
            <Shot width={PHONE} label="Phone · 390" note={variation.phoneNote}>
              {variation.render()}
            </Shot>
          </div>
        </Case>
      ))}
    </Page>
  ),
};

const one = (index: number): StoryObj => ({
  name: `${finals[index].id} · ${finals[index].title}`,
  render: () => (
    <VariationPage2
      variation={finals[index]}
      chapter="Finals"
      goal={GOAL}
      metric={METRIC}
    />
  ),
});

export const F1 = one(0);
export const F2 = one(1);
export const F3 = one(2);
export const F4 = one(3);
export const F5 = one(4);
