import {
  agentCommands,
  commandQuery,
  matchCommands,
  parseCommand,
} from './commands';

describe('commandQuery', () => {
  // The composer opens its list on empty-string vs undefined, so a truthiness
  // check never opens it on a bare slash.
  it('returns an empty string for a bare slash, not undefined', () => {
    expect(commandQuery('/')).toBe('');
  });

  it('returns the partial name while it is being typed', () => {
    expect(commandQuery('/sett')).toBe('sett');
    expect(commandQuery('/activity')).toBe('activity');
  });

  it('returns undefined once the field holds anything else', () => {
    expect(commandQuery('/settings now')).toBeUndefined();
    expect(commandQuery('hello')).toBeUndefined();
    expect(commandQuery('')).toBeUndefined();
    expect(commandQuery('  /settings')).toBeUndefined();
  });
});

describe('parseCommand', () => {
  it('resolves a bare command with no arguments', () => {
    const parsed = parseCommand('/settings');

    expect(parsed?.command.name).toBe('settings');
    expect(parsed?.args).toBe('');
  });

  it('is undefined for an unknown command or plain prose', () => {
    expect(parseCommand('/nonsense')).toBeUndefined();
    expect(parseCommand('explore more please')).toBeUndefined();
    expect(parseCommand('/')).toBeUndefined();
  });

  it('tolerates surrounding whitespace', () => {
    expect(parseCommand('  /activity  ')?.command.name).toBe('activity');
  });
});

describe('matchCommands', () => {
  it('matches on the label as well as the name', () => {
    expect(matchCommands('open').map(({ name }) => name)).toContain('settings');
  });

  it('is case insensitive', () => {
    expect(matchCommands('DEBUG').map(({ name }) => name)).toEqual(['debug']);
  });

  it('returns everything for an empty query, so a bare slash lists them all', () => {
    expect(matchCommands('')).toHaveLength(agentCommands.length);
  });

  it('returns nothing when nothing matches', () => {
    expect(matchCommands('xyzzy')).toEqual([]);
  });
});

describe('the command table', () => {
  it('has unique names, since findCommand resolves by name', () => {
    const names = agentCommands.map(({ name }) => name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('only uses names the parser can actually match', () => {
    agentCommands.forEach(({ name }) => {
      expect(parseCommand(`/${name}`)?.command.name).toBe(name);
    });
  });

  it('never sends a prompt: feedback is what talks to the agent', () => {
    agentCommands.forEach(({ name, prompt, opens }) => {
      expect([name, prompt, !!opens]).toEqual([name, undefined, true]);
    });
  });
});
