import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChecklistCardProps } from '../../lib/checklist';
import { ChecklistCard } from './ChecklistCard';
import { defaultSteps, updateStep } from '../../hooks/useChecklist.spec';

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
      content: <p>Card description</p>,
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
      content: <p>Card description</p>,
    });

    const progress = await screen.findAllByTestId('checklist-card-progress');
    expect(progress).toHaveLength(2);
  });
});
