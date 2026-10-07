import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { getStaticProps } from '../pages/sources/[source]';

jest.mock('@dailydotdev/shared/src/graphql/common', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/common');

  return {
    ...actual,
    gqlClient: {
      request: jest.fn(),
    },
  };
});

const mockRequest = gqlClient.request as jest.Mock;

const mockSourceRequests = (noindex: boolean): void => {
  mockRequest
    .mockResolvedValueOnce({
      source: {
        id: 'bitbar',
        handle: 'bitbar',
        name: 'Bitbar',
        type: SourceType.Machine,
        permalink: 'https://daily.dev/sources/bitbar',
        noindex,
      },
    })
    .mockResolvedValueOnce({ relatedTags: { tags: [] } })
    .mockResolvedValueOnce({ page: { edges: [] } });
};

// The API computes `noindex` for inactive, private and vordr sources; the
// page used to ignore it and advertise every resolvable source as indexable.
describe('source page static props seo', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it.each([true, false])(
    'should follow the API noindex flag (%s)',
    async (noindex) => {
      mockSourceRequests(noindex);

      const result = await getStaticProps({
        params: { source: 'bitbar' },
      } as never);

      expect(result).toMatchObject({
        props: { seo: { noindex, nofollow: noindex } },
      });
    },
  );
});
