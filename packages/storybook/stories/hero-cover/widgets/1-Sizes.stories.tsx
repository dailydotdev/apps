import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import type { WidgetSize } from './catalog';
import { sizeLabel, sizeSpan, widgetCatalog } from './catalog';
import { WidgetGallery, WidgetPreview } from './frame';

const meta: Meta = {
  title: 'Hero Cover/Widgets/1. Sizes & catalog',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const sizes: WidgetSize[] = ['s', 'm', 'w', 'l'];

export const SizesAndCatalog: StoryObj = {
  name: '1. Sizes & catalog',
  render: () => (
    <Page
      chapter="Widgets · 1"
      question="What can a widget be?"
      title="Four sizes on the feed's own columns"
      goal="One grid unit (a feed column by half the hero's height) so every widget edge lines up with the cards below, and every widget is designed per size."
      metric="Nothing to measure: the vocabulary the directions are built from."
    >
      <Case
        title="The four sizes"
        note="Named after iOS. A five-column feed holds ten units across two half-rows."
      >
        <div className="flex flex-wrap items-end gap-8">
          {sizes.map((size) => (
            <div key={size} className="flex flex-col gap-2">
              <span className="text-text-tertiary typo-footnote">
                {sizeLabel[size]} · {sizeSpan[size].cols}×
                {sizeSpan[size].rows === 1 ? '½' : '1'}
              </span>
              <WidgetPreview
                kind={
                  size === 'l'
                    ? 'featured'
                    : size === 'w'
                    ? 'digest'
                    : size === 'm'
                    ? 'happening'
                    : 'streak'
                }
                size={size}
              />
            </div>
          ))}
        </div>
      </Case>
      <Case
        title="One widget, every size"
        note="Agent updates as it adapts: a number when small, a thread when tall, a pair when wide, a full thread when large."
      >
        <div className="flex flex-wrap items-end gap-8">
          {widgetCatalog.agents.sizes.map((size) => (
            <WidgetPreview key={size} kind="agents" size={size} />
          ))}
        </div>
      </Case>
      <Case
        title="Streak, every size"
        note="The whole v2 streak panel as a widget: the count, the same 30-day calendar the rail uses, and, as it grows, usage meters in the style of Claude's usage screen (used, of what, when it resets) and today's quests."
      >
        <div className="flex flex-wrap items-end gap-8">
          {(['s', 'm', 'w', 'l'] as const).map((size) => (
            <WidgetPreview key={size} kind="streak" size={size} />
          ))}
        </div>
      </Case>
      <Case
        title="The catalog"
        note="Everything on our list, plus ideas marked Idea. The gallery is how a reader adds them."
      >
        <WidgetGallery className="max-w-[48rem]" />
      </Case>
    </Page>
  ),
};
