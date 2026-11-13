import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Page,
  PageHeader,
  Section,
  Table,
} from './shell';

const meta: Meta = {
  title: 'Avatar Characters/7. Rollout',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Code = ({ children }: { children: string }) => (
  <code className="rounded-6 bg-surface-float px-1 text-text-secondary">
    {children}
  </code>
);

const resolverSketch = `// packages/shared/src/lib/avatarCharacters.ts
export const AVATAR_CHARACTERS_V1 = [/* frozen, append-only via v2 */];

export const isFallbackAvatar = (src?: string | null): boolean =>
  !src || src.includes('/public/noProfile');

export const getAvatarCharacterSrc = (
  userId: string,
  sizePx: number,
): string => {
  const character =
    AVATAR_CHARACTERS_V1[fnv1a(userId) % AVATAR_CHARACTERS_V1.length];
  return sizePx <= 40 ? character.faceSrc : character.src;
};

// ProfilePicture, one choke point for ~100 components
const src = isCharactersOn && isFallbackAvatar(user.image) && user.id
  ? getAvatarCharacterSrc(user.id, sizeToPx[size])
  : user.image;`;

export const Rollout: StoryObj = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="How do we ship it without breaking anything?"
        title="Three phases. The first one needs no backend and no migration."
        goal="Characters everywhere behind a flag in one frontend PR, then make them choosable, then make them real data."
        metric="Phase one: gray fallback impressions to zero with no change in avatar-related errors or LCP."
      >
        <p>
          Accounts without a photo already store the same <Code>noProfile</Code>{' '}
          URL, which is exactly what makes this cheap. The client can recognize
          it and swap in the character, while every check that asks &ldquo;does
          this person have a real photo&rdquo; keeps working untouched.
        </p>
      </PageHeader>

      <Section title="Phases">
        <Table
          head={['Phase', 'What ships', 'Where', 'Gate']}
          rows={[
            [
              <span key="1" className="font-bold text-text-primary">
                1. Render
              </span>,
              'Every no-photo user renders their assigned character, sized by crop. Patchy on official accounts, a workplace object on organizations, a gathering on squads without a cover, a ghost on deleted users.',
              <>
                New <Code>lib/avatarCharacters.ts</Code>; resolve in{' '}
                <Code>ProfilePicture.tsx</Code> and the avatar branch of{' '}
                <Code>image/Image.tsx</Code>; the 19 direct{' '}
                <Code>fallbackImages.avatar</Code> call sites (Spotlight,
                UserEntityCard, DevCard, PostUsersHighlights and others) pass
                the user through.
              </>,
              <>
                <Code>avatar_characters</Code> flag in{' '}
                <Code>featureManagement.ts</Code>, default false
              </>,
            ],
            [
              <span key="2" className="font-bold text-text-primary">
                2. Choose
              </span>,
              'The signup reveal and the settings picker. Choosing writes the character URL into user.image, so a choice is real data from day one.',
              <>
                <Code>RegistrationFieldsForm</Code>,{' '}
                <Code>SocialRegistrationForm</Code>,{' '}
                <Code>SettingsLayout/Profile</Code> via{' '}
                <Code>ControlledAvatarUpload</Code> and <Code>ImageInput</Code>.
                daily-api must accept a whitelisted character URL alongside
                uploads.
              </>,
              'Same flag, plus an onboarding experiment arm for the reveal',
            ],
            [
              <span key="3" className="font-bold text-text-primary">
                3. Own it
              </span>,
              'The backend assigns at signup and backfills existing noProfile rows with the same FNV-1a hash, so nobody’s face changes. The client mapping is deleted.',
              <>
                daily-api. Emails, OG images, the public API, the extension and
                the native wrappers all get the same face for free.
              </>,
              'Flag removed once the backfill lands',
            ],
          ]}
        />
      </Section>

      <Section
        title="The resolver, roughly"
        description="Sketch, not the PR. The interesting constraints are the frozen v1 list, keying on id, and choosing the crop by rendered size."
      >
        <pre className="overflow-x-auto rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-5 font-mono text-text-secondary typo-footnote">
          {resolverSketch}
        </pre>
      </Section>

      <Section title="Things that would bite us">
        <Table
          head={['Risk', 'Why it matters', 'Answer']}
          rows={[
            [
              'Hiring trust',
              'RecruiterSetupChecklist checks image !== fallbackImages.avatar to ask for a real photo.',
              'Phase one leaves the stored URL alone, so it keeps working. Phase two and three need an isAvatarCharacter(url) helper used by every “has a photo” check.',
            ],
            [
              'Two noProfile URLs',
              'config.ts and AgentDemoProviders sign the same image with different Cloudinary signatures.',
              'Match on the /public/noProfile path, never the full URL.',
            ],
            [
              'Weight',
              'The source renders are 1254 pixels and about 1.8 MB each.',
              'Serve through Cloudinary with f_auto and a width per crop (64 for the face, 192 for full). These Storybook files are 384 pixel webp at about 15 KB.',
            ],
            [
              'Hydration flash',
              'If the client resolves after paint, the silhouette flashes then swaps.',
              'The resolver is pure and synchronous, so server render and client agree on the first paint. Verify with the JS-off screenshot pass.',
            ],
            [
              'Egg stigma',
              'A recognizable “default set” can become a signal for low-effort or spam accounts.',
              'Many characters, every one pickable, no public “no photo” marker. Watch spam reports by avatar type after launch.',
            ],
            [
              'Representation',
              'A human face assigned at random guesses gender, skin and faith.',
              'People characters are pick-only, permanently. The picker set has to grow so anyone can find themselves.',
            ],
          ]}
        />
      </Section>

      <Section title="Rules, short version">
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="Key on user id">
            Usernames change. Faces should not.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Freeze the pool">
            New characters go to v2 or the picker, never into v1.
          </Callout>
          <Callout
            tone={CalloutTone.Good}
            title="Choose the crop by rendered size"
          >
            Face at 40 and below, full render above.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Auto-assign a human face">
            Creatures and bots only.
          </Callout>
          <Callout
            tone={CalloutTone.Bad}
            title="Hand out Patchy, the ghost or an object"
          >
            They mean daily.dev, deleted accounts, organizations and squads.
          </Callout>
          <Callout
            tone={CalloutTone.Bad}
            title="Label a character as a placeholder"
          >
            Visitors see an avatar. Only the owner sees the control.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
