import type { ComponentProps } from 'react';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorldBuild } from '../../components/world/WorldBuild';

const mockCopyText = jest.fn();

/* jsdom has no clipboard; the copy itself is the shared hook's business. */
jest.mock('@dailydotdev/shared/src/hooks/useCopy', () => ({
  useCopyText: () => [false, mockCopyText],
}));

type Authoring = ComponentProps<typeof WorldBuild>['authoring'];

const authoring: Authoring = {
  connected: true,
  lostContact: false,
  niche: 'rust',
  family: 'house',
  level: 9,
  errors: [],
  warnings: [],
  builds: 0,
  changes: 1,
  realms: 1,
  unsaved: 1,
  saved: 0,
  applied: true,
  show: jest.fn(),
  toggleSaved: jest.fn(),
  toggleOriginal: jest.fn(),
  revertSaved: jest.fn(),
  save: jest.fn(),
  isSaving: false,
};

const renderBuild = (
  over: Partial<Authoring> = {},
  props: Partial<
    Pick<ComponentProps<typeof WorldBuild>, 'onAppearance' | 'onClose'>
  > = {},
) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <WorldBuild
        handle="idoshamun"
        authoring={{ ...authoring, ...over }}
        onAppearance={props.onAppearance ?? jest.fn()}
        onClose={props.onClose ?? jest.fn()}
      />
    </QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('WorldBuild setup', () => {
  const idle: Partial<Authoring> = { connected: false, changes: 0, unsaved: 0 };

  it('starts listening for the agent the moment the prompt is copied', () => {
    renderBuild(idle);

    expect(
      screen.queryByText(/Listening for your agent/),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));

    expect(mockCopyText).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Listening for your agent/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy prompt again' }),
    ).toBeInTheDocument();
  });

  it('navigates back to appearance and closes from the header', () => {
    const onAppearance = jest.fn();
    const onClose = jest.fn();
    renderBuild(idle, { onAppearance, onClose });

    fireEvent.click(screen.getByRole('button', { name: 'Back to appearance' }));
    expect(onAppearance).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole('button', { name: 'Close world builder' }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('reverts the saved world only after an explicit confirmation', () => {
    renderBuild({ ...idle, saved: 2 });

    fireEvent.click(screen.getByRole('button', { name: 'Revert to original' }));
    expect(authoring.revertSaved).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Revert' }));
    expect(authoring.revertSaved).toHaveBeenCalledTimes(1);
  });

  it('lets a second thought keep the saved world', () => {
    renderBuild({ ...idle, saved: 2 });

    fireEvent.click(screen.getByRole('button', { name: 'Revert to original' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep them' }));

    expect(authoring.revertSaved).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Revert to original' }),
    ).toBeInTheDocument();
  });

  it('switches between the saved world and the original', () => {
    renderBuild({ ...idle, saved: 2 });

    fireEvent.click(screen.getByRole('button', { name: 'Original' }));
    expect(authoring.toggleOriginal).toHaveBeenCalledTimes(1);

    // The lit chip is the current state; clicking it changes nothing.
    fireEvent.click(screen.getByRole('button', { name: 'Saved world' }));
    expect(authoring.toggleOriginal).toHaveBeenCalledTimes(1);
  });

  it('offers original and revert controls only for a saved programmed world', () => {
    renderBuild(idle);

    expect(
      screen.queryByRole('button', { name: /original/ }),
    ).not.toBeInTheDocument();
  });
});

describe('WorldBuild live', () => {
  it('leads with flying to the change until it has been seen, then with saving', () => {
    renderBuild();

    const fly = screen.getByRole('button', { name: 'Fly to Rust' });
    const save = screen.getByRole('button', { name: 'Save 1 change' });
    expect(fly).toHaveClass('btn-primary');
    expect(save).not.toHaveClass('btn-primary');

    fireEvent.click(fly);
    expect(authoring.show).toHaveBeenCalledTimes(1);
    expect(save).toHaveClass('btn-primary');
    expect(fly).not.toHaveClass('btn-primary');
  });

  it('treats a watched live build as reviewed', () => {
    renderBuild({ builds: 3 });

    expect(screen.getByRole('button', { name: 'Save 1 change' })).toHaveClass(
      'btn-primary',
    );
  });

  it('blocks saving while the last change is broken', () => {
    renderBuild({ errors: ['w.box: side under minimum'] });

    expect(screen.getByText('w.box: side under minimum')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save 1 change' }),
    ).toBeDisabled();
  });

  it('names the world the map is showing while comparing', () => {
    renderBuild({ applied: false, builds: 1 });

    expect(screen.getByText('Showing saved world')).toBeInTheDocument();

    // The lit chip is the current state, so only the other one switches.
    fireEvent.click(screen.getByRole('button', { name: 'Saved world' }));
    expect(authoring.toggleSaved).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'My changes' }));
    expect(authoring.toggleSaved).toHaveBeenCalledTimes(1);
  });

  it('says the agent is gone once the connection stops being a blip', () => {
    renderBuild({ connected: false, lostContact: true });

    expect(screen.getByText('Agent disconnected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save 1 change' })).toBeEnabled();
  });

  it('hands over a fix prompt when the local project is unusable', () => {
    renderBuild({
      connectionError:
        'The local world CLI is outdated. Restart it with the latest version.',
      changes: 0,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy fix prompt' }));
    expect(mockCopyText).toHaveBeenCalledTimes(1);
  });
});
