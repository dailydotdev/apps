// The den art is one fixed-size picture shown with object-fit: cover in a box
// that changes shape with the page. These map points on the picture to the
// box, so the clickable spots stay on the window, the shelf and the robot.
export const PATCHY_DEN_SIZE = { width: 1376, height: 768 };

export const patchyDenSpots = ['window', 'shelf', 'robot', 'mic'] as const;
export type PatchyDenSpot = (typeof patchyDenSpots)[number];

// Points on the den art (PATCHY_DEN_SIZE pixels).
export const patchyDenSpotPoint: Record<
  PatchyDenSpot,
  { x: number; y: number }
> = {
  window: { x: 272, y: 236 },
  shelf: { x: 846, y: 92 },
  robot: { x: 1190, y: 258 },
  mic: { x: 588, y: 387 },
};

// Where Patchy's head is, for the hearts and sparkles.
export const PATCHY_DEN_HEAD = { x: 800, y: 260 };

interface Size {
  width: number;
  height: number;
}

// The point on screen (in box pixels) of a point on the art, or null when
// cover cropped it away.
export const toPatchyDenBoxPoint = (
  box: Size,
  point: { x: number; y: number },
  image: Size = PATCHY_DEN_SIZE,
): { x: number; y: number } | null => {
  if (box.width <= 0 || box.height <= 0) {
    return null;
  }
  const scale = Math.max(box.width / image.width, box.height / image.height);
  const x = (box.width - image.width * scale) / 2 + point.x * scale;
  const y = (box.height - image.height * scale) / 2 + point.y * scale;
  if (x < 0 || y < 0 || x > box.width || y > box.height) {
    return null;
  }
  return { x, y };
};
