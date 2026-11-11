import { toSquadHandle } from './handle';

describe('toSquadHandle', () => {
  it('should turn a company name into a valid handle', () => {
    expect(toSquadHandle('Acme')).toBe('acme');
    expect(toSquadHandle('Acme Labs, Inc.')).toBe('acme_labs_inc');
    expect(toSquadHandle('Café.io')).toBe('cafe_io');
  });

  it('should pad names shorter than the minimum', () => {
    expect(toSquadHandle('AI')).toBe('ai_hq');
    expect(toSquadHandle('!!')).toBe('my_hq');
  });

  it('should leave room for a number suffix', () => {
    expect(toSquadHandle('a'.repeat(60)).length).toBeLessThanOrEqual(37);
  });
});
