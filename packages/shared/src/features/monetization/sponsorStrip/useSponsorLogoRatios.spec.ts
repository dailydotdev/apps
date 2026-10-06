import { act, renderHook } from '@testing-library/react';
import { useSponsorLogoRatios } from './useSponsorLogoRatios';

let images: HTMLImageElement[];

beforeEach(() => {
  images = [];
  jest.spyOn(window, 'Image').mockImplementation(() => {
    const image = document.createElement('img');
    images.push(image);
    return image;
  });
});

afterEach(() => jest.restoreAllMocks());

const load = (image: HTMLImageElement, width: number, height: number) => {
  Object.defineProperties(image, {
    naturalWidth: { value: width },
    naturalHeight: { value: height },
  });
  act(() => image.dispatchEvent(new Event('load')));
};

it('measures each distinct asset and ignores unusable dimensions', () => {
  const { result } = renderHook(({ logos }) => useSponsorLogoRatios(logos), {
    initialProps: { logos: ['wide.svg', 'wide.svg', 'broken.svg'] },
  });
  expect(images).toHaveLength(2);
  load(images[0], 600, 100);
  load(images[1], 0, 0);
  expect(result.current).toEqual({ 'wide.svg': 6 });
});

it('keeps theme asset dimensions separate and cancels obsolete image loads', () => {
  const { result, rerender, unmount } = renderHook(
    ({ logos }) => useSponsorLogoRatios(logos),
    { initialProps: { logos: ['dark.svg', 'pending.svg'] } },
  );
  load(images[0], 200, 100);
  rerender({ logos: ['light.svg'] });
  expect(images[1].onload).toBeNull();
  expect(result.current['light.svg']).toBeUndefined();
  load(images[2], 600, 100);
  expect(result.current).toEqual({ 'dark.svg': 2, 'light.svg': 6 });
  unmount();
  expect(images[2].onload).toBeNull();
});
