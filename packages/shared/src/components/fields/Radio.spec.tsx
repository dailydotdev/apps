import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from './Radio';

describe('Radio', () => {
  it('should call onChange when selecting an option without a value', async () => {
    const onChange = jest.fn();

    render(
      <Radio
        name="feed-range"
        options={[{ label: 'All time' }, { label: 'Past week', value: '7' }]}
        value="7"
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'All time' }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('should mark the option without a value as checked when value is undefined', () => {
    render(
      <Radio
        name="feed-range"
        options={[{ label: 'All time' }, { label: 'Past week', value: '7' }]}
        value={undefined}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: 'All time' })).toBeChecked();
  });
});
