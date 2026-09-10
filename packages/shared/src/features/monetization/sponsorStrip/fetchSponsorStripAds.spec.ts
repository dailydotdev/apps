import { apiUrl } from '../../../lib/config';
import { fetchSponsorStripAds } from './fetchSponsorStripAds';
import { parseSponsors } from './sponsorStripCreative';

const bar = {
  type: 'ADVERTISER_BAR',
  generation_id: 'bar-1',
  value: {
    advertiser_bar: {
      pinned: [
        {
          company_name: 'DataDog',
          icon: 'https://business.daily.dev/assets/company-logos/datadog.svg',
          link: 'https://api.daily.dev/v2/c?id=token',
          generation_id: 'c4d14255-21bc-406b-ba29-e0393ac76d01',
          pixels: ['https://api.daily.dev/v2/p?id=token'],
        },
      ],
      top_tier: [],
      community: [],
    },
  },
};

const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch;
  mockFetch.mockResolvedValue({ json: async () => bar });
});

const requestedUrl = (): string => mockFetch.mock.calls[0][0] as string;

// The `/v1/a` paths the other placements use are three hardcoded aliases on the
// ad server; the bar only exists on `/v2/a/:placement`, and asking the wrong
// one 404s into an empty row instead of failing loudly — so the path is worth
// pinning.
it('should ask the ad server for the bar by its placement name', async () => {
  await fetchSponsorStripAds();

  expect(requestedUrl()).toEqual(`${apiUrl}/v2/a/advertiser_bar`);
});

it('should send the reader consent along with the request', async () => {
  await fetchSponsorStripAds({
    gdprApplies: true,
    consentString: 'CONSENT',
    addtlConsent: 'ADDTL',
  });

  const { searchParams } = new URL(requestedUrl(), 'https://daily.dev');

  expect(searchParams.get('gdpr')).toEqual('1');
  expect(searchParams.get('gdpr_consent')).toEqual('CONSENT');
  expect(searchParams.get('addtl_consent')).toEqual('ADDTL');
});

it('should carry the reader cookie, which is how the ad server knows them', async () => {
  await fetchSponsorStripAds();

  expect(mockFetch.mock.calls[0][1]).toEqual(
    expect.objectContaining({ credentials: 'include' }),
  );
});

it('should hand the response back in the shape the row parses', async () => {
  const sponsors = parseSponsors(await fetchSponsorStripAds());

  expect(sponsors.map(({ company_name: company }) => company)).toEqual([
    'DataDog',
  ]);
});
