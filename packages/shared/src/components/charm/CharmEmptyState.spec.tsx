import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharmEmptyState } from './CharmEmptyState';

const renderComponent = (props = {}) =>
  render(
    <CharmEmptyState
      image="https://media.daily.dev/charm.png"
      imageAlt="charm"
      title="No comments yet"
      description="Be the first to comment."
      {...props}
    />,
  );

describe('CharmEmptyState', () => {
  it('renders the charm illustration, title and description', () => {
    renderComponent();

    expect(screen.getByAltText('charm')).toBeInTheDocument();
    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    expect(screen.getByText('Be the first to comment.')).toBeInTheDocument();
  });

  it('stays message-only when no action is provided', () => {
    renderComponent();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the action and triggers onClick', () => {
    const onClick = jest.fn();
    renderComponent({ action: { label: 'Add comment', onClick } });

    const button = screen.getByRole('button', { name: 'Add comment' });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
