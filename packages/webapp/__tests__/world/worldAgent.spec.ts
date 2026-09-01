import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getWorldAgentGuideUrl,
  promptForWorldAgent,
} from '../../components/world/worldAgent';

describe('world coding agent handoff', () => {
  it('builds the guide URL from the configured webapp origin', () => {
    expect(getWorldAgentGuideUrl('https://daily.dev')).toBe(
      'https://daily.dev/app/world-agent.md',
    );
    expect(
      getWorldAgentGuideUrl('/', 'https://app.staging.daily.dev:5002'),
    ).toBe('https://app.staging.daily.dev:5002/app/world-agent.md');
  });

  it('gives the agent ownership of setup without choosing a district for it', () => {
    const prompt = promptForWorldAgent({
      handle: 'idoshamun',
      currentOrigin: 'https://app.staging.daily.dev:5002',
    });

    expect(prompt).toContain(
      'Read and follow https://app.staging.daily.dev:5002/app/world-agent.md',
    );
    expect(prompt).toContain('My daily.dev handle is idoshamun.');
    expect(prompt).not.toContain('session');
    expect(prompt).toContain('Create one reusable object set per realm.');
    expect(prompt).toContain('Do not ask me to install');
    expect(prompt).not.toContain('--district');
  });

  it('keeps the complete workflow in one webapp-owned guide', () => {
    const guide = readFileSync(
      join(__dirname, '../../public/app/world-agent.md'),
      'utf8',
    );

    expect(guide).toContain('world-cli@latest inspect <handle> --json');
    expect(guide).toContain('world-cli@latest dev <handle>');
    expect(guide).not.toContain('--session');
    expect(guide).toContain('--realm <realm-id>');
    expect(guide).toContain('`landmark`');
    expect(guide).toContain('zoomed-out realm island');
    expect(guide).toContain('## Realm briefs');
    expect(guide).toContain('One project can author the whole world');
    expect(guide).not.toContain('The Great Loom');
    expect(guide).not.toContain('AGENTS.md');
  });
});
