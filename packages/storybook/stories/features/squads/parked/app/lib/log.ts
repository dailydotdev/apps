// Parked: these join the LogEvent enum in shared/src/lib/log.ts (squads
// section) when the features ship.
export const ParkedLogEvent = {
  ShowSquadWelcome: 'show squad welcome',
  ClickSquadWelcomeCta: 'click squad welcome cta',
  ClickSquadJob: 'click squad job',
  ClickSquadJobApply: 'click squad job apply',
  ClaimSquadPerk: 'claim squad perk',
  ClickSquadPerkRedeem: 'click squad perk redeem',
} as const;
