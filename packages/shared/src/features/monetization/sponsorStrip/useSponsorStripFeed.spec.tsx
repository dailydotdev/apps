import { renderHook } from '@testing-library/react';
import type { PostHighlight } from '../../../graphql/highlights';
import { useSponsorStrip } from './useSponsorStrip';
import { useSponsorStripFeed } from './useSponsorStripFeed';
import { useStripHeadlines } from './useStripHeadlines';

jest.mock('./useSponsorStrip', () => ({ useSponsorStrip: jest.fn() }));
jest.mock('./useStripHeadlines', () => ({ useStripHeadlines: jest.fn() }));

const mockStrip = jest.mocked(useSponsorStrip);
const mockHeadlines = jest.mocked(useStripHeadlines);

const config = {
  enabled: true,
  premiumRotationMs: 30_000,
  communityRotationMs: 10_000,
};

const headline = { id: 'h1' } as PostHighlight;

const render = () =>
  renderHook(() => useSponsorStripFeed({ feedName: 'my-feed' }));

beforeEach(() => {
  jest.clearAllMocks();
  mockStrip.mockReturnValue({ isEnabled: true, config });
  mockHeadlines.mockReturnValue([headline]);
});

it('should drop the feed card when the strip is carrying the headlines', () => {
  expect(render().result.current.disableHighlightItems).toBe(true);
});

it('should keep the feed card when the strip has no headlines to carry', () => {
  // No fresh headline means an empty ticker, and suppressing the card then
  // would take breaking news out of the product altogether.
  mockHeadlines.mockReturnValue([]);

  expect(render().result.current.disableHighlightItems).toBe(false);
});

it('should keep the feed card when the strip is off', () => {
  mockStrip.mockReturnValue({ isEnabled: false, config });

  expect(render().result.current.disableHighlightItems).toBe(false);
});

it('should not query headlines when the strip is off', () => {
  mockStrip.mockReturnValue({ isEnabled: false, config });
  render();

  expect(mockHeadlines).toHaveBeenCalledWith(false);
});

it('should hand the strip the same headlines it decided with', () => {
  const { result } = render();

  expect(result.current.headlines).toEqual([headline]);
  expect(result.current.isEnabled).toBe(true);
  expect(result.current.config).toEqual(config);
});
