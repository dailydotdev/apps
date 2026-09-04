import { resolveSidebarTourSteps } from './steps';

const RAIL_TABLIST =
  '<div role="tablist" aria-label="Sidebar categories"></div>';
const DOCK_CUSTOMIZE =
  '<button type="button" aria-label="Customize shortcuts"></button>';
const GAME_CENTER =
  '<button type="button" id="sidebar-category-gameCenter"></button>';

const mountRail = (html: string): (() => void) => {
  const rail = document.createElement('div');
  rail.innerHTML = html;
  document.body.appendChild(rail);
  return () => rail.remove();
};

describe('resolveSidebarTourSteps', () => {
  let unmountRail: () => void = () => undefined;

  afterEach(() => {
    unmountRail();
    unmountRail = () => undefined;
  });

  it('runs nothing when the rail is not in the document', () => {
    expect(resolveSidebarTourSteps()).toEqual([]);
  });

  it('runs only the rail step when nothing else is on screen', () => {
    unmountRail = mountRail(RAIL_TABLIST);

    expect(resolveSidebarTourSteps().map((step) => step.id)).toEqual(['rail']);
  });

  it('keeps the declared order when the Game Center tab is missing', () => {
    unmountRail = mountRail(`${DOCK_CUSTOMIZE}${RAIL_TABLIST}`);

    expect(resolveSidebarTourSteps().map((step) => step.id)).toEqual([
      'rail',
      'dock',
    ]);
  });

  it('runs all three steps in the declared order', () => {
    unmountRail = mountRail(`${GAME_CENTER}${DOCK_CUSTOMIZE}${RAIL_TABLIST}`);

    expect(resolveSidebarTourSteps().map((step) => step.id)).toEqual([
      'rail',
      'dock',
      'gameCenter',
    ]);
  });
});
