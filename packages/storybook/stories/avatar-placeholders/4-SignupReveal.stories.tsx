import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Callout,
  CalloutTone,
  Page,
  PageHeader,
  Section,
  Surface,
} from './shell';
import {
  AvatarImage,
  AvatarPicker,
  DeviceFrame,
  EditMotion,
  isCompact,
  PickerTab,
} from './6-edit-profile/kit';
import type { AvatarState, Person } from './6-edit-profile/model';
import {
  AvatarSource,
  Device,
  displayedCharacter,
  scenarios,
} from './6-edit-profile/model';

const meta: Meta = {
  title: 'Avatar Characters/4. Signup reveal',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const person: Person = scenarios[0].person;

const Halo = ({
  state,
  sizePx,
}: {
  state: AvatarState;
  sizePx: number;
}): ReactElement => {
  const character = displayedCharacter(state, person);
  return (
    <div className="relative" style={{ width: sizePx, height: sizePx }}>
      {character && (
        <img
          key={`halo-${character.id}`}
          src={character.faceSrc}
          alt=""
          aria-hidden
          className="ap-halo absolute inset-0 size-full scale-125 rounded-max object-cover blur-2xl"
        />
      )}
      <AvatarImage
        state={state}
        person={person}
        sizePx={sizePx}
        className="ap-reveal relative"
      />
    </div>
  );
};

enum Stage {
  Reveal = 'reveal',
  Kept = 'kept',
}

const RevealCard = ({ device }: { device: Device }): ReactElement => {
  const [state, setState] = useState<AvatarState>({
    source: AvatarSource.Assigned,
  });
  const [stage, setStage] = useState(Stage.Reveal);
  const [pickerTab, setPickerTab] = useState<PickerTab | undefined>();
  const compact = isCompact(device);
  const character = displayedCharacter(state, person);
  const isPhoto = !character;

  const title = (() => {
    if (stage === Stage.Kept) {
      return isPhoto ? 'Looking good.' : `${character?.name} it is.`;
    }
    return `Meet ${character?.name}.`;
  })();

  const body =
    stage === Stage.Kept
      ? 'You can change it anytime from your profile.'
      : `This is how people will see you on daily.dev until you add a photo. Keep ${character?.name}, pick someone else, or upload your own.`;

  const actions =
    stage === Stage.Kept ? (
      <button
        type="button"
        onClick={() => {
          setState({ source: AvatarSource.Assigned });
          setStage(Stage.Reveal);
        }}
        className="flex items-center justify-center gap-1 text-text-tertiary typo-footnote hover:text-text-primary"
      >
        <VIcon size={IconSize.Size16} className="text-accent-avocado-default" />
        Replay the reveal
      </button>
    ) : (
      <div
        className="ap-rise flex w-full flex-col gap-2"
        style={{ '--ap-delay': '280ms' } as React.CSSProperties}
      >
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={() => setStage(Stage.Kept)}
        >
          Keep {character?.name}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            onClick={() => setPickerTab(PickerTab.Characters)}
          >
            Choose another
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            icon={<UploadIcon />}
            onClick={() => setPickerTab(PickerTab.Photo)}
          >
            Upload a photo
          </Button>
        </div>
      </div>
    );

  const content = (
    <div
      className={classNames(
        'flex w-full flex-col items-center gap-6 text-center',
        compact ? 'h-full px-6 pb-8 pt-16' : 'max-w-[28rem]',
      )}
    >
      <Halo state={state} sizePx={compact ? 128 : 144} />
      <div
        className="ap-rise flex flex-col gap-2"
        style={{ '--ap-delay': '180ms' } as React.CSSProperties}
      >
        <span className="text-text-tertiary typo-footnote">
          {stage === Stage.Kept ? 'All set' : 'Your avatar'}
        </span>
        <h3 className="typo-title1">{title}</h3>
        <p className="ap-pretty text-text-tertiary typo-callout">{body}</p>
      </div>
      <div className={classNames('w-full', compact && 'mt-auto')}>
        {actions}
      </div>
    </div>
  );

  const picker = pickerTab && (
    <AvatarPicker
      key={pickerTab}
      device={device}
      state={state}
      person={person}
      initialTab={pickerTab}
      onApply={(next) => {
        setState(next);
        setPickerTab(undefined);
        setStage(Stage.Kept);
      }}
      onClose={() => setPickerTab(undefined)}
    />
  );

  if (compact) {
    return (
      <DeviceFrame device={device} height={720}>
        <div className="flex h-full flex-col">
          <div className="mx-6 mt-10 h-1 rounded-max bg-surface-float">
            <div className="h-full w-2/3 rounded-max bg-accent-cabbage-default" />
          </div>
          {content}
        </div>
        {picker}
      </DeviceFrame>
    );
  }

  return (
    <div className="relative flex min-h-[44rem] w-full items-center justify-center overflow-hidden rounded-24 bg-background-subtle px-4 py-10">
      <div className="ap-elevated flex w-full max-w-[28rem] flex-col items-center rounded-24 border border-border-subtlest-tertiary bg-background-default px-6 pb-6 pt-10">
        {content}
      </div>
      {picker}
    </div>
  );
};

export const SignupReveal: StoryObj = {
  render: () => (
    <Page>
      <EditMotion />
      <PageHeader
        eyebrow="How does an assigned face become a chosen one?"
        title="Meet it once at signup: keep it, swap it, or add a photo. Never get nagged about it."
        goal="Turn an assigned character into one people would pick again."
        metric="No-photo signups who keep or pick a character in week one. Guardrail: photo upload rate holds."
      >
        <p>
          Twitter retired the egg because it became shorthand for throwaway
          accounts. The egg was one image nobody chose. Two moves keep
          characters from that fate: there are many of them, and every one of
          them can be a choice. The reveal turns the assignment into a decision.
        </p>
        <p>
          Shown once, after an email signup or any signup whose provider
          returned no photo. Google and GitHub signups with a real photo skip
          it. Choose another and Upload a photo open the same picker as Edit
          profile (chapter 6), so there is one editor to build.
        </p>
      </PageHeader>

      <Section
        title="Laptop and tablet"
        description="A card in the signup funnel, where today's account details step shows the gray avatar. Keep is the primary action: it is a real choice, and the one most people should make. Try all three buttons."
      >
        <RevealCard device={Device.Laptop} />
      </Section>

      <Section
        title="Mobile"
        description="A full funnel step. The buttons sit at the bottom within thumb reach, and the picker opens as a bottom sheet over the step."
      >
        <div className="flex flex-wrap items-start gap-6">
          <RevealCard device={Device.Mobile} />
          <Surface
            label="What gets stored"
            note="Keep stores the character explicitly, so adoption is measurable and the choice survives a future change of the assignment pool."
            className="max-w-[22rem]"
          >
            <ul className="flex flex-col gap-2 text-text-tertiary typo-footnote">
              <li>
                <span className="font-bold text-text-primary">Keep</span>:
                user.image becomes the character URL.
              </li>
              <li>
                <span className="font-bold text-text-primary">
                  Choose another
                </span>
                : the chosen character URL.
              </li>
              <li>
                <span className="font-bold text-text-primary">
                  Upload a photo
                </span>
                : the cropped upload.
              </li>
              <li>
                <span className="font-bold text-text-primary">
                  Leaves the step
                </span>
                : nothing, the assigned character keeps rendering from the id.
              </li>
            </ul>
          </Surface>
        </div>
      </Section>

      <Section title="Guardrails">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Upload stays first-class">
            Same weight as the characters, never behind a &ldquo;more
            options&rdquo; link. Hiring surfaces and recruiter checklists still
            ask for a real photo, and should.
          </Callout>
          <Callout
            tone={CalloutTone.Bad}
            title="Profile completion nags about the character"
          >
            Do not count a character as a missing photo in public completion
            meters. Keep the recruiter checklist honest by checking the URL, not
            by shaming the avatar.
          </Callout>
          <Callout
            tone={CalloutTone.Bad}
            title="Showing names next to faces in threads"
          >
            &ldquo;Nocturne&rdquo; belongs to the reveal and the picker. In a
            thread it would read as the person&apos;s name.
          </Callout>
          <Callout tone={CalloutTone.Good} title="A way back">
            The picker always pins the character you were given first. Swapping
            should feel safe to try.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
