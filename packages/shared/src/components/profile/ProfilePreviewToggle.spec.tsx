import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfilePreviewToggle } from './ProfilePreviewToggle';

describe('ProfilePreviewToggle', () => {
  it('should render the toggle with correct label and description', () => {
    const mockToggle = jest.fn();

    render(
      <ProfilePreviewToggle isPreviewMode={false} onToggle={mockToggle} />,
    );

    expect(
      screen.getByText('Preview mode', { selector: 'p' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('See how your profile looks to others'),
    ).toBeInTheDocument();
  });

  it('should call onToggle when switch is clicked', () => {
    const mockToggle = jest.fn();

    render(
      <ProfilePreviewToggle isPreviewMode={false} onToggle={mockToggle} />,
    );

    const switchElement = screen.getByRole('checkbox');
    fireEvent.click(switchElement);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('should be checked when isPreviewMode is true', () => {
    const mockToggle = jest.fn();

    render(<ProfilePreviewToggle isPreviewMode onToggle={mockToggle} />);

    const switchElement = screen.getByRole('checkbox') as HTMLInputElement;
    expect(switchElement.checked).toBe(true);
  });

  it('should be unchecked when isPreviewMode is false', () => {
    const mockToggle = jest.fn();

    render(
      <ProfilePreviewToggle isPreviewMode={false} onToggle={mockToggle} />,
    );

    const switchElement = screen.getByRole('checkbox') as HTMLInputElement;
    expect(switchElement.checked).toBe(false);
  });
});
