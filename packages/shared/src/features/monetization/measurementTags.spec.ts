/* eslint-disable no-template-curly-in-string -- literal macro tokens under test */
import { injectMeasurementTags, tagsRequireOverlay } from './measurementTags';

const makeContainer = (): HTMLDivElement => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
};

describe('injectMeasurementTags', () => {
  it('substitutes macros inside the markup', () => {
    const container = makeContainer();
    injectMeasurementTags(
      container,
      [
        {
          markup:
            '<img src="https://t.example.com/i?gdpr=${GDPR}&ord=[timestamp]" />',
        },
      ],
      { gdprApplies: true },
    );

    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toContain('gdpr=1');
    expect(img?.getAttribute('src')).not.toContain('[timestamp]');
  });

  it('recreates script nodes so they can execute, preserving attributes', () => {
    const container = makeContainer();
    injectMeasurementTags(
      container,
      [
        {
          markup:
            '<script src="https://static.tracker.example/tag.js" attributionsrc data-cb="${CACHEBUSTER}"></script>',
        },
      ],
      {},
    );

    const script = container.querySelector('script');
    expect(script?.getAttribute('src')).toBe(
      'https://static.tracker.example/tag.js',
    );
    // attributionsrc must survive as a real attribute (Privacy Sandbox)
    expect(script?.hasAttribute('attributionsrc')).toBe(true);
    expect(script?.getAttribute('data-cb')).toMatch(/^\d+$/);
  });

  it('injects every tag in the array', () => {
    const container = makeContainer();
    injectMeasurementTags(
      container,
      [
        { markup: '<img src="https://a.example.com/1" />' },
        { markup: '<img src="https://b.example.com/2" />' },
      ],
      {},
    );

    expect(container.querySelectorAll('img')).toHaveLength(2);
  });

  it('does not inject twice into the same container', () => {
    const container = makeContainer();
    const tags = [{ markup: '<img src="https://a.example.com/1" />' }];

    injectMeasurementTags(container, tags, {});
    injectMeasurementTags(container, tags, {});

    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('is a no-op for empty tags', () => {
    const container = makeContainer();
    injectMeasurementTags(container, [], {});
    injectMeasurementTags(container, undefined, {});
    expect(container.children).toHaveLength(0);
  });
});

describe('tagsRequireOverlay', () => {
  it('is true when any tag needs overlay', () => {
    expect(
      tagsRequireOverlay([{ markup: 'a' }, { markup: 'b', overlay: true }]),
    ).toBe(true);
  });

  it('is false when no tag needs overlay', () => {
    expect(tagsRequireOverlay([{ markup: 'a' }])).toBe(false);
    expect(tagsRequireOverlay(undefined)).toBe(false);
  });
});
