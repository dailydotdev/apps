import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AcquisitionFormGrid } from '@dailydotdev/shared/src/components/cards/AcquisitionForm/AcquisitionFormGrid';
import { AcquisitionFormList } from '@dailydotdev/shared/src/components/cards/AcquisitionForm/AcquisitionFormList';
import type { AcquisitionFormProps } from '@dailydotdev/shared/src/components/cards/AcquisitionForm/common/AcquisitionFormInner';
import ExtensionProviders from '../../../extension/_providers';
import {
  LIMIT_ANSWER,
  SAMPLE_ANSWER,
  saveHandler,
  SaveReport,
  typeAnswer,
  useIsPhone,
} from './harness';

/**
 * The feed's acquisition card (shown once, from the `?ua=` link) with
 * `answerStyle: 'open'`. The feed renders the grid card from tablet up and the
 * list card on phones; "In a feed" follows the viewport the same way. The
 * card does not autofocus: it is one slot in a feed, not the whole screen.
 */

type Layout = 'grid' | 'list' | 'feed';

interface CardArgs extends Required<AcquisitionFormProps> {
  layout: Layout;
}

const Placeholder = ({ isList }: { isList?: boolean }): ReactElement => (
  <div
    aria-hidden
    className={
      isList
        ? 'flex h-36 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4'
        : 'flex min-h-card flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4'
    }
  >
    <div className="h-4 w-3/4 rounded-8 bg-surface-float" />
    <div className="h-4 w-1/2 rounded-8 bg-surface-float" />
    {!isList && <div className="mt-auto h-40 rounded-12 bg-surface-float" />}
  </div>
);

const InFeed = ({ answerStyle }: AcquisitionFormProps): ReactElement => {
  const isPhone = useIsPhone();

  if (isPhone) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <AcquisitionFormList answerStyle={answerStyle} />
        <Placeholder isList />
        <Placeholder isList />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-8 p-8 laptop:grid-cols-3 laptopL:grid-cols-4 laptopXL:grid-cols-5 desktop:grid-cols-6">
      <AcquisitionFormGrid answerStyle={answerStyle} />
      {Array.from({ length: 11 }, (_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Placeholder key={index} />
      ))}
    </div>
  );
};

const CardStory = ({ answerStyle, layout }: CardArgs): ReactElement => (
  <ExtensionProviders>
    <SaveReport>
      {() => (
        <div className="min-h-dvh bg-background-default">
          {layout === 'feed' && <InFeed answerStyle={answerStyle} />}
          {layout === 'grid' && (
            <div className="flex p-8">
              <div className="flex min-h-card w-[20rem]">
                <AcquisitionFormGrid answerStyle={answerStyle} />
              </div>
            </div>
          )}
          {layout === 'list' && (
            <div className="mx-auto max-w-[40rem] p-4">
              <AcquisitionFormList answerStyle={answerStyle} />
            </div>
          )}
        </div>
      )}
    </SaveReport>
  </ExtensionProviders>
);

const meta: Meta<CardArgs> = {
  title: 'Features/Onboarding/Acquisition open field/2. Feed card',
  component: CardStory,
  args: { answerStyle: 'open', layout: 'grid' },
  argTypes: {
    answerStyle: {
      control: 'inline-radio',
      options: ['open', 'list'],
      labels: { open: 'New: open field', list: 'Today: channel list' },
    },
    layout: { control: 'inline-radio', options: ['grid', 'list', 'feed'] },
  },
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [saveHandler()] },
  },
  render: (args) => <CardStory {...args} />,
};

export default meta;

type Story = StoryObj<CardArgs>;

const submitButton = (canvasElement: HTMLElement) =>
  within(canvasElement).findByRole('button', { name: 'Submit' });

export const GridEmpty: Story = {
  name: 'Grid: empty',
  play: async ({ canvasElement }) => {
    await expect(await submitButton(canvasElement)).toBeDisabled();
  },
};

export const GridFilled: Story = {
  name: 'Grid: filled',
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
  },
};

export const GridAtLimit: Story = {
  name: 'Grid: at the limit',
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, LIMIT_ANSWER);
  },
};

export const GridSaving: Story = {
  name: 'Grid: saving',
  parameters: { msw: { handlers: [saveHandler({ latency: 'infinite' })] } },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await userEvent.click(await submitButton(canvasElement));
  },
};

export const GridSubmitted: Story = {
  name: 'Grid: submitted (card closes)',
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await userEvent.keyboard('{Enter}');
    await within(canvasElement).findByTestId('save-report');
  },
};

export const ListEmpty: Story = {
  name: 'List: empty',
  args: { layout: 'list' },
};

export const ListFilled: Story = {
  name: 'List: filled',
  args: { layout: 'list' },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
  },
};

export const ListAtLimit: Story = {
  name: 'List: at the limit',
  args: { layout: 'list' },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, LIMIT_ANSWER);
  },
};

export const InAFeed: Story = {
  name: 'In a feed (list on phones, grid from tablet)',
  args: { layout: 'feed' },
};

export const InAFeedFilled: Story = {
  name: 'In a feed, filled',
  args: { layout: 'feed' },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
  },
};

export const GridToday: Story = {
  name: 'Today: grid list (for comparison)',
  args: { answerStyle: 'list' },
};

export const ListToday: Story = {
  name: 'Today: list card (for comparison)',
  args: { answerStyle: 'list', layout: 'list' },
};
