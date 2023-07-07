import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChecklistCardProps } from '../../lib/checklist';
import { ChecklistCard } from './ChecklistCard';
import { defaultSteps, updateStep } from '../../hooks/useChecklist.spec';

const noop = jest.fn();

describe('ChecklistCard component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = (props: ChecklistCardProps): RenderResult => {
    const client = new QueryClient();
    return render(
      <QueryClientProvider client={client}>
        <ChecklistCard {...props} />
      </QueryClientProvider>,
    );
  };

  it('should render', async () => {
    const steps = [...defaultSteps];

    renderComponent({
      steps,
      title: 'Card title',
      description: 'Card description',
    });

    const title = await screen.findByText('Card title');
    expect(title).toBeInTheDocument();

    const description = await screen.findByText('Card description');
    expect(description).toBeInTheDocument();

    const progress = await screen.findAllByTestId('checklist-card-progress');
    expect(progress).toHaveLength(3);

    const closeButton = screen.queryByTitle('Close');
    expect(closeButton).not.toBeInTheDocument();

    const stepElements = await screen.findAllByTestId('checklist-step');
    expect(stepElements).toHaveLength(3);
  });

  it('should render progress correctly based on completed steps', async () => {
    const steps = updateStep(defaultSteps, 0, {
      action: {
        completedAt: null,
      },
    });

    renderComponent({
      steps,
      title: 'Card title',
      description: 'Card description',
    });

    const progress = await screen.findAllByTestId('checklist-card-progress');
    expect(progress).toHaveLength(2);
  });

  it('should not render close button if onRequestClose is provided', async () => {
    const steps = [...defaultSteps];

    renderComponent({
      steps,
      title: 'Card title',
      description: 'Card description',
      onRequestClose: noop,
    });

    const closeButton = await screen.findByTitle('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onRequestClose on close button click', async () => {
    const steps = [...defaultSteps];

    renderComponent({
      steps,
      title: 'Card title',
      description: 'Card description',
      onRequestClose: noop,
    });

    const closeButton = await screen.findByTitle('Close');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(noop).toHaveBeenCalledTimes(1);
  });
});
