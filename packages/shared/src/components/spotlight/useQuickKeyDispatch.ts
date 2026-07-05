import { useEffect, useRef } from 'react';
import { type SpotlightCommand, SpotlightScope } from './types';

interface UseQuickKeyDispatchOptions {
  /** Live input value (raw, unmodified). */
  query: string;
  /** Setter that clears the input once a quick key fires. */
  setQuery: (value: string) => void;
  /** All currently registered commands. */
  commands: SpotlightCommand[];
  /** Active scope. Quick keys are no-ops while a scope is active. */
  scope: SpotlightScope;
  /** Fires the matched command. */
  onDispatch: (command: SpotlightCommand) => void;
}

const QUICK_KEY_PATTERN = /^([a-z]{2}) $/;

/**
 * Apple-Tahoe-style "Quick Keys" dispatcher. Watching the input value, this
 * hook fires a command immediately when:
 *   1. The active scope is `All` (preserving the input for scoped search).
 *   2. The query exactly matches `xx ` (two lowercase letters then a space).
 *   3. A registered command's `quickKey` equals the two-letter prefix.
 *
 * The input is cleared and the command runs. Otherwise the user keeps typing
 * normally; this is non-disruptive.
 */
export const useQuickKeyDispatch = ({
  query,
  setQuery,
  commands,
  scope,
  onDispatch,
}: UseQuickKeyDispatchOptions): void => {
  const onDispatchRef = useRef(onDispatch);
  onDispatchRef.current = onDispatch;
  const setQueryRef = useRef(setQuery);
  setQueryRef.current = setQuery;

  useEffect(() => {
    if (scope !== SpotlightScope.All) {
      return;
    }
    const match = QUICK_KEY_PATTERN.exec(query);
    if (!match) {
      return;
    }
    const key = match[1];
    const command = commands.find((cmd) => cmd.quickKey === key);
    if (!command) {
      return;
    }
    setQueryRef.current('');
    onDispatchRef.current(command);
  }, [query, commands, scope]);
};
