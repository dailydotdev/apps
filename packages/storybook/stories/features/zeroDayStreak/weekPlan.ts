// The seven days of the zero-day run, and every line of copy the modal says.
//
// The ladder is Cores climbing, with two freeze days breaking it up. The
// feature tour (Brief, AI Search, DevCard) and both Plus days are gone for now,
// so the only two things the week pays are the two things the counters track.
// Two rules still hold:
//
// 1. Nothing is hidden. Every tile names its reward from day one. Concrete
//    anticipation beats a mystery box, and this audience distrusts them.
// 2. The run never pays less than the day before. A dip reads as a downgrade,
//    and "Tomorrow: 150 Cores" after a 250-Core day is a reason to stop. The
//    freeze days sit where a dip would otherwise land: they interrupt the climb
//    without breaking it, because they are not the same unit.

export enum GiftKind {
  Freeze = 'freeze',
  Cores = 'cores',
}

export interface PlannedDay {
  day: number;
  kind: GiftKind;
  /** Cores paid. 0 on the two freeze days. */
  cores: number;
  /**
   * The reward, split so a tile can set the number big and the unit under it.
   * "100" reads as a quantity at a glance; "100 Cores" on one line reads as a
   * label, and at tile width it wrapped mid-phrase ("+1 freeze / day").
   */
  amount: string;
  unit: string;
  /** Streak freeze days banked. Only day 6 gives any. */
  freezeDays?: number;
  /**
   * One sentence on what the reward actually is, shown on hover.
   *
   * Every name in this ladder is either a product word a first-week user has
   * not met yet ("DevCard", "Cores", "Brief") or an abbreviation ("24h Plus").
   * The tile has room for the name and nothing else, so the explanation has to
   * live somewhere — and a reward nobody understands cannot pull anyone back.
   */
  explainer: string;
}

export const weekPlan: PlannedDay[] = [
  {
    day: 1,
    kind: GiftKind.Cores,
    cores: 100,
    amount: '100',
    unit: 'Cores',
    explainer:
      "daily.dev's currency. Restore a lost streak, award a post or comment you rate, or buy a streak freeze.",
  },
  {
    day: 2,
    kind: GiftKind.Cores,
    cores: 150,
    amount: '150',
    unit: 'Cores',
    explainer:
      "daily.dev's currency. Restore a lost streak, award a post or comment you rate, or buy a streak freeze.",
  },
  {
    day: 3,
    kind: GiftKind.Freeze,
    cores: 0,
    freezeDays: 1,
    amount: '+1',
    unit: 'Freeze day',
    explainer: 'A day your streak survives without reading.',
  },
  {
    day: 4,
    kind: GiftKind.Cores,
    cores: 250,
    amount: '250',
    unit: 'Cores',
    explainer:
      "daily.dev's currency. Restore a lost streak, award a post or comment you rate, or buy a streak freeze.",
  },
  {
    day: 5,
    kind: GiftKind.Cores,
    cores: 400,
    amount: '400',
    unit: 'Cores',
    explainer:
      "daily.dev's currency. Restore a lost streak, award a post or comment you rate, or buy a streak freeze.",
  },
  {
    day: 6,
    kind: GiftKind.Freeze,
    cores: 0,
    freezeDays: 2,
    amount: '+2',
    unit: 'Freeze days',
    explainer: 'Two days your streak survives without reading.',
  },
  {
    // The finale is deliberately more than double day 5. The whole week is one
    // currency now, so the only way the last day can feel like an event is the
    // size of the number.
    day: 7,
    kind: GiftKind.Cores,
    cores: 1000,
    amount: '1000',
    unit: 'Cores',
    explainer:
      "daily.dev's currency. Restore a lost streak, award a post or comment you rate, or buy a streak freeze.",
  },
];

export const FINAL_DAY = weekPlan.length;
