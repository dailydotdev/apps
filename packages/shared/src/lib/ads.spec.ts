import ad from '../../__tests__/fixture/ad';
import { AdPlacement, fetchAdByPlacement, resolveAdFetchOptions } from './ads';

describe('ads', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([ad]),
      headers: {
        get: (name: string) =>
          name === 'x-generation-id' ? 'gen-123' : undefined,
      },
    } as unknown as Response) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('resolveAdFetchOptions', () => {
    it('should enable boost flags for feed placements', () => {
      expect(
        resolveAdFetchOptions({
          placement: AdPlacement.Feed,
          active: true,
          boostsEnabled: true,
        }),
      ).toEqual({
        placement: AdPlacement.Feed,
        active: true,
        allowPostBoost: true,
        allowSquadBoost: true,
      });
    });

    it('should keep comment placement minimal', () => {
      expect(
        resolveAdFetchOptions({
          placement: AdPlacement.PostComment,
          boostsEnabled: true,
        }),
      ).toEqual({
        placement: AdPlacement.PostComment,
      });
    });

    it('should always enable squad boost for directory placement', () => {
      expect(
        resolveAdFetchOptions({
          placement: AdPlacement.SquadDirectory,
          boostsEnabled: false,
        }),
      ).toEqual({
        placement: AdPlacement.SquadDirectory,
        allowSquadBoost: true,
      });
    });
  });

  describe('fetchAdByPlacement', () => {
    it('should fetch feed ads from the general ads endpoint', async () => {
      const result = await fetchAdByPlacement({
        placement: AdPlacement.Feed,
        active: true,
        allowPostBoost: true,
        allowSquadBoost: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a?active=true&allow_post_boost=true&allow_squad_boost=true',
        { credentials: 'include' },
      );
      expect(result).toEqual({ ...ad, generationId: 'gen-123' });
    });

    it('should fetch comment ads from the post ads endpoint', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.PostComment,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a/post',
        { credentials: 'include' },
      );
    });

    it('should fetch directory ads from the squads directory endpoint', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.SquadDirectory,
        allowSquadBoost: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a/squads_directory?allow_squad_boost=true',
        { credentials: 'include' },
      );
    });
  });
});
