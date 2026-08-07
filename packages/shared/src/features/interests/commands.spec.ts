import {
  agentCommands,
  commandQuery,
  findCommand,
  matchCommands,
  parseCommand,
  quickCommandNames,
} from './commands';

describe('commandQuery', () => {
  // The composer opens the command list on `undefined` vs empty-string, so a
  // caller that checks truthiness silently never opens it on a bare slash.
  it('returns an empty string for a bare slash, not undefined', () => {
    expect(commandQuery('/')).toBe('');
  });

  it('returns the partial name while it is being typed', () => {
    expect(commandQuery('/expl')).toBe('expl');
    expect(commandQuery('/raise-bar')).toBe('raise-bar');
  });

  it('returns undefined once the field holds anything else', () => {
    expect(commandQuery('/explore zig')).toBeUndefined();
    expect(commandQuery('hello')).toBeUndefined();
    expect(commandQuery('')).toBeUndefined();
    expect(commandQuery('  /explore')).toBeUndefined();
  });
});

describe('parseCommand', () => {
  it('resolves a bare command with no arguments', () => {
    const parsed = parseCommand('/recap');

    expect(parsed?.command.name).toBe('recap');
    expect(parsed?.args).toBe('');
  });

  it('passes everything after the name through as arguments', () => {
    const parsed = parseCommand('/explore  comptime and allocators ');

    expect(parsed?.command.name).toBe('explore');
    expect(parsed?.args).toBe('comptime and allocators');
  });

  it('handles a hyphenated name', () => {
    expect(parseCommand('/raise-bar only benchmarks')?.command.name).toBe(
      'raise-bar',
    );
  });

  it('keeps newlines inside the arguments', () => {
    expect(parseCommand('/write a post\nwith two paragraphs')?.args).toBe(
      'a post\nwith two paragraphs',
    );
  });

  it('is undefined for an unknown command or plain prose', () => {
    expect(parseCommand('/nonsense')).toBeUndefined();
    expect(parseCommand('explore more please')).toBeUndefined();
    expect(parseCommand('/')).toBeUndefined();
  });

  it('tolerates surrounding whitespace', () => {
    expect(parseCommand('  /recap  ')?.command.name).toBe('recap');
  });
});

describe('matchCommands', () => {
  it('matches on the label as well as the name', () => {
    expect(matchCommands('post').map(({ name }) => name)).toContain('write');
  });

  it('is case insensitive', () => {
    expect(matchCommands('RECAP').map(({ name }) => name)).toEqual(['recap']);
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

  it('gives every command exactly one job: a prompt to send or a pane to open', () => {
    agentCommands.forEach(({ name, prompt, opens }) => {
      expect([name, !!prompt !== !!opens]).toEqual([name, true]);
    });
  });

  it('writes a non-empty prompt with and without arguments', () => {
    agentCommands.forEach(({ name, prompt }) => {
      if (!prompt) {
        return;
      }

      expect([name, prompt('').length > 0]).toEqual([name, true]);
      expect([name, prompt('zig').length > 0]).toEqual([name, true]);
    });
  });

  it('offers only real commands as quick buttons', () => {
    quickCommandNames.forEach((name) => {
      expect(findCommand(name)?.name).toBe(name);
    });
  });

  it('gives every argument-taking command something to say about it', () => {
    agentCommands
      .filter(({ hint }) => hint)
      .forEach(({ name, ask }) => {
        expect([name, !!ask]).toEqual([name, true]);
      });
  });
});
