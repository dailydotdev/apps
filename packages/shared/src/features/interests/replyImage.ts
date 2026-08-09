import {
  markAlphas,
  markPaths,
  MARK_HEIGHT,
  MARK_WIDTH,
  wordmarkAlphas,
  wordmarkPaths,
  WORDMARK_HEIGHT,
  WORDMARK_WIDTH,
} from '../../svg/logoGeometry';
import type { AgentMessage } from './chat';
import { messageParagraphs } from './replyText';

export type ReplyCardContent = {
  /** The agent's name: the standing prompt it was spawned with. */
  name: string;
  meta: string;
  paragraphs: string[];
  links: string[];
  /** How many citations did not fit. */
  more: number;
};

const WIDTH = 1200;
const PAD = 80;
const LOGO_HEIGHT = 34;
const MARK_TILE = 64;
const MAX_HEIGHT = 1500;

/**
 * A colour token as something canvas can fill with.
 *
 * The tokens are `color-mix()` expressions, and `getComputedStyle` hands back
 * custom properties unresolved — so they are put on a real element and read off
 * it, which is the only thing that resolves them. Theme-aware for free: the
 * probe inherits whichever theme is on the page.
 */
const resolve = (expression: string): string => {
  const probe = document.createElement('span');

  probe.style.cssText = `position:absolute;opacity:0;pointer-events:none;color:${expression}`;
  document.body.appendChild(probe);

  const { color } = getComputedStyle(probe);

  probe.remove();

  return color;
};

