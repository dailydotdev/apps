export type SidebarTourStepId = 'rail' | 'dock' | 'gameCenter';

// Optional payload a step carries beside its sentence: the inline compact-mode
// switch, or the real Streak/Game Center panel held open for the step.
export type SidebarTourStepExtra = 'compactSwitch' | 'gameCenterPanel';

export interface SidebarTourStep {
  id: SidebarTourStepId;
  message: string;
  // CSS selector resolved against the live rail. The rail is user-reorderable,
  // folds tabs into the "More" menu on short viewports and drops the Streak tab
  // when gamification is off, so a step is only run when its target is actually
  // in the document (see resolveSidebarTourSteps).
  target: string;
  extra?: SidebarTourStepExtra;
}

export type SidebarTourTrigger = 'auto' | 'support_menu';

export type SidebarPinCoachMethod = 'drag' | 'button';
