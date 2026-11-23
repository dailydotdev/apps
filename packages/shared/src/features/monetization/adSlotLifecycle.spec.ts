import ad from '../../../__tests__/fixture/ad';
import type { Ad } from '../../graphql/posts';
import { AdActions } from '../../lib/ads';
import { runAdSlotActions } from './adSlotLifecycle';

afterEach(() => jest.restoreAllMocks());

it('deduplicates milestones after the lifecycle object is cloned', () => {
  const creative: Ad = {
    ...ad,
    generationId: 'cloned-lifecycle',
    lifecycle: {
      version: 1,
      on: {
        'post-fetch': [
          { type: 'pixel', url: 'https://tracking.example/fetched' },
        ],
        click: [{ type: 'pixel', url: 'https://tracking.example/click' }],
      },
    },
  };
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const onEvent = jest.fn();
  const copy = JSON.parse(JSON.stringify(creative)) as Ad;

  [creative, copy].forEach((item) => {
    runAdSlotActions({
      ad: item,
      milestone: 'post-fetch',
      macros: {},
      onEvent,
    });
    runAdSlotActions({ ad: item, milestone: 'click', macros: {}, onEvent });
  });

  expect(src.mock.calls).toEqual([
    ['https://tracking.example/fetched'],
    ['https://tracking.example/click'],
    ['https://tracking.example/click'],
  ]);
});

it('only forwards known ad analytics events while retaining valid pixels', () => {
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const onEvent = jest.fn();
  runAdSlotActions({
    ad: {
      ...ad,
      generationId: 'analytics-event-allowlist',
      lifecycle: {
        version: 1,
        on: {
          viewable: [
            { type: 'event', name: 'arbitrary server event' },
            { type: 'event', name: AdActions.Viewable },
            { type: 'event', name: AdActions.Viewable },
            { type: 'pixel', url: 'https://tracking.example/viewable' },
          ],
        },
      },
    },
    milestone: 'viewable',
    macros: {},
    onEvent,
  });

  expect(onEvent.mock.calls).toEqual([[AdActions.Viewable]]);
  expect(src).toHaveBeenCalledWith('https://tracking.example/viewable');
});
