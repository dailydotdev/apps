// No library: `shared` ships in the extension, and this only has to photograph
// a plain card. Two limits the card is built around: pseudo-elements are not
// cloned, and an SVG foreignObject cannot reach the page's webfonts.
const inline = (source: Element, clone: Element): void => {
  const computed = getComputedStyle(source);
  let css = '';

  for (let index = 0; index < computed.length; index += 1) {
    const property = computed.item(index);

    css += `${property}:${computed.getPropertyValue(property)};`;
  }

  clone.setAttribute('style', css);

  const sources = Array.from(source.children);
  const clones = Array.from(clone.children);

  sources.forEach((child, index) => {
    const pair = clones[index];

    if (pair) {
      inline(child, pair);
    }
  });
};

export const nodeToPng = async (
  node: HTMLElement,
  scale = 2,
): Promise<Blob> => {
  const { width, height } = node.getBoundingClientRect();
  const clone = node.cloneNode(true) as HTMLElement;

  inline(node, clone);

  // No parent lays the clone out, so it has to carry its on-screen box.
  clone.style.margin = '0';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;

  const markup = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${markup}</div></foreignObject></svg>`;

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('nodeToPng: rasterising needs a 2d context');
  }

  ctx.scale(scale, scale);
  ctx.drawImage(image, 0, 0);

  const blob = await new Promise<Blob | null>((done) =>
    canvas.toBlob(done, 'image/png'),
  );

  if (!blob) {
    throw new Error('nodeToPng: the canvas produced no image');
  }

  return blob;
};
