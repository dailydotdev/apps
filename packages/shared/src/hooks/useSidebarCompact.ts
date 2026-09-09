import { useSettingsBooleanFlag } from './useSettingsBooleanFlag';

// The v2 rail ships without the labels under its icons, so an account that
// never touched the density setting gets compact. Only an explicit `false`
// (the user picking Comfortable) brings the labels back.
//
// Read it through here rather than the raw flag: the rail sets its own width
// from this and MainLayout pads the content to match, so the two disagreeing
// would leave the content overlapping the rail or short of it.
export const useSidebarCompact = (): ReturnType<
  typeof useSettingsBooleanFlag
> => useSettingsBooleanFlag('sidebarCompact', true);
