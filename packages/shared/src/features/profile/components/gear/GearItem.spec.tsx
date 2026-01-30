import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { Gear } from '../../../../graphql/user/gear';
import { GearItem } from './GearItem';

// Mock the Tooltip component to avoid Radix UI portal issues in tests
jest.mock('../../../../components/tooltip/Tooltip', () => ({
  Tooltip: ({
    children,
    content,
  }: {
    children: React.ReactNode;
    content: string;
  }) => <span data-tooltip-content={content}>{children}</span>,
}));

const createMockGear = (name: string): Gear => ({
  id: 'gear-1',
  position: 0,
  gear: {
    id: 'dataset-gear-1',
    name,
  },
});

const renderComponent = (
  props: Partial<React.ComponentProps<typeof GearItem>> = {},
): RenderResult => {
  const defaultProps = {
    item: createMockGear('Test Gear'),
    isOwner: false,
  };
  return render(<GearItem {...defaultProps} {...props} />);
};

describe('GearItem', () => {
  it('should render gear name', async () => {
    renderComponent({ item: createMockGear('My Awesome Gear') });
    expect(await screen.findByText('My Awesome Gear')).toBeInTheDocument();
  });

  it('should render delete button when user is owner and onDelete is provided', async () => {
    const onDelete = jest.fn();
    renderComponent({ isOwner: true, onDelete });
    expect(await screen.findByLabelText('Delete gear')).toBeInTheDocument();
  });

  it('should not render delete button when user is not owner', async () => {
    renderComponent({ isOwner: false });
    expect(screen.queryByLabelText('Delete gear')).not.toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const onDelete = jest.fn();
    const item = createMockGear('Test Gear');
    renderComponent({ item, isOwner: true, onDelete });

    const deleteButton = await screen.findByLabelText('Delete gear');
    await userEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(item);
  });

  describe('tooltip', () => {
    it('should wrap gear name with tooltip containing full name', async () => {
      const longName =
        'This is a very long gear name that would typically be truncated when displayed in the UI but the full name should appear in the tooltip';
      const { container } = renderComponent({ item: createMockGear(longName) });

      // Verify the gear name is rendered
      expect(await screen.findByText(longName)).toBeInTheDocument();
      // Verify the tooltip wrapper exists with the correct content attribute
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const tooltipWrapper = container.querySelector(
        `[data-tooltip-content="${longName}"]`,
      );
      expect(tooltipWrapper).toBeInTheDocument();
    });

    it('should have tooltip content matching gear name for short names', async () => {
      const gearName = 'Short Gear Name';
      const { container } = renderComponent({ item: createMockGear(gearName) });

      // Verify the gear name is rendered
      expect(await screen.findByText(gearName)).toBeInTheDocument();
      // Verify the tooltip wrapper exists with the correct content attribute
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const tooltipWrapper = container.querySelector(
        `[data-tooltip-content="${gearName}"]`,
      );
      expect(tooltipWrapper).toBeInTheDocument();
    });
  });
});
