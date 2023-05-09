import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import { ChecklistCardProps } from '../../lib/checklist';
import { ChecklistCard } from './ChecklistCard';
import { defaultSteps, updateStep } from '../../hooks/useChecklist.spec';

const noop = jest.fn();

describe('ChecklistCard component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = (props: ChecklistCardProps): RenderResult => {
    return render(<ChecklistCard {...props} />);
  };

  it('should render', async () => {
    const steps = [...defaultSteps];

    renderComponent({
      steps,
      title: 'Card title',
      description: 'Card description',
    });

    const title = await screen.findByTestId('checklist-card-title');
    expect(title).toBeInTheDocument();

    const description = await screen.findByTestId('checklist-card-description');
    expect(description).toBeInTheDocument();

    const progress = await screen.findAllByTestId('checklist-card-progress');
    expect(progress).toHaveLength(3);

    const closeButton = screen.queryByTestId('checklist-card-close-button');
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

    const closeButton = await screen.findByTestId(
      'checklist-card-close-button',
    );
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

    const closeButton = await screen.findByTestId(
      'checklist-card-close-button',
    );
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(noop).toHaveBeenCalledTimes(1);
  });
});
