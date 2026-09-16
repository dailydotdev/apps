import { resolveAdUtm } from './useAdUtm';

const QUORA_UTM = {
  source: 'quora',
  medium: 'cpc',
  campaign: 'traffic_general_202608',
  content: 'text_v1',
};

describe('resolveAdUtm', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('reads utm params from the url and persists them for the session', () => {
    expect(
      resolveAdUtm(
        '?utm_source=quora&utm_medium=cpc&utm_campaign=traffic_general_202608&utm_content=text_v1',
      ),
    ).toEqual(QUORA_UTM);
    expect(resolveAdUtm('')).toEqual(QUORA_UTM);
  });

  it('returns nothing without utm params or a stored session', () => {
    expect(resolveAdUtm('?foo=bar')).toBeUndefined();
  });
});
