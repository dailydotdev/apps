import { nodeToPng } from './nodeToPng';

// jsdom cannot rasterise, so only everything up to the paint is exercised.

const card = (): HTMLElement => {
  const node = document.createElement('div');

  node.innerHTML =
    '<span class="agent-share-glow"></span><div class="prose"><p>Kept 6.</p></div>';
  node.style.color = 'rgb(255, 0, 0)';
  node.style.margin = '24px';
  (node.firstElementChild as HTMLElement).style.opacity = '0.4';
  document.body.appendChild(node);

  return node;
};

// jsdom lays nothing out, so the box the clone has to carry is stubbed.
const measured = (node: HTMLElement, width: number, height: number) =>
  jest
    .spyOn(node, 'getBoundingClientRect')
    .mockReturnValue({ width, height } as DOMRect);

const capture = () => {
  const seen: { current: HTMLElement } = { current: undefined as never };

  jest
    .spyOn(XMLSerializer.prototype, 'serializeToString')
    .mockImplementation((node) => {
      seen.current = node as HTMLElement;

      return '';
    });

  return seen;
};

const paints = (blob: Blob | null) => {
  const ctx = { scale: jest.fn(), drawImage: jest.fn() };

  jest
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(ctx as never);
  jest
    .spyOn(HTMLCanvasElement.prototype, 'toBlob')
    .mockImplementation((done) => done(blob));

  return ctx;
};

beforeEach(() => {
  document.body.innerHTML = '';
  // jsdom has no image decoding, and the SVG never has to actually load.
  Object.defineProperty(HTMLImageElement.prototype, 'decode', {
    configurable: true,
    writable: true,
    value: jest.fn().mockResolvedValue(undefined),
  });
});

afterEach(() => jest.restoreAllMocks());

describe('the clone that gets photographed', () => {
  it('carries the screen’s computed styles as inline ones', async () => {
    const node = card();

    measured(node, 400, 200);
    const clone = capture();

    paints(new Blob());
    await nodeToPng(node);

    expect(clone.current).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(clone.current).toHaveStyle({ display: 'block' });
  });

  // An SVG `foreignObject` gets no stylesheet, so a child without inline styles
  // is drawn unstyled.
  it('reaches every descendant, not just the node it was handed', async () => {
    const node = card();

    measured(node, 400, 200);
    const clone = capture();

    paints(new Blob());
    await nodeToPng(node);

    const glow = clone.current.querySelector<HTMLElement>('.agent-share-glow');
    const paragraph = clone.current.querySelector('p');

    expect(glow?.style.opacity).toBe('0.4');
    expect(paragraph?.getAttribute('style')).toBeTruthy();
  });

  it('is a deep copy, so nothing on the card goes missing from the picture', async () => {
    const node = card();

    measured(node, 400, 200);
    const clone = capture();

    paints(new Blob());
    await nodeToPng(node);

    expect(clone.current).not.toBe(node);
    expect(clone.current.querySelector('p')?.textContent).toBe('Kept 6.');
  });

  // No parent lays anything out inside the `foreignObject`.
  it('takes the box it had on screen and drops the margin', async () => {
    const node = card();

    measured(node, 400, 200);
    const clone = capture();

    paints(new Blob());
    await nodeToPng(node);

    expect(clone.current).toHaveStyle({ width: '400px' });
    expect(clone.current).toHaveStyle({ height: '200px' });
    expect(clone.current).toHaveStyle({ margin: '0px' });
  });

  it('leaves the card on screen exactly as it was', async () => {
    const node = card();

    measured(node, 400, 200);
    // `cssText`, not `toHaveStyle`: the assertion is that nothing was added,
    // which a matcher checking given styles cannot make.
    const before = node.style.cssText;

    paints(new Blob());
    capture();
    await nodeToPng(node);

    expect(node.style.cssText).toBe(before);
  });
});

describe('the rasterising itself', () => {
  it('draws at twice the size, so the picture holds up where it is pasted', async () => {
    const node = card();

    measured(node, 400, 200);
    capture();
    const ctx = paints(new Blob());
    const canvas = jest.spyOn(document, 'createElement');

    await nodeToPng(node);

    const drawnOn = canvas.mock.results
      .map(({ value }) => value as HTMLElement)
      .find((element) => element instanceof HTMLCanvasElement) as
      | HTMLCanvasElement
      | undefined;

    expect(drawnOn?.width).toBe(800);
    expect(drawnOn?.height).toBe(400);
    expect(ctx.scale).toHaveBeenCalledWith(2, 2);
  });

  it('honours a scale it is given', async () => {
    const node = card();

    measured(node, 400, 200);
    capture();
    const ctx = paints(new Blob());

    await nodeToPng(node, 1);

    expect(ctx.scale).toHaveBeenCalledWith(1, 1);
  });

  it('rounds the canvas to whole pixels', async () => {
    const node = card();

    measured(node, 400.4, 200.6);
    capture();
    paints(new Blob());
    const canvas = jest.spyOn(document, 'createElement');

    await nodeToPng(node, 1);

    const drawnOn = canvas.mock.results
      .map(({ value }) => value as HTMLElement)
      .find((element) => element instanceof HTMLCanvasElement) as
      | HTMLCanvasElement
      | undefined;

    expect(drawnOn?.width).toBe(400);
    expect(drawnOn?.height).toBe(201);
  });

  it('says so when there is nothing to draw on', async () => {
    const node = card();

    measured(node, 400, 200);
    capture();
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null as never);

    await expect(nodeToPng(node)).rejects.toThrow(
      'nodeToPng: rasterising needs a 2d context',
    );
  });

  it('says so when the canvas produces no image', async () => {
    const node = card();

    measured(node, 400, 200);
    capture();
    paints(null);

    await expect(nodeToPng(node)).rejects.toThrow(
      'nodeToPng: the canvas produced no image',
    );
  });
});
