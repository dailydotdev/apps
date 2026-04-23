import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ZenIntention } from './ZenIntention';

const renderIntention = () => {
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client}>
      <ZenIntention />
    </TestBootProvider>,
  );
};

describe('ZenIntention', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts in edit mode when no intention is stored', () => {
    renderIntention();
    expect(screen.getByLabelText("Today's focus")).toBeInTheDocument();
  });

  it('persists an intention committed with Enter', () => {
    renderIntention();
    const input = screen.getByLabelText("Today's focus") as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Ship it' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('Ship it')).toBeInTheDocument();
    const stored = JSON.parse(
      window.localStorage.getItem('newtab:zen:intention') as string,
    );
    expect(stored.text).toBe('Ship it');
  });

  it('ignores a stored intention from a different day', () => {
    window.localStorage.setItem(
      'newtab:zen:intention',
      JSON.stringify({ text: 'Yesterday goal', date: '2000-01-01' }),
    );
    renderIntention();
    expect(screen.queryByText('Yesterday goal')).not.toBeInTheDocument();
    expect(screen.getByLabelText("Today's focus")).toBeInTheDocument();
  });
});
