/**
 * The profile page wraps every section in its gutter (16px on phones, 24px
 * from tablet up), so a horizontally scrolling strip clips short of the page
 * edge and the content looks abruptly cut off instead of continuing
 * off-screen. Cancel that padding on the scroll container and re-apply it
 * inside, so the strip clips at the card edge while its items stay aligned
 * with the section heading.
 */
export const profileStripBleed = '-mx-4 px-4 tablet:-mx-6 tablet:px-6';

export const profileSecondaryFieldStyles = {
  outerLabel: '!px-0 !typo-callout',
  baseField: '!h-12',
};

/**
 * Mirrors the work experience limits enforced by the API
 * (`src/common/schema/profile.ts`); the form blocks these client side so a
 * save is never rejected for something the input could have prevented.
 */
export const maxProfileSkills = 50;
export const maxProfileSkillLength = 100;
