// Every title in the parked folder, for links and responsive sheets. A
// story file's own `title` must stay a plain string literal (Storybook
// reads it without running the file), so each one repeats its title here.

const root = 'Verified Squads (parked)';

export const titles = {
  readMe: `${root}/Read me first`,
  welcomeSpec: `${root}/1. Welcome pop-up/Spec`,
  welcomePopup: `${root}/1. Welcome pop-up/Pop-up`,
  welcomeManage: `${root}/1. Welcome pop-up/Manage page`,
  welcomeResponsive: `${root}/1. Welcome pop-up/Responsive`,
  audienceSpec: `${root}/2. Audience insights/Spec`,
  audienceManage: `${root}/2. Audience insights/Manage analytics`,
  audienceResponsive: `${root}/2. Audience insights/Responsive`,
  perksSpec: `${root}/4. Member perks/Spec`,
  perksTab: `${root}/4. Member perks/Perks tab`,
  perksPage: `${root}/4. Member perks/Perk page`,
  perksManage: `${root}/4. Member perks/Manage page`,
  perksResponsive: `${root}/4. Member perks/Responsive`,
};
