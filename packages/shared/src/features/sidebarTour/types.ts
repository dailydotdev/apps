export type SidebarTourStepId = 'rail' | 'dock' | 'gameCenter';

// Optional payload a step carries beside its sentence: the inline compact-mode
// switch, or the real Streak/Game Center panel held open for the step.
export type SidebarTourStepExtra = 'compactSwitch' | 'gameCenterPanel';

// Where the card sits against its target. 'center' suits a tall target; 'top'
// lines the card's first line up with the top of a single tab, which is where
// that tab's own label and count sit.
export type SidebarTourStepAlign = 'center' | 'top';

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
  // The rail step's target is the whole tab strip, which the lifted rail and
  // the scrim already spotlight. Ringing it as well drew a second sidebar-sized
  // outline that reads as UI the layout does not have.
  hasHighlight?: boolean;
}

export type SidebarTourTrigger = 'auto' | 'support_menu';

// Something else took the screen mid-tour. The user never chose to leave, so
// these never write the seen flag.
export type SidebarTourInterruptReason = 'navigation' | 'popup' | 'modal';

// Every ending the user did not press a button for. `target_lost` is the one
// that still ran the tour out, so it is the only one that retires it.
export type SidebarTourEndReason = SidebarTourInterruptReason | 'target_lost';

export type SidebarPinCoachMethod = 'drag' | 'button';
