import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import {
  Callout,
  CalloutTone,
  CharacterAvatar,
  Chip,
  Page,
  PageHeader,
  Section,
} from './shell';
import type { Character } from './data';
import {
  assignablePoolV1,
  characterById,
  characters,
  FACE_CROP_MAX_PX,
  Family,
  familyLabel,
  familyRule,
} from './data';
import { TodayAvatar } from './surfaces';

const meta: Meta = {
  title: 'Avatar Characters/1. The cast',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const ladder = [16, 20, 24, 32, 40, 48, 64, 96];
const families = [
  Family.Critter,
  Family.Visitor,
  Family.Person,
  Family.Reserved,
];

const Inspector = ({ character }: { character: Character }) => (
  <div className="ap-elevated flex flex-col gap-6 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6 laptop:flex-row laptop:items-center">
    <div className="flex items-center gap-5 laptop:w-80">
      <CharacterAvatar
        character={character}
        sizePx={120}
        animationKey={character.id}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="typo-title2">{character.name}</span>
        <span className="ap-pretty text-text-tertiary typo-callout">
          {character.line}
        </span>
        <Chip>{familyRule[character.family]}</Chip>
      </div>
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-end gap-4">
        {ladder.map((size) => (
          <div key={size} className="flex flex-col items-center gap-2">
            <CharacterAvatar
              character={character}
              sizePx={size}
              animationKey={`${character.id}-${size}`}
            />
            <span
              className={classNames(
                'ap-tabular typo-caption2',
                size <= FACE_CROP_MAX_PX
                  ? 'text-accent-cabbage-default'
                  : 'text-text-quaternary',
              )}
            >
              {size}
            </span>
          </div>
        ))}
      </div>
      <span className="text-text-quaternary typo-caption1">
        The production size ladder.{' '}
        <span className="text-accent-cabbage-default">Purple sizes</span> get
        the face crop, larger ones the full render.
      </span>
      {character.note && (
        <span className="rounded-10 bg-overlay-float-bun px-3 py-2 text-accent-bun-default typo-footnote">
          {character.note}
        </span>
      )}
    </div>
  </div>
);

const CastGrid = () => {
  const [selectedId, setSelectedId] = useState('nocturne');

  return (
    <div className="flex flex-col gap-10">
      <Inspector character={characterById[selectedId]} />
      {families.map((family) => {
        const members = characters.filter((item) => item.family === family);

        return (
          <div key={family} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="typo-title3">{familyLabel[family]}</h3>
              <span className="text-text-tertiary typo-footnote">
                {members.length} · {familyRule[family]}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mobileXL:grid-cols-3 tablet:grid-cols-4 laptop:grid-cols-6">
              {members.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={selectedId === item.id}
                  className={classNames(
                    'ap-press flex flex-col items-start gap-2 rounded-18 border p-2.5 text-left',
                    selectedId === item.id
                      ? 'border-accent-cabbage-default bg-surface-float'
                      : 'border-border-subtlest-tertiary hover:bg-surface-hover',
                  )}
                >
                  <img
                    src={item.src}
                    alt=""
                    className="aspect-square w-full rounded-14 object-cover"
                  />
                  <span className="px-0.5 font-bold typo-footnote">
                    {item.name}
                  </span>
                  <span className="ap-pretty px-0.5 text-text-tertiary typo-caption2">
                    {item.line}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const smallSizes = [16, 20, 24, 32, 40];
const cropExamples = ['ping', 'byte', 'reload', 'float', 'cooler'].map(
  (id) => characterById[id],
);
const backdropPairs = characters.filter((item) => item.busySrc);

export const TheCast: StoryObj = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Which characters, and do they survive 16 pixels?"
        title="A cast that reads at 24 pixels and never guesses who someone is."
        goal="Every character recognizable in a row of small avatars, none of them a guess at someone's identity."
        metric={`Assignable pool size. ${assignablePoolV1.length} today, 64 brings duplicate five-face stacks down to about 15%.`}
      >
        <p>
          The {characters.length} renders split into four families with
          different rules. Names are dev lore on purpose: they show up in the
          reveal (&ldquo;Meet Nocturne&rdquo;) and the picker, never next to
          someone&apos;s name in a thread. Click any card to inspect it across
          the production size ladder.
        </p>
      </PageHeader>

      <Section title="Four families, four rules">
        <CastGrid />
      </Section>

      <Section
        title="Below 40 pixels, the face is the avatar"
        description="Full-body renders like Ping and Byte shrink to a speck at 24 pixels. Each character ships with a second, face-cropped export. The resolver picks it for ProfileImageSize.Large (40) and below, which is where the vast majority of avatar impressions happen: feed cards, comments, notifications, mentions."
      >
        <div className="flex flex-col gap-3 overflow-x-auto rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-5">
          <div className="grid min-w-[44rem] grid-cols-[7rem_1fr_1fr] gap-6 text-text-quaternary typo-caption1">
            <span />
            <span>Full render</span>
            <span>Face crop (what ships)</span>
          </div>
          {cropExamples.map((item) => (
            <div
              key={item.id}
              className="grid min-w-[44rem] grid-cols-[7rem_1fr_1fr] items-center gap-6"
            >
              <span className="font-bold typo-footnote">{item.name}</span>
              <div className="flex items-end gap-3">
                {smallSizes.map((size) => (
                  <CharacterAvatar
                    key={size}
                    character={item}
                    sizePx={size}
                    crop="full"
                  />
                ))}
              </div>
              <div className="flex items-end gap-3">
                {smallSizes.map((size) => (
                  <CharacterAvatar
                    key={size}
                    character={item}
                    sizePx={size}
                    crop="face"
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="grid min-w-[44rem] grid-cols-[7rem_1fr_1fr] items-center gap-6 border-t border-border-subtlest-tertiary pt-3">
            <span className="text-text-tertiary typo-footnote">Today</span>
            <div className="flex items-end gap-3">
              {smallSizes.map((size) => (
                <TodayAvatar key={size} sizePx={size} />
              ))}
            </div>
            <span className="text-text-quaternary typo-caption1">
              For scale: the silhouette is legible at every size because it is
              one shape. The crop is how characters earn the same.
            </span>
          </div>
        </div>
      </Section>

      <Section
        title="Clean backdrops beat scenery"
        description="Six characters exist in two renders: the first batch on bokeh and scenery, a second batch on a plain gradient. At 96 pixels the scenery is lovely. At 24 it turns into noise that competes with the face, and in a stack every tile has a different horizon line. The second batch is the direction."
      >
        <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
          {backdropPairs.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-18 border border-border-subtlest-tertiary bg-background-subtle p-4"
            >
              {[
                { label: 'Scenery', src: item.busySrc },
                { label: 'Clean', src: item.src },
              ].map(({ label, src }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-2">
                    <img
                      src={src}
                      alt=""
                      className="size-6 rounded-8 object-cover"
                    />
                    <img
                      src={src}
                      alt=""
                      className="size-16 rounded-18 object-cover"
                    />
                  </div>
                  <span
                    className={classNames(
                      'typo-caption2',
                      label === 'Clean'
                        ? 'text-accent-avocado-default'
                        : 'text-text-quaternary',
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
              <span className="ml-auto font-bold typo-footnote">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Art brief for the next batch"
        description="What the current renders teach us, written as asks for whoever generates the next 40."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="One plain gradient backdrop">
            Rim light, no bokeh, no horizon. Scenery belongs on the profile
            cover, not inside a 24 pixel tile.
          </Callout>
          <Callout
            tone={CalloutTone.Good}
            title="Face in the middle 60 percent"
          >
            So one crop rule works for the whole cast. Full-body poses are fine
            as long as the head sits high and centered.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Vary the backdrop hue">
            Almost every render sits on violet. On brand, but a five-face stack
            melts into one purple bar. Spread backdrops across the accent ramps
            (cabbage, blue cheese, avocado, bun, bacon, water) so neighbors
            separate.
          </Callout>
          <Callout
            tone={CalloutTone.Good}
            title="Export the character on a transparent layer"
          >
            Then the backdrop can come from theme tokens: right for light and
            dark, and 18 characters times 8 backdrops is 144 distinct faces
            without generating a single new render.
          </Callout>
          <Callout
            tone={CalloutTone.Bad}
            title="Brand marks on assignable characters"
          >
            Idle&apos;s scarf carries the daily.dev mark. If a random user can
            wear it, it stops meaning official. Repaint it, the mark belongs to
            Patchy.
          </Callout>
          <Callout tone={CalloutTone.Good} title="A wider people set">
            The picker has to let anyone find themselves: older developers, more
            skin tones and head coverings, visible disability, androgynous
            options. Nine is a start, not a set.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
