// Duplicate route for the gamification settings page under the Game Center
// category path. Reuses the exact same page component (and its getLayout /
// layoutProps) as /settings/customization/gamification, but the /game-center/*
// path keeps the Game Center rail panel active. The canonical
// /settings/customization/gamification page keeps the Settings panel.
export { default } from '../settings/customization/gamification';
