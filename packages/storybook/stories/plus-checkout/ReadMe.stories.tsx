import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Markdown } from './docs/Markdown';
import readme from './README.md?raw';
import spec from './IMPLEMENTATION.md?raw';
import coverage from './docs/COVERAGE.md?raw';

const meta: Meta = {
  title: 'Plus Checkout/0. Read me',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const Doc = ({ source }: { source: string }) => (
  <div className="mx-auto max-w-4xl p-6 pb-24 text-text-primary">
    <Markdown source={source} />
  </div>
);

export const Overview: StoryObj = { name: 'Overview', render: () => <Doc source={readme} /> };
export const Spec: StoryObj = { name: 'Implementation spec', render: () => <Doc source={spec} /> };
export const Coverage: StoryObj = { name: 'Coverage: production vs new', render: () => <Doc source={coverage} /> };
