import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSectionItem } from './ProfileSectionItem';

// Mock the OpenLinkIcon component
jest.mock('../icons', () => ({
  OpenLinkIcon: () => <span data-testid="open-link-icon" />,
}));

const defaultProps = {
  title: 'Test Item',
};

describe('ProfileSectionItem', () => {
  it('should render correctly with just a title', () => {
    render(<ProfileSectionItem {...defaultProps} />);
    const item = screen.getByText('Test Item');
    expect(item).toBeInTheDocument();
  });

  it('should use Typography with button tag when no href is provided', () => {
    render(<ProfileSectionItem {...defaultProps} />);
    // Check for the button element that wraps our Typography content
    const item = screen.getByRole('button');
    expect(item).toBeInTheDocument();
  });

  it('should use Typography with Link tag when href is provided', () => {
    render(<ProfileSectionItem {...defaultProps} href="/test" />);
    // Check for the anchor element that wraps our Typography content
    const item = screen.getByRole('link');
    expect(item).toBeInTheDocument();
  });

  it('should apply the custom className', () => {
    render(<ProfileSectionItem {...defaultProps} className="custom-class" />);
    // We can't directly test for className with getByRole,
    // so we'll use the test-id pattern instead
    const item = screen.getByRole('button');
    expect(item).toHaveClass('custom-class');
  });

  it('should render an icon when provided', () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(<ProfileSectionItem {...defaultProps} icon={icon} />);
    const renderedIcon = screen.getByTestId('test-icon');
    expect(renderedIcon).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<ProfileSectionItem {...defaultProps} onClick={onClick} />);
    const item = screen.getByText('Test Item');
    fireEvent.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render external link properties when external is true', async () => {
    render(
      <ProfileSectionItem
        {...defaultProps}
        href="https://example.com"
        external
      />,
    );

    // The target and rel attributes are on the Typography component which renders as an <a>
    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel');

    // Check for OpenLinkIcon for external links
    const linkIcon = screen.getByTestId('open-link-icon');
    expect(linkIcon).toBeInTheDocument();
  });

  it('should not have external link properties when external is false', async () => {
    render(<ProfileSectionItem {...defaultProps} href="/internal-link" />);

    // The target and rel attributes would be on the Typography component which renders as an <a>
    const link = await screen.findByRole('link');
    expect(link).not.toHaveAttribute('target');

    // Should not have the open link icon
    const linkIcon = screen.queryByTestId('open-link-icon');
    expect(linkIcon).not.toBeInTheDocument();
  });
});
