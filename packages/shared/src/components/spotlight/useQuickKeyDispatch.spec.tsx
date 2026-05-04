import { renderHook } from '@testing-library/react';
import { type SpotlightCommand, SpotlightGroup, SpotlightScope } from './types';
import { useQuickKeyDispatch } from './useQuickKeyDispatch';

const NoopIcon = (): null => null;

const buildCommand = (
  id: string,
  quickKey?: string,
  perform: SpotlightCommand['perform'] = () => undefined,
): SpotlightCommand => ({
  id,
  title: id,
  icon: NoopIcon,
  group: SpotlightGroup.Settings,
  quickKey,
  perform,
});

describe('useQuickKeyDispatch', () => {
  it('fires the matching command when query is "xx "', () => {
    const onDispatch = jest.fn();
    const setQuery = jest.fn();
    const command = buildCommand('settings.theme', 'tt');

    renderHook(() =>
      useQuickKeyDispatch({
        query: 'tt ',
        setQuery,
        commands: [command],
        scope: SpotlightScope.All,
        onDispatch,
      }),
    );

    expect(setQuery).toHaveBeenCalledWith('');
    expect(onDispatch).toHaveBeenCalledWith(command);
  });

  it('does nothing when scope is not All', () => {
    const onDispatch = jest.fn();
    const setQuery = jest.fn();

    renderHook(() =>
      useQuickKeyDispatch({
        query: 'tt ',
        setQuery,
        commands: [buildCommand('settings.theme', 'tt')],
        scope: SpotlightScope.Posts,
        onDispatch,
      }),
    );

    expect(setQuery).not.toHaveBeenCalled();
    expect(onDispatch).not.toHaveBeenCalled();
  });

  it('does nothing for unknown two-letter prefixes', () => {
    const onDispatch = jest.fn();
    const setQuery = jest.fn();

    renderHook(() =>
      useQuickKeyDispatch({
        query: 'zz ',
        setQuery,
        commands: [buildCommand('settings.theme', 'tt')],
        scope: SpotlightScope.All,
        onDispatch,
      }),
    );

    expect(setQuery).not.toHaveBeenCalled();
    expect(onDispatch).not.toHaveBeenCalled();
  });

  it('does nothing for partial input (no trailing space)', () => {
    const onDispatch = jest.fn();
    const setQuery = jest.fn();

    renderHook(() =>
      useQuickKeyDispatch({
        query: 'tt',
        setQuery,
        commands: [buildCommand('settings.theme', 'tt')],
        scope: SpotlightScope.All,
        onDispatch,
      }),
    );

    expect(setQuery).not.toHaveBeenCalled();
    expect(onDispatch).not.toHaveBeenCalled();
  });

  it('only matches against commands that registered a quickKey', () => {
    const onDispatch = jest.fn();
    const setQuery = jest.fn();

    renderHook(() =>
      useQuickKeyDispatch({
        query: 'tt ',
        setQuery,
        commands: [buildCommand('settings.layout')],
        scope: SpotlightScope.All,
        onDispatch,
      }),
    );

    expect(setQuery).not.toHaveBeenCalled();
    expect(onDispatch).not.toHaveBeenCalled();
  });
});
