// Merge a user's saved v2 rail order with the current default order.
//
// The saved sequence wins — it is what the user dragged — but it goes stale in
// two ways: ids disappear (a tab is removed, or gamification is opted out) and
// ids appear (a tab ships after the user already saved a layout). Stale ids are
// dropped; new ones are spliced into the slot they hold in `defaults`.
//
// Anchoring new items to the default order matters: pushing them to one end
// instead would drop them somewhere they were never designed to sit, and every
// later change to the default order would silently reintroduce that mismatch.
export const mergeRailOrder = <T>(saved: T[], defaults: T[]): T[] => {
  const known = saved.filter((id) => defaults.includes(id));

  if (!known.length) {
    return defaults;
  }

  const merged = [...known];
  defaults.forEach((id, index) => {
    if (merged.includes(id)) {
      return;
    }
    // Land it directly after the nearest item that precedes it by default and
    // is actually on the rail; with no such item it goes first.
    const anchor = defaults
      .slice(0, index)
      .reverse()
      .find((candidate) => merged.includes(candidate));
    merged.splice(anchor === undefined ? 0 : merged.indexOf(anchor) + 1, 0, id);
  });

  return merged;
};
