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

// The daily.dev lockup (icon + wordmark) exactly as the app renders it, inlined
// as a white SVG so it can be rasterised onto the canvas. Aspect ~118:20.
const DAILY_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="118" height="20" viewBox="0 0 118 20" fill="none"><g fill="#fff"><path fill-opacity="0.64" d="M29.5925 9.99823L25.7884 6.1862L27.6895 2.37549L33.8703 8.5693C34.6579 9.35848 34.6579 10.638 33.8703 11.4272L26.2629 19.0506C25.4753 19.8398 24.1985 19.8398 23.411 19.0506C22.6234 18.2614 22.6234 16.9819 23.411 16.1927L29.5925 9.99823Z"/><path d="M23.4118 0.947675C24.1993 0.158497 25.4765 0.158828 26.264 0.948006L27.6903 2.37727L11.05 19.0524C10.2625 19.8415 8.98533 19.8412 8.1978 19.052L6.77152 17.6228L23.4118 0.947675ZM16.28 6.18864L13.4275 9.04718L9.62342 5.23514L4.86849 10L8.67256 13.8121L6.77152 17.6228L0.590647 11.429C-0.196882 10.6398 -0.196882 9.36026 0.590647 8.57108L8.1978 0.948006C8.98533 0.158828 10.2625 0.158497 11.05 0.947675L16.28 6.18864Z"/></g><g fill="#fff" transform="translate(41 0)"><path d="M2.15093 7.22871V13.7036H5.7075L6.46132 15.8618H2.15093C0.963005 15.8618 0 14.8955 0 13.7036V7.22871C0 6.03673 0.963005 5.07043 2.15093 5.07043H5.7075V7.22871H6.46132V2.91215C6.46132 2.31616 6.94346 1.83301 7.53821 1.83301H8.61509V14.7827C8.61509 15.3787 8.13296 15.8618 7.53821 15.8618H6.46132V7.22871H2.15093ZM12.9198 15.8619C11.7319 15.8619 10.7689 14.8956 10.7689 13.7036V11.5453C10.7689 10.3533 11.7319 9.387 12.9198 9.387H16.4764V11.5453H17.2302V7.22871H11.3066L11.3066 6.14957C11.3066 5.55358 11.7881 5.07043 12.3821 5.07043H17.2302C18.4197 5.07043 19.384 6.03673 19.384 7.22871V14.7827C19.384 15.3787 18.9018 15.8619 18.3071 15.8619H17.2302V11.5453H12.9198V13.7036H16.4764L17.2302 15.8619C14.575 15.8619 13.1382 15.8619 12.9198 15.8619ZM21.5377 15.8618V6.14957C21.5377 5.55358 22.0192 5.07043 22.6132 5.07043H23.6887V14.7827C23.6887 15.3787 23.2072 15.8618 22.6132 15.8618H21.5377ZM23.6887 2.9192C23.6887 3.22014 23.5856 3.47405 23.3794 3.68095C23.1732 3.88784 22.9201 3.99129 22.6202 3.99129C22.3203 3.99129 22.0649 3.88784 21.854 3.68095C21.6432 3.47405 21.5377 3.22014 21.5377 2.9192C21.5377 2.60886 21.6432 2.35024 21.854 2.14335C22.0649 1.93645 22.3203 1.83301 22.6202 1.83301C22.9201 1.83301 23.1732 1.93645 23.3794 2.14335C23.5856 2.35024 23.6887 2.60886 23.6887 2.9192ZM25.8453 15.8618V2.91215C25.8453 2.31616 26.3268 1.83301 26.9207 1.83301H27.9962V14.7827C27.9962 15.3787 27.5147 15.8618 26.9207 15.8618H25.8453ZM33.1033 15.8662L30.1994 6.73344C30.0258 6.16349 30.353 5.56019 30.921 5.38594L31.944 5.07043L34.3132 12.8267L36.4454 5.83435C36.619 5.2644 37.2127 4.94362 37.7807 5.11787L38.7679 5.43338L35.1101 17.5716C34.8336 18.479 33.9988 19.0988 33.0532 19.0989L31.2751 19.0993C30.6811 19.0993 30.1995 18.6163 30.1994 18.0203L30.1996 16.941H31.9871C32.5794 16.941 33.101 16.4605 33.1033 15.8662Z"/><path fill-opacity="0.64" d="M42.2753 16.0022V14.4773H40.7109V16.0022H42.2753ZM46.9543 16.1019C47.7128 16.1019 48.3551 15.9119 48.8813 15.5319C49.4075 15.1518 49.7749 14.6435 49.9835 14.007V16.0022H51.2777V5.45605H49.9835V10.1733C49.7749 9.53674 49.4075 9.02844 48.8813 8.64839C48.3551 8.26835 47.7128 8.07833 46.9543 8.07833C46.2622 8.07833 45.6459 8.23985 45.1055 8.56289C44.565 8.88592 44.1407 9.35147 43.8326 9.95953C43.5245 10.5676 43.3704 11.2802 43.3704 12.0973C43.3704 12.9143 43.5245 13.6245 43.8326 14.2279C44.1407 14.8312 44.565 15.2944 45.1055 15.6174C45.6459 15.9404 46.2622 16.1019 46.9543 16.1019ZM47.324 14.9618C46.5276 14.9618 45.89 14.7077 45.4112 14.1994C44.9324 13.6911 44.693 12.9904 44.693 12.0973C44.693 11.2042 44.9324 10.5035 45.4112 9.99516C45.89 9.48686 46.5276 9.23271 47.324 9.23271C47.836 9.23271 48.2935 9.34909 48.6964 9.58187C49.0994 9.81464 49.4146 10.1496 49.6422 10.5866C49.8697 11.0236 49.9835 11.5272 49.9835 12.0973C49.9835 12.6673 49.8697 13.1685 49.6422 13.6008C49.4146 14.0331 49.0994 14.368 48.6964 14.6055C48.2935 14.8431 47.836 14.9618 47.324 14.9618ZM56.7957 16.1019C57.4499 16.1019 58.0378 15.9832 58.5592 15.7457C59.0807 15.5081 59.505 15.1756 59.8321 14.748C60.1592 14.3205 60.3701 13.8359 60.4649 13.2944H59.0854C58.9906 13.8264 58.7323 14.2516 58.3103 14.5699C57.8884 14.8882 57.3646 15.0473 56.7388 15.0473C56.0467 15.0473 55.4613 14.8241 54.9825 14.3775C54.5037 13.931 54.25 13.2611 54.2216 12.368H60.4649C60.5029 12.1685 60.5218 11.931 60.5218 11.6555C60.5218 10.9999 60.3725 10.4013 60.0738 9.85977C59.7752 9.31822 59.3438 8.88592 58.7797 8.56289C58.2155 8.23985 57.5542 8.07833 56.7957 8.07833C56.0467 8.07833 55.383 8.23985 54.8047 8.56289C54.2263 8.88592 53.7736 9.35147 53.4465 9.95953C53.1194 10.5676 52.9559 11.2802 52.9559 12.0973C52.9559 12.9143 53.1194 13.6245 53.4465 14.2279C53.7736 14.8312 54.2263 15.2944 54.8047 15.6174C55.383 15.9404 56.0467 16.1019 56.7957 16.1019ZM59.2134 11.741H54.2216C54.2595 10.8859 54.5202 10.2374 55.0038 9.79564C55.4873 9.35384 56.0846 9.13295 56.7957 9.13295C57.2413 9.13295 57.6538 9.22796 58.033 9.41798C58.4123 9.608 58.7109 9.89778 58.929 10.2873C59.1471 10.6769 59.2419 11.1614 59.2134 11.741ZM65.9972 16.0022L69.0549 8.17809H67.6611L65.2434 14.6198L62.7973 8.17809H61.4036L64.4612 16.0022H65.9972Z"/></g></svg>`;

const dailyLogoDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  DAILY_LOGO_SVG,
)}`;

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
  // The daily.dev icon + wordmark lockup.
  daily: HTMLImageElement | null;
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

