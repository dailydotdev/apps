import { ADSENSE_UTM_CHANNELS, getAdsenseUtmChannel } from './adsense';
import { resolveAdsenseUtm } from './useAdsenseUtmChannel';

const QUORA_UTM = {
  source: 'quora',
  medium: 'cpc',
  campaign: 'traffic_general_202608',
  content: 'text_v1',
};

describe('getAdsenseUtmChannel', () => {
  it('joins one channel id per mapped utm dimension', () => {
    expect(getAdsenseUtmChannel({ ...QUORA_UTM, source: 'Quora' })).toBe(
      [
        ADSENSE_UTM_CHANNELS.source.quora,
        ADSENSE_UTM_CHANNELS.medium.cpc,
        ADSENSE_UTM_CHANNELS.campaign.traffic_general_202608,
        ADSENSE_UTM_CHANNELS.content.text_v1,
      ].join(','),
    );
  });

  it('drops values without a mapped channel', () => {
    expect(getAdsenseUtmChannel({ source: 'quora', campaign: 'x' })).toBe(
      ADSENSE_UTM_CHANNELS.source.quora,
    );
    expect(getAdsenseUtmChannel({ source: 'unknown' })).toBeUndefined();
    expect(getAdsenseUtmChannel({})).toBeUndefined();
  });
});

describe('resolveAdsenseUtm', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('reads utm params from the url and persists them for the session', () => {
    expect(
      resolveAdsenseUtm(
        '?utm_source=quora&utm_medium=cpc&utm_campaign=traffic_general_202608&utm_content=text_v1',
      ),
    ).toEqual(QUORA_UTM);
    expect(resolveAdsenseUtm('')).toEqual(QUORA_UTM);
  });

  it('returns nothing without utm params or a stored session', () => {
    expect(resolveAdsenseUtm('?foo=bar')).toBeUndefined();
  });
});
