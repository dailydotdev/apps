export type WeeklyQuizShareVariant = 1 | 2 | 3 | 4;

export interface WeeklyQuizResultImageParams {
  name: string;
  imageUrl?: string | null;
  // The player's developer "level" (e.g. "Tab Spammer") — the hero headline.
  title: string;
  correctCount: number;
  totalQuestions: number;
  // "better than N% of players" flourish.
  percentile: number;
  rank?: number | null;
  // The tier GIF — drawn as a still frame into the canvas.
  gifUrl?: string | null;
  logoUrl: string;
  // daily.dev brand logo (best-effort; same-origin).
  brandLogoUrl?: string;
}

const FONT = 'system-ui, sans-serif';
const CHALLENGE = 'Think you can beat me?';

const loadImage = (
  src: string,
  crossOrigin?: string,
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Best-effort load: resolves null instead of throwing, so one missing asset
// (blocked avatar, dead GIF) never fails the whole render.
const loadSafe = async (
  src?: string | null,
  crossOrigin?: string,
): Promise<HTMLImageElement | null> => {
  if (!src) {
    return null;
  }
  try {
    return await loadImage(src, crossOrigin);
  } catch {
    return null;
  }
};

const accent = (token: string, fallback: string): string => {
  if (typeof document === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value || fallback;
};

interface Assets {
  logo: HTMLImageElement | null;
  brand: HTMLImageElement | null;
  avatar: HTMLImageElement | null;
  gif: HTMLImageElement | null;
}

type Ctx = CanvasRenderingContext2D;

const roundRectPath = (
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

// Shrinks the font until `text` fits within `maxWidth`.
const fitFont = (
  ctx: Ctx,
  text: string,
  weight: string,
  startPx: number,
  maxWidth: number,
  minPx = 30,
): void => {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${FONT}`;
  while (ctx.measureText(text).width > maxWidth && px > minPx) {
    px -= 2;
    ctx.font = `${weight} ${px}px ${FONT}`;
  }
};

// Draws an image cover-fit (center-cropped) into a rounded rectangle.
const drawCover = (
  ctx: Ctx,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void => {
  ctx.save();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.clip();
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let dw = w;
  let dh = h;
  if (imgRatio > boxRatio) {
    dh = h;
    dw = h * imgRatio;
  } else {
    dw = w;
    dh = w / imgRatio;
  }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
};

// Circular avatar with a white ring.
const drawAvatar = (
  ctx: Ctx,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  diameter: number,
): void => {
  const r = diameter / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, cx - r, cy - r, diameter, diameter);
  ctx.restore();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
};

// Gold "rank #N" pill, centered on (cx, y-top).
const drawRankPill = (ctx: Ctx, rank: number, cx: number, y: number): void => {
  const text = `LEADERBOARD #${rank}`;
  ctx.font = `bold 34px ${FONT}`;
  const w = ctx.measureText(text).width + 68;
  const h = 70;
  const x = cx - w / 2;
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, accent('--theme-accent-cheese-default', '#FFE24C'));
  grad.addColorStop(1, accent('--theme-accent-bun-default', '#FF9157'));
  ctx.fillStyle = grad;
  roundRectPath(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = '#1a1523';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, y + 46);
};

const drawBackground = (ctx: Ctx, w: number, h: number): void => {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1b1a24');
  bg.addColorStop(1, '#0d0d12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const aura = (x: number, y: number, r: number, color: string): void => {
    const g = ctx.createRadialGradient(x, y, 20, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
  aura(w * 0.5, h * 0.2, w * 0.6, 'rgba(107, 86, 221, 0.4)');
  aura(w * 0.7, h * 0.32, w * 0.5, 'rgba(186, 86, 225, 0.26)');
};

// Small brand header ("mascot + WEEKLY TECH NEWS QUIZ"), left-aligned at (x,y).
const drawBrandHeader = (
  ctx: Ctx,
  assets: Assets,
  x: number,
  y: number,
): void => {
  let cursor = x;
  if (assets.logo) {
    const s = 52;
    ctx.drawImage(assets.logo, x, y, s, s);
    cursor = x + s + 16;
  }
  ctx.textAlign = 'left';
  ctx.font = `800 26px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.fillText('WEEKLY TECH NEWS QUIZ', cursor, y + 34);
};

const drawFooter = (ctx: Ctx, assets: Assets, w: number, y: number): void => {
  const text = 'Play at daily.dev';
  ctx.font = `bold 34px ${FONT}`;
  const textW = ctx.measureText(text).width;
  const mark = 40;
  const gap = 14;
  const groupX = (w - (mark + gap + textW)) / 2;
  if (assets.brand) {
    ctx.drawImage(assets.brand, groupX, y - mark / 2 - 6, mark, mark);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(text, groupX + mark + gap, y + 6);
  ctx.textAlign = 'center';
};

// Two matching stat cards: score and rank (or the challenge when no rank).
const drawScoreCards = (
  ctx: Ctx,
  params: WeeklyQuizResultImageParams,
  w: number,
  y: number,
): void => {
  const cardW = 400;
  const cardH = 180;
  const gap = 36;
  const startX = (w - (cardW * 2 + gap)) / 2;
  const cards = [
    {
      x: startX,
      big: `${params.correctCount}/${params.totalQuestions}`,
      label: 'CORRECT',
    },
    {
      x: startX + cardW + gap,
      big: params.rank ? `#${params.rank}` : `${params.percentile}%`,
      label: params.rank ? 'ON THE BOARD' : 'PERCENTILE',
    },
  ];
  cards.forEach((card) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    roundRectPath(ctx, card.x, y, cardW, cardH, 32);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    roundRectPath(ctx, card.x, y, cardW, cardH, 32);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = `bold 92px ${FONT}`;
    ctx.fillText(card.big, card.x + cardW / 2, y + 108);
    ctx.font = `700 30px ${FONT}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.fillText(card.label, card.x + cardW / 2, y + 150);
  });
};

// Variant 1 — GIF poster: full-bleed GIF up top, verdict + stats below.
const renderPoster = (
  ctx: Ctx,
  w: number,
  h: number,
  params: WeeklyQuizResultImageParams,
  assets: Assets,
): void => {
  const gifH = 620;
  if (assets.gif) {
    drawCover(ctx, assets.gif, 0, 0, w, gifH, 0);
  }
  // Scrim so the header + edge read over the GIF.
  const scrim = ctx.createLinearGradient(0, gifH - 260, 0, gifH);
  scrim.addColorStop(0, 'rgba(13,13,18,0)');
  scrim.addColorStop(1, 'rgba(13,13,18,1)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, gifH - 260, w, 260);
  drawBrandHeader(ctx, assets, 60, 54);

  ctx.textAlign = 'center';
  fitFont(ctx, params.title, 'bold', 92, w - 140);
  ctx.fillStyle = '#fff';
  ctx.fillText(params.title, w / 2, gifH + 96);
  ctx.font = `500 34px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(
    `You scored better than ${params.percentile}% of players`,
    w / 2,
    gifH + 150,
  );

  drawScoreCards(ctx, params, w, gifH + 200);

  const rowY = gifH + 430;
  if (assets.avatar) {
    drawAvatar(ctx, assets.avatar, w / 2 - 150, rowY, 84);
  }
  ctx.textAlign = 'left';
  fitFont(ctx, params.name, 'bold', 44, 360);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(params.name, w / 2 - 96, rowY + 14);

  drawFooter(ctx, assets, w, h - 70);
};

// Variant 2 — centered card: brand, avatar, name, level, score, GIF thumb.
const renderCentered = (
  ctx: Ctx,
  w: number,
  h: number,
  params: WeeklyQuizResultImageParams,
  assets: Assets,
): void => {
  ctx.textAlign = 'center';
  if (assets.logo) {
    const s = 150;
    ctx.drawImage(assets.logo, (w - s) / 2, 60, s, s);
  }
  if (assets.avatar) {
    drawAvatar(ctx, assets.avatar, w / 2, 300, 132);
  }
  fitFont(ctx, params.name, 'bold', 40, w - 200);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.fillText(params.name, w / 2, 430);
  fitFont(ctx, params.title, 'bold', 84, w - 120);
  ctx.fillStyle = '#fff';
  ctx.fillText(params.title, w / 2, 520);
  ctx.font = `500 32px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(
    `You scored better than ${params.percentile}% of players`,
    w / 2,
    568,
  );
  drawScoreCards(ctx, params, w, 620);
  if (assets.gif) {
    const gw = 720;
    const gh = 420;
    drawCover(ctx, assets.gif, (w - gw) / 2, 850, gw, gh, 28);
  }
  drawFooter(ctx, assets, w, h - 70);
};

// Variant 3 — split: verdict/stats on the left, GIF filling the right.
const renderSplit = (
  ctx: Ctx,
  w: number,
  h: number,
  params: WeeklyQuizResultImageParams,
  assets: Assets,
): void => {
  const gifW = 430;
  if (assets.gif) {
    drawCover(ctx, assets.gif, w - gifW, 0, gifW, h, 0);
    const scrim = ctx.createLinearGradient(w - gifW, 0, w - gifW + 200, 0);
    scrim.addColorStop(0, 'rgba(13,13,18,1)');
    scrim.addColorStop(1, 'rgba(13,13,18,0)');
    ctx.fillStyle = scrim;
    ctx.fillRect(w - gifW, 0, 200, h);
  }
  const leftW = w - gifW;
  const pad = 70;
  drawBrandHeader(ctx, assets, pad, 70);
  ctx.textAlign = 'left';
  fitFont(ctx, params.title, 'bold', 96, leftW - pad * 2);
  ctx.fillStyle = '#fff';
  ctx.fillText(params.title, pad, 360);
  ctx.font = `500 34px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`Better than ${params.percentile}% of players`, pad, 420);

  ctx.font = `bold 150px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.fillText(`${params.correctCount}/${params.totalQuestions}`, pad, 600);
  ctx.font = `700 34px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('CORRECT', pad, 650);

  if (params.rank) {
    drawRankPill(ctx, params.rank, pad + 140, 720);
  }

  const rowY = h - 120;
  if (assets.avatar) {
    drawAvatar(ctx, assets.avatar, pad + 42, rowY, 84);
  }
  fitFont(ctx, params.name, 'bold', 40, leftW - pad * 2 - 110);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(params.name, pad + 100, rowY + 12);
};

// Variant 4 — ticket: header band, big score, dashed divider, GIF strip.
const renderTicket = (
  ctx: Ctx,
  w: number,
  h: number,
  params: WeeklyQuizResultImageParams,
  assets: Assets,
): void => {
  const m = 70;
  const cardX = m;
  const cardY = m;
  const cardW = w - m * 2;
  const cardH = h - m * 2;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.stroke();

  drawBrandHeader(ctx, assets, cardX + 50, cardY + 50);

  ctx.textAlign = 'center';
  fitFont(ctx, params.title, 'bold', 90, cardW - 120);
  ctx.fillStyle = '#fff';
  ctx.fillText(params.title, w / 2, cardY + 230);

  ctx.font = `bold 190px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.fillText(
    `${params.correctCount}/${params.totalQuestions}`,
    w / 2,
    cardY + 430,
  );
  ctx.font = `700 34px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('CORRECT ANSWERS', w / 2, cardY + 480);

  // Dashed divider.
  ctx.strokeStyle = 'rgba(255,255,255,0.24)';
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(cardX + 50, cardY + 540);
  ctx.lineTo(cardX + cardW - 50, cardY + 540);
  ctx.stroke();
  ctx.setLineDash([]);

  if (assets.gif) {
    const gw = cardW - 100;
    const gh = 300;
    drawCover(ctx, assets.gif, cardX + 50, cardY + 580, gw, gh, 24);
  }

  const rowY = cardY + cardH - 90;
  if (assets.avatar) {
    drawAvatar(ctx, assets.avatar, cardX + 92, rowY, 84);
  }
  ctx.textAlign = 'left';
  fitFont(ctx, params.name, 'bold', 40, cardW - 400);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(params.name, cardX + 150, rowY + 4);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText(CHALLENGE, cardX + 150, rowY + 40);
  if (params.rank) {
    drawRankPill(ctx, params.rank, cardX + cardW - 170, rowY - 30);
  }
};

// Renders the result to a PNG data URL for the given layout variant. Returns
// null if the canvas can't be produced. All screens are 1080x1350 (portrait
// social) except the split layout, which is square.
export const createWeeklyQuizResultImage = async (
  params: WeeklyQuizResultImageParams,
  variant: WeeklyQuizShareVariant = 1,
): Promise<string | null> => {
  if (typeof document === 'undefined') {
    return null;
  }
  const w = 1080;
  const h = variant === 3 ? 1080 : 1350;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const [logo, brand, avatar, gif] = await Promise.all([
    loadSafe(params.logoUrl),
    loadSafe(params.brandLogoUrl),
    loadSafe(params.imageUrl, 'anonymous'),
    loadSafe(params.gifUrl, 'anonymous'),
  ]);
  const assets: Assets = { logo, brand, avatar, gif };

  drawBackground(ctx, w, h);
  const renderers = {
    1: renderPoster,
    2: renderCentered,
    3: renderSplit,
    4: renderTicket,
  } as const;
  renderers[variant](ctx, w, h, params, assets);

  try {
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
};

// Renders and downloads the result image as a PNG.
export const generateWeeklyQuizResultImage = async (
  params: WeeklyQuizResultImageParams,
  variant: WeeklyQuizShareVariant = 1,
): Promise<void> => {
  const url = await createWeeklyQuizResultImage(params, variant);
  if (!url) {
    return;
  }
  const link = document.createElement('a');
  link.href = url;
  link.download = 'weekly-tech-news-quiz-result.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
};
