import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import { ChecklistStep } from './ChecklistStep';
import { ChecklistStepProps } from '../../lib/checklist';
import { ActionType } from '../../graphql/actions';

const step = {
  title: 'Step 1',
  description: 'Step 1 description',
  action: {
    type: ActionType.CreateSquad,
    completedAt: null,
  },
};
const noop = jest.fn();
const customChildren = (
  <div data-testid="checklist-step-custom-component">Custom component</div>
);

describe('ChecklistStep component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = (props: ChecklistStepProps): RenderResult => {
    return render(<ChecklistStep {...props} />);
  };

  it('should render', async () => {
    renderComponent({
      step,
      isOpen: false,
      isActive: false,
      onToggle: noop,
      children: customChildren,
    });

    const title = await screen.findByText(step.title);
    expect(title).toBeInTheDocument();

    const closed = await screen.findByTestId('checklist-step-closed');
    expect(closed).toBeInTheDocument();

    const inactive = await screen.findByTestId('checklist-step-inactive');
    expect(inactive).toBeInTheDocument();

    const incomplete = await screen.findByTestId('checklist-step-incomplete');
    expect(incomplete).toBeInTheDocument();

    const description = screen.queryByText(step.description);
    expect(description).not.toBeInTheDocument();

    const customComponent = screen.queryByTestId(
      'checklist-step-custom-component',
    );
    expect(customComponent).not.toBeInTheDocument();
  });

  it('should render title, description and custom component when open', async () => {
    renderComponent({
      step,
      isOpen: true,
      isActive: false,
      onToggle: noop,
      children: customChildren,
    });

    const title = await screen.findByText(step.title);
    expect(title).toBeInTheDocument();

    const description = await screen.findByText(step.description);
    expect(description).toBeInTheDocument();

    const open = await screen.findByTestId('checklist-step-open');
    expect(open).toBeInTheDocument();

    const customComponent = await screen.findByTestId(
      'checklist-step-custom-component',
    );
    expect(customComponent).toBeInTheDocument();
  });

  it('should render active state', async () => {
    renderComponent({
      step,
      isOpen: false,
      isActive: true,
      onToggle: noop,
      children: customChildren,
    });

    const title = await screen.findByText(step.title);
    expect(title).toBeInTheDocument();

    const description = screen.queryByText(step.description);
    expect(description).not.toBeInTheDocument();

    const active = await screen.findByTestId('checklist-step-active');
    expect(active).toBeInTheDocument();

    const customComponent = screen.queryByTestId(
      'checklist-step-custom-component',
    );
    expect(customComponent).not.toBeInTheDocument();
  });

  it('should render completed state', async () => {
    renderComponent({
      step: {
        ...step,
        action: {
          ...step.action,
          completedAt: new Date(),
        },
      },
      isOpen: false,
      isActive: true,
      onToggle: noop,
      children: customChildren,
    });

    const title = await screen.findByText(step.title);
    expect(title).toBeInTheDocument();

    const description = screen.queryByText(step.description);
    expect(description).not.toBeInTheDocument();

    const completed = await screen.findByTestId('checklist-step-completed');
    expect(completed).toBeInTheDocument();

    const customComponent = screen.queryByTestId(
      'checklist-step-custom-component',
    );
    expect(customComponent).not.toBeInTheDocument();
  });

  it('should open on click', async () => {
    let isOpen = false;

    const onToggle = jest.fn(() => {
      isOpen = !isOpen;
    });

    renderComponent({
      step,
      isOpen,
      isActive: false,
      onToggle,
      children: customChildren,
    });

    const checklistElement = await screen.findByTestId('checklist-step');
    expect(checklistElement).toBeInTheDocument();

    const closed = await screen.findByTestId('checklist-step-closed');
    expect(closed).toBeInTheDocument();

    fireEvent.click(checklistElement);

    renderComponent({
      step,
      isOpen,
      isActive: false,
      onToggle,
      children: customChildren,
    });

    expect(onToggle).toHaveBeenCalledTimes(1);

    const open = await screen.findByTestId('checklist-step-open');
    expect(open).toBeInTheDocument();
  });
});
