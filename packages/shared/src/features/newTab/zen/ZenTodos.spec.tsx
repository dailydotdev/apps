import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ZenTodos } from './ZenTodos';

const renderTodos = () => {
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client}>
      <ZenTodos />
    </TestBootProvider>,
  );
};

describe('ZenTodos', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the empty-state CTA', () => {
    renderTodos();
    expect(screen.getByText('Add your first task')).toBeInTheDocument();
  });

  it('adds a new todo on Enter and persists it', () => {
    renderTodos();
    fireEvent.click(screen.getByText('Add your first task'));
    const input = screen.getByLabelText('New task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Ship Zen layout' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Ship Zen layout')).toBeInTheDocument();
    expect(window.localStorage.getItem('newtab:zen:todos')).toContain(
      'Ship Zen layout',
    );
  });

  it('toggles a todo to done and strikes it through', () => {
    window.localStorage.setItem(
      'newtab:zen:todos',
      JSON.stringify([{ id: 'a', text: 'Focus', done: false }]),
    );
    renderTodos();
    const checkbox = screen.getAllByTestId('checkbox-input')[0];
    fireEvent.click(checkbox);
    const stored = JSON.parse(
      window.localStorage.getItem('newtab:zen:todos') as string,
    );
    expect(stored[0].done).toBe(true);
  });

  it('caps the list at five todos', () => {
    const preload = Array.from({ length: 5 }).map((_, index) => ({
      id: `id-${index}`,
      text: `Task ${index}`,
      done: false,
    }));
    window.localStorage.setItem('newtab:zen:todos', JSON.stringify(preload));
    renderTodos();
    expect(screen.queryByText('Add task')).not.toBeInTheDocument();
  });
});
