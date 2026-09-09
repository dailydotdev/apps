import { snapdom } from '@zumer/snapdom';
import {
  markAlphas,
  markPaths,
  wordmarkAlphas,
  wordmarkFillRules,
  wordmarkPaths,
} from '../../svg/logoGeometry';
import type {
  CaptureShareImageOptions,
  CaptureTarget,
} from './captureShareImage';
import {
  captureShareImage,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
} from './captureShareImage';

jest.mock('@zumer/snapdom', () => ({ snapdom: jest.fn() }));

const THEME = {
  backgroundColor: 'rgb(1, 2, 3)',
  borderTopColor: 'rgba(4, 5, 6, 0.2)',
  color: 'rgb(7, 8, 9)',
};

type FillRectCall = { args: number[]; fillStyle: string };
type DrawImageCall = { args: number[] };
type FillCall = { d: string; rule?: CanvasFillRule; alpha: number };

let fillRects: FillRectCall[];
let drawImages: DrawImageCall[];
let fills: FillCall[];
let constructedPaths: string[];
let source: { width: number; height: number };

class FakePath2D {
  constructor(public d: string) {
    constructedPaths.push(d);
  }
}

const createContext = () => {
  const context = {
    fillStyle: '',
    globalAlpha: 1,
    imageSmoothingQuality: 'low',
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    fillRect: jest.fn((...args: number[]) => {
      fillRects.push({ args, fillStyle: context.fillStyle });
    }),
    drawImage: jest.fn((_: unknown, ...args: number[]) => {
      drawImages.push({ args });
    }),
    fill: jest.fn((path: FakePath2D, rule?: CanvasFillRule) => {
      fills.push({ d: path.d, rule, alpha: context.globalAlpha });
    }),
  };

  return context;
};

const sized = (width: number, height: number): HTMLElement => {
  const element = document.createElement('div');
  element.getBoundingClientRect = () =>
    ({ width, height } as unknown as DOMRect);
  document.body.appendChild(element);

  return element;
};

const snapdomMock = jest.mocked(snapdom);

const capture = (
  target: CaptureTarget,
  options?: CaptureShareImageOptions,
): Promise<Blob> => captureShareImage(target, options);

beforeEach(() => {
  fillRects = [];
  drawImages = [];
  fills = [];
  constructedPaths = [];
  source = { width: 400, height: 100 };

  document.body.innerHTML = '';

  (global as unknown as { Path2D: unknown }).Path2D = FakePath2D;

  snapdomMock.mockResolvedValue({
    toCanvas: async () => source,
  } as unknown as Awaited<ReturnType<typeof snapdom>>);

  jest
    .spyOn(window, 'getComputedStyle')
    .mockReturnValue(THEME as unknown as CSSStyleDeclaration);

  jest
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(
      () => createContext() as unknown as CanvasRenderingContext2D,
    );

  jest
    .spyOn(HTMLCanvasElement.prototype, 'toBlob')
    .mockImplementation((callback) => callback(new Blob(['png'])));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('captureShareImage', () => {
  it('accepts a bare element and a ref alike', async () => {
    const element = sized(600, 300);

    await expect(capture(element)).resolves.toBeInstanceOf(Blob);
    await expect(capture({ current: element })).resolves.toBeInstanceOf(Blob);
  });

  it('refuses a ref that is not mounted', async () => {
    await expect(capture({ current: null })).rejects.toThrow('not mounted');
  });

  it('refuses an element with no size', async () => {
    await expect(capture(sized(0, 0))).rejects.toThrow('has no size');
  });

  it('leaves no theme probe behind in the target', async () => {
    const element = sized(600, 300);
    await capture(element);

    expect(element.childElementCount).toBe(0);
  });

  it('fills the frame and the bar from one background, so they cannot seam', async () => {
    await capture(sized(600, 300));

    const frame = fillRects[0];
    const bar = fillRects[1];
    const border = fillRects[2];

    expect(frame.args).toEqual([0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT]);
    expect(bar.args).toEqual([0, 558, SHARE_IMAGE_WIDTH, 72]);
    expect(bar.fillStyle).toBe(frame.fillStyle);
    expect(frame.fillStyle).toBe(THEME.backgroundColor);

    expect(border.args).toEqual([0, 558, SHARE_IMAGE_WIDTH, 2]);
    expect(border.fillStyle).toBe(THEME.borderTopColor);
  });

  it('honours an explicit frame background without moving the bar', async () => {
    await capture(sized(600, 300), { frameBackgroundColor: 'rgb(9, 9, 9)' });

    expect(fillRects[0].fillStyle).toBe('rgb(9, 9, 9)');
    expect(fillRects[1].fillStyle).toBe(THEME.backgroundColor);
  });

  it('draws the bar logo from the shared geometry, stroke for stroke', async () => {
    await capture(sized(600, 300));

    expect(constructedPaths).toEqual([...markPaths, ...wordmarkPaths]);
    expect(fills.map(({ alpha }) => alpha)).toEqual([
      ...markAlphas,
      ...wordmarkAlphas,
    ]);
    expect(fills.slice(markPaths.length).map(({ rule }) => rule)).toEqual([
      ...wordmarkFillRules,
    ]);
  });

  it('contains the capture inside the padded frame', async () => {
    await capture(sized(600, 300));

    const [x, y, width, height] = drawImages[0].args;
    expect(width).toBeCloseTo(1104);
    expect(height).toBeCloseTo(276);
    expect(x).toBeCloseTo(48);
    expect(y).toBeCloseTo(141);
  });

  it('reclaims the bar height and re-centres when unbranded', async () => {
    await capture(sized(600, 300), { branded: false });

    const [, y] = drawImages[0].args;
    expect(y).toBeCloseTo(177);
    expect(fills).toHaveLength(0);
    expect(fillRects).toHaveLength(1);
  });

  it('lets padding drive the content box', async () => {
    await capture(sized(600, 300), { padding: 0 });

    const [x, y, width, height] = drawImages[0].args;
    expect(width).toBeCloseTo(1200);
    expect(height).toBeCloseTo(300);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(129);
  });

  it('derives the capture scale from the fit, ignoring a caller override', async () => {
    await capture(sized(600, 300), {
      scale: 99,
    } as unknown as CaptureShareImageOptions);

    expect(snapdomMock.mock.calls[0][1]).toMatchObject({
      scale: 1.54,
      embedFonts: true,
    });
  });
});
