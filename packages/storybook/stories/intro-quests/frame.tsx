import type { ComponentType, ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { Scenario } from './sim';
import { SimProvider, scenarioLabels } from './sim';
import { Stage } from './kit';

export type Device = 'desktop' | 'mobile';

export interface FrameArgs {
  scenario: Scenario;
  device: Device;
}

export const frameMetaBase: Omit<Meta<FrameArgs>, 'title'> = {
  parameters: { layout: 'fullscreen' },
  args: { scenario: 'fresh', device: 'desktop' },
  argTypes: {
    scenario: {
      control: 'select',
      options: Object.keys(scenarioLabels),
      labels: scenarioLabels,
    },
    device: { control: 'inline-radio', options: ['desktop', 'mobile'] },
  },
};

export interface VariantInfo {
  label: string;
  name: string;
  thesis: string;
  basedOn?: string;
  tryThis: string[];
  Component: ComponentType<{ device?: Device }>;
  placement?: 'center' | 'popover' | 'dock';
}

const Frame = ({
  info,
  scenario,
  device,
}: {
  info: VariantInfo;
  scenario: Scenario;
  device: Device;
}): ReactElement => {
  const [run, setRun] = useState(0);
  const { Component } = info;

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-background-default px-6 py-8 text-text-primary tablet:px-10">
      <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-5">
        <header className="flex flex-col gap-3 laptop:flex-row laptop:items-end laptop:justify-between">
          <div className="flex max-w-[44rem] flex-col gap-1">
            <p className="font-bold text-text-tertiary typo-footnote">
              {info.label} · {scenarioLabels[scenario]}
            </p>
            <h1 className="font-bold typo-title2">{info.name}</h1>
            <p className="text-text-secondary typo-callout">{info.thesis}</p>
            {info.basedOn && (
              <p className="text-text-tertiary typo-footnote">
                Based on: {info.basedOn}
              </p>
            )}
            <ul className="mt-1 flex flex-col gap-0.5 text-text-tertiary typo-footnote">
              {info.tryThis.map((item) => (
                <li key={item}>→ {item}</li>
              ))}
            </ul>
          </div>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() => setRun((value) => value + 1)}
          >
            Reset scenario
          </Button>
        </header>
        <SimProvider key={`${scenario}-${run}`} scenario={scenario}>
          <Stage device={device} placement={info.placement}>
            <Component device={device} />
          </Stage>
        </SimProvider>
      </div>
    </div>
  );
};

export const variantStory = (
  info: VariantInfo,
  storyName = `${info.label.split(' ').pop()} · ${info.name}`,
): StoryObj<FrameArgs> => ({
  name: storyName,
  render: ({ scenario, device }) => (
    <Frame info={info} scenario={scenario} device={device} />
  ),
});
