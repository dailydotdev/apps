import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormInputCheckboxGroup } from './FormInputCheckboxGroup';

const mockOptions = [
  {
    label: 'Option 1',
    value: 'option1',
    image: { src: 'image1.jpg', alt: 'Option 1 Image' },
  },
  {
    label: 'Option 2',
    value: 'option2',
  },
  {
    label: 'Option 3',
    value: 'option3',
  },
];

describe('FormInputCheckboxGroup', () => {
  it('renders with default props', () => {
    render(<FormInputCheckboxGroup name="test-group" options={mockOptions} />);

    // Check if all options are rendered
    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });

    // Check if buttons have correct attributes
    const buttons = screen.getAllByRole('checkbox');
    expect(buttons).toHaveLength(mockOptions.length);
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('name', 'test-group');
      expect(button).toHaveValue(mockOptions[index].value);
      expect(button).toHaveAttribute('aria-checked', 'false');
    });
  });

  it('handles selection correctly', () => {
    const onValueChange = jest.fn();
    render(
      <FormInputCheckboxGroup
        name="test-group"
        options={mockOptions}
        onValueChange={onValueChange}
      />,
    );

    // Click first option
    const firstOption = screen.getByText('Option 1');
    fireEvent.click(firstOption);

    // Check if onValueChange was called with correct value
    expect(onValueChange).toHaveBeenCalledWith(['option1']);

    // Click second option
    const secondOption = screen.getByText('Option 2');
    fireEvent.click(secondOption);

    // Check if onValueChange was called with both values
    expect(onValueChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('handles controlled input correctly', () => {
    const value = ['option1'];
    render(
      <FormInputCheckboxGroup
        name="test-group"
        options={mockOptions}
        value={value}
      />,
    );

    // Check if first option is selected
    const firstOption = screen.getByLabelText('Option 1');
    expect(firstOption).toBeChecked();

    // Check if other options are not selected
    const otherOptions = screen.getAllByRole('checkbox').slice(1);
    otherOptions.forEach((option) => {
      expect(option).not.toBeChecked();
    });
  });

  it('renders with custom number of columns', () => {
    const cols = 2;
    render(
      <FormInputCheckboxGroup
        name="test-group"
        options={mockOptions}
        cols={cols}
      />,
    );

    // Check if grid has correct number of columns
    const container = screen.getByRole('group');
    expect(container).toHaveClass(`grid-cols-${cols}`);
  });

  it('renders with default value', () => {
    const defaultValue = ['option1'];
    render(
      <FormInputCheckboxGroup
        name="test-group"
        options={mockOptions}
        defaultValue={defaultValue}
      />,
    );

    // Check if default value is selected
    const firstOption = screen.getByLabelText('Option 1');
    expect(firstOption).toBeChecked();
  });
});
