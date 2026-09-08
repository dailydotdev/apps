export type SidebarTourStepId = 'rail' | 'dock' | 'gameCenter';

// Optional payload a step carries beside its sentence: the inline compact-mode
// switch, or the real Streak/Game Center panel held open for the step.
export type SidebarTourStepExtra = 'compactSwitch' | 'gameCenterPanel';

// Where the card sits vertically. 'center' suits a tall target. 'top' lines it
// up with the top of the target itself. 'panelTop' lines it up with the panel
// the step opens, which is where that panel leads with the thing being taught
// (the streak count), rather than with the rail tab far below it.
export type SidebarTourStepAlign = 'center' | 'top' | 'panelTop';

// How firmly the ring marks the target. 'default' stands a couple of pixels off
// a small control. 'tight' hugs the target instead, for the rail step: its
// target is the whole tab strip, and an outset ring around something that large
// reads as a second sidebar rather than as a highlight.
export type SidebarTourStepHighlight = 'default' | 'tight';

// A step whose subject is a gesture carries a short demo above its sentence.
export type SidebarTourStepMedia = 'dockDrag';

export interface SidebarTourStep {
  id: SidebarTourStepId;
  message: string;
  // CSS selector resolved against the live rail. The rail is user-reorderable,
  // folds tabs into the "More" menu on short viewports and drops the Streak tab
  // when gamification is off, so a step is only run when its target is actually
  // in the document (see resolveSidebarTourSteps).
  target: string;
  extra?: SidebarTourStepExtra;
  align?: SidebarTourStepAlign;
  highlight?: SidebarTourStepHighlight;
  media?: SidebarTourStepMedia;
}

export type SidebarTourTrigger = 'auto' | 'support_menu';

// Something else took the screen mid-tour. The user never chose to leave, so
// these never write the seen flag.
export type SidebarTourInterruptReason = 'navigation' | 'modal';

// Every ending the user did not press a button for. `target_lost` is the one
// that still ran the tour out, so it is the only one that retires it.
export type SidebarTourEndReason = SidebarTourInterruptReason | 'target_lost';

export type SidebarPinCoachMethod = 'drag' | 'button';