// Brand header — the daily.dev lockup + the game name, left-aligned at (x,y).
const drawBrandHeader = (
  ctx: Ctx,
  assets: Assets,
  x: number,
  y: number,
): void => {
  let cursor = x;
  if (assets.daily) {
    const hgt = 26;
    const wid = (hgt * 118) / 20;
    ctx.drawImage(assets.daily, x, y, wid, hgt);
    cursor = x + wid + 22;
  }
  ctx.textAlign = 'left';
  ctx.font = `800 24px ${FONT}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('WEEKLY TECH NEWS QUIZ', cursor, y + 20);
};

const drawFooter = (ctx: Ctx, w: number, y: number): void => {
  ctx.font = `bold 34px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Play at daily.dev', w / 2, y + 6);
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

  drawFooter(ctx, w, h - 70);
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
  if (assets.daily) {
    const hgt = 44;
    const wid = (hgt * 118) / 20;
    ctx.drawImage(assets.daily, (w - wid) / 2, 70, wid, hgt);
  }
  ctx.font = `800 30px ${FONT}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('WEEKLY TECH NEWS QUIZ', w / 2, 168);
  if (assets.avatar) {
    drawAvatar(ctx, assets.avatar, w / 2, 320, 132);
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
    const gh = 360;
    drawCover(ctx, assets.gif, (w - gw) / 2, 850, gw, gh, 28);
  }
  drawFooter(ctx, w, h - 60);
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

  const [daily, avatar, gif] = await Promise.all([
    loadSafe(dailyLogoDataUrl),
    loadSafe(params.imageUrl, 'anonymous'),
    loadSafe(params.gifUrl, 'anonymous'),
  ]);
  const assets: Assets = { daily, avatar, gif };

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

export interface WeeklyQuizOgImageParams {
  title: string;
  correctCount: number;
  totalQuestions: number;
  percentile: number;
  gifUrl?: string | null;
}

// A generic, per-score social card (1200x630 Open Graph size) — no personal
// data, so it can be pre-rendered per score and served as the shared link's
// og:image. Returns a PNG data URL (null if it can't render).
export const createWeeklyQuizOgImage = async (
  params: WeeklyQuizOgImageParams,
): Promise<string | null> => {
  if (typeof document === 'undefined') {
    return null;
  }
  const w = 1200;
  const h = 630;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const [daily, gif] = await Promise.all([
    loadSafe(dailyLogoDataUrl),
    loadSafe(params.gifUrl, 'anonymous'),
  ]);

  drawBackground(ctx, w, h);

  // GIF fills the right third, faded into the surface on its left edge.
  const gifW = 470;
  if (gif) {
    drawCover(ctx, gif, w - gifW, 0, gifW, h, 0);
    const scrim = ctx.createLinearGradient(w - gifW, 0, w - gifW + 220, 0);
    scrim.addColorStop(0, 'rgba(13, 13, 18, 1)');
    scrim.addColorStop(1, 'rgba(13, 13, 18, 0)');
    ctx.fillStyle = scrim;
    ctx.fillRect(w - gifW, 0, 220, h);
  }

  const pad = 70;
  const textW = w - gifW - pad;
  drawBrandHeader(ctx, { daily, avatar: null, gif: null }, pad, 60);

  ctx.textAlign = 'left';
  fitFont(ctx, params.title, 'bold', 78, textW);
  ctx.fillStyle = '#fff';
  ctx.fillText(params.title, pad, 250);

  ctx.font = `500 30px ${FONT}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(`Better than ${params.percentile}% of players`, pad, 300);

  ctx.font = `bold 128px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.fillText(`${params.correctCount}/${params.totalQuestions}`, pad, 440);
  ctx.font = `700 30px ${FONT}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('CORRECT', pad, 486);

  ctx.font = `bold 34px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.fillText('What would you get?', pad, 556);

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