const wrap = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] => {
  const lines: string[] = [];
  let line = '';

  text.split(/\s+/).forEach((word) => {
    const next = line ? `${line} ${word}` : word;

    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines;
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();

  // Chrome 99, Safari 16.4, Firefox 112. Older engines get square corners
  // rather than no card.
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
};

/** Draws a path set from its own viewBox into a box on the canvas. */
const drawPaths = (
  ctx: CanvasRenderingContext2D,
  {
    paths,
    alphas,
    viewWidth,
    viewHeight,
    x,
    y,
    height,
    colour,
  }: {
    paths: string[];
    alphas: number[];
    viewWidth: number;
    viewHeight: number;
    x: number;
    y: number;
    height: number;
    colour: string;
  },
) => {
  const scale = height / viewHeight;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = colour;

  paths.forEach((d, index) => {
    ctx.globalAlpha = alphas[index] ?? 1;
    ctx.fill(new Path2D(d));
  });

  ctx.restore();

  return { width: viewWidth * scale };
};

// A card is a taste of the reply, not the reply. Past these it stops being an
// image someone reads at a glance and becomes a screenshot of a wall of text.
const SHOWN_PARAGRAPHS = 2;
const SHOWN_LINKS = 3;

export const replyCardContent = (
  message: AgentMessage,
  name: string,
  meta: string,
): ReplyCardContent => {
  const titles = (message.blocks ?? []).flatMap((block) =>
    // `flatMap` over a maybe-title rather than `map`: an untitled post is a post
    // with nothing to put on the card, not an empty bullet.
    block.type === 'text'
      ? []
      : block.posts.flatMap((post) => post.title ?? []),
  );
  // The same post is often cited twice in one reply — once as the thing to read
  // and again in the list of everything kept. Twice on a card is a mistake.
  const unique = Array.from(new Set(titles));

  return {
    name,
    meta,
    paragraphs: messageParagraphs(message).slice(0, SHOWN_PARAGRAPHS),
    links: unique.slice(0, SHOWN_LINKS),
    more: Math.max(unique.length - SHOWN_LINKS, 0),
  };
};

/**
 * The reply as an image, drawn rather than screenshotted.
 *
 * Hand-drawn on a canvas for two reasons. The honest one: rasterising a DOM
 * subtree needs a library, and this is `shared`, so a dependency here also ships
 * in the extension. The better one: a screenshot of the panel would carry the
 * panel's furniture — scrollbars, clipped edges, whatever the reader had hovered
 * — and what should travel is the reply, set once, at a size made for the places
 * it gets pasted.
 *
 * The logo is the real geometry, the same paths the app draws, so the mark on a
 * shared image cannot drift from the mark in the product.
 */
export const drawReplyCard = (content: ReplyCardContent): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('replyImage: drawing the card needs a 2d context');
  }

  const font = getComputedStyle(document.body).fontFamily;
  const ink = resolve('var(--theme-text-primary)');
  const inkQuiet = resolve('var(--theme-text-tertiary)');
  const brand = resolve('var(--theme-accent-cabbage-default)');
  const surface = resolve('var(--theme-background-subtle)');
  const surfaceTop = resolve(
    'color-mix(in srgb, var(--theme-accent-cabbage-default) 12%, var(--theme-background-subtle))',
  );
  const hairline = resolve(
    'color-mix(in srgb, var(--theme-border-subtlest-primary), transparent 80%)',
  );

  const body = 30;
  const bodyLead = 46;
  const inner = WIDTH - PAD * 2;

  // Measured before the canvas is sized, because setting the height wipes the
  // context — so the layout is worked out first and drawn second.
  ctx.font = `400 ${body}px ${font}`;

  const paragraphs = content.paragraphs.map((text) => wrap(ctx, text, inner));
  const links = content.links.map((text) => wrap(ctx, text, inner - 40));

  const headerHeight = MARK_TILE + 56;
  const bodyHeight =
    paragraphs.reduce((sum, lines) => sum + lines.length * bodyLead + 22, 0) +
    links.reduce((sum, lines) => sum + lines.length * bodyLead + 10, 0) +
    (content.more ? bodyLead : 0) -
    // The last block's trailing gap is inside the padding, not on top of it.
    22;
  const height = Math.min(PAD * 2 + headerHeight + bodyHeight, MAX_HEIGHT);

  canvas.width = WIDTH;
  canvas.height = height;

  // The card itself: a vertical wash with the brand's colour at the top, the
  // same reading the sheet's card has on screen.
  const wash = ctx.createLinearGradient(0, 0, 0, height * 0.55);
  wash.addColorStop(0, surfaceTop);
  wash.addColorStop(1, surface);

  roundRect(ctx, 0, 0, WIDTH, height, 40);
  ctx.fillStyle = wash;
  ctx.fill();

  // The glow arriving from off the top edge.
  const glow = ctx.createRadialGradient(WIDTH / 2, -40, 0, WIDTH / 2, -40, 520);
  glow.addColorStop(0, brand);
  glow.addColorStop(1, 'transparent');
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = glow;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = hairline;
  ctx.lineWidth = 2;
  roundRect(ctx, 1, 1, WIDTH - 2, height - 2, 40);
  ctx.stroke();
  ctx.restore();

  // The agent's mark, in its tile.
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = brand;
  roundRect(ctx, PAD, PAD, MARK_TILE, MARK_TILE, 18);
  ctx.fill();
  ctx.restore();

  const markHeight = 30;
  drawPaths(ctx, {
    paths: markPaths,
    alphas: markAlphas,
    viewWidth: MARK_WIDTH,
    viewHeight: MARK_HEIGHT,
    x: PAD + (MARK_TILE - (markHeight * MARK_WIDTH) / MARK_HEIGHT) / 2,
    y: PAD + (MARK_TILE - markHeight) / 2,
    height: markHeight,
    colour: brand,
  });

  // The lockup, opposite the agent and at the size a signature should be read
  // at: it is the one thing on the card that says where any of this came from.
  const markWidth = (LOGO_HEIGHT * MARK_WIDTH) / MARK_HEIGHT;
  const wordWidth = (LOGO_HEIGHT * WORDMARK_WIDTH) / WORDMARK_HEIGHT;
  const lockupLeft = WIDTH - PAD - markWidth - 14 - wordWidth;

  drawPaths(ctx, {
    paths: markPaths,
    alphas: markAlphas,
    viewWidth: MARK_WIDTH,
    viewHeight: MARK_HEIGHT,
    x: lockupLeft,
    y: PAD + (MARK_TILE - LOGO_HEIGHT) / 2,
    height: LOGO_HEIGHT,
    colour: ink,
  });
  drawPaths(ctx, {
    paths: wordmarkPaths,
    alphas: wordmarkAlphas,
    viewWidth: WORDMARK_WIDTH,
    viewHeight: WORDMARK_HEIGHT,
    x: lockupLeft + markWidth + 14,
    y: PAD + (MARK_TILE - LOGO_HEIGHT) / 2,
    height: LOGO_HEIGHT,
    colour: ink,
  });

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = ink;
  ctx.font = `700 34px ${font}`;
  ctx.fillText(content.name, PAD + MARK_TILE + 24, PAD + 30, inner * 0.55);

  ctx.fillStyle = inkQuiet;
  ctx.font = `400 24px ${font}`;
  ctx.fillText(content.meta, PAD + MARK_TILE + 24, PAD + 62);

  let y = PAD + headerHeight;

  paragraphs.forEach((lines) => {
    ctx.fillStyle = ink;
    ctx.font = `400 ${body}px ${font}`;
    lines.forEach((line) => {
      ctx.fillText(line, PAD, y);
      y += bodyLead;
    });
    y += 22;
  });

  links.forEach((lines) => {
    ctx.fillStyle = brand;
    ctx.font = `600 ${body}px ${font}`;
    lines.forEach((line, index) => {
      if (index === 0) {
        ctx.fillText('•', PAD, y);
      }

      ctx.fillText(line, PAD + 34, y);
      y += bodyLead;
    });
    y += 10;
  });

  if (content.more) {
    ctx.fillStyle = inkQuiet;
    ctx.font = `400 ${body}px ${font}`;
    ctx.fillText(`and ${content.more} more`, PAD, y);
  }

  return canvas;
};

export const replyCardBlob = async (
  content: ReplyCardContent,
): Promise<Blob> => {
  const canvas = drawReplyCard(content);
  const blob = await new Promise<Blob | null>((done) =>
    canvas.toBlob(done, 'image/png'),
  );

  if (!blob) {
    throw new Error('replyImage: the canvas produced no image');
  }

  return blob;
};
