import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { Slider } from '@dailydotdev/shared/src/components/fields/Slider';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type {
  WorldCrest,
  WorldDistrict,
  WorldLook,
  WorldLookKnob,
  WorldSky,
} from '../../graphql/world';
import { CHARGES, crestDataUrl, DIVISIONS, hexs } from './engine/crest';
import {
  fmtKnob,
  forkLook,
  LOOK_DEFS,
  LOOK_KNOBS,
  lookFromPreset,
} from './engine/look';
import { useWorldEntitlements } from './useWorldSettings';
import type { WorldDraft, WorldDraftSettings } from './useWorldDraft';
import { SKY_HOUR, SKY_PAL } from './engine/sky';
import {
  resolveLook,
  resolveSky,
  suggestedCrest,
  WORLD_NAME_MAX_LENGTH,
  worldSuggestions,
} from './worldCustomization';

/* Ported near-verbatim from devcraft's JS renderer so future diffs against the source stay readable. */
const CHARGE_OF = CHARGES as Record<string, { n: string; d: string }>;
const KNOBS = LOOK_KNOBS as {
  k: WorldLookKnob;
  n: string;
  min: number;
  max: number;
  step: number;
}[];
/* palette.a/b are the sky's own zenith and horizon colours, used as the chip swatch. */
const PALETTES = SKY_PAL as { id: string; n: string; a: number; b: number }[];
const HOURS = SKY_HOUR as { id: string; n: string }[];

/* Only the tincture/charge rows need the network, so only they get skeletons — keeps panel height stable while entitlements load. */
const SWATCH_SKELETON = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const CHARGE_SKELETON = [
  { key: 'c1', width: 'w-24' },
  { key: 'c2', width: 'w-20' },
  { key: 'c3', width: 'w-28' },
  { key: 'c4', width: 'w-20' },
  { key: 'c5', width: 'w-24' },
  { key: 'c6', width: 'w-16' },
];

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2">
    <Typography
      tag={TypographyTag.H2}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      bold
    >
      {title}
    </Typography>
    {children}
  </section>
);

const Row = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <Typography
      type={TypographyType.Caption2}
      color={TypographyColor.Quaternary}
    >
      {label}
    </Typography>
    {children}
  </div>
);

/* Converted here rather than in the source tables, since they're ported near-verbatim to keep diffs against devcraft readable. */
const sentence = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase();

interface ChipProps {
  selected: boolean;
  label: string;
  onClick: () => void;
  icon?: ReactElement;
  /** Rendered by the chip, so the trigger the tooltip clones is the Button. */
  tooltip?: string;
  className?: string;
}

/** Shared chip for palettes, hours, presets, divisions and charges — reuses Button's selected state rather than five near-copies. */
const Chip = ({
  selected,
  label,
  onClick,
  icon,
  tooltip,
  className,
}: ChipProps): ReactElement => {
  const shared = {
    type: 'button' as const,
    size: ButtonSize.XSmall,
    icon,
    pressed: selected,
    onClick,
    className,
  };
  /* Two branches rather than one with a conditional `color`, because Button's
     props are a union that takes colour and variant together or neither — the
     same shape `TagElement` picks a selected tag with. */
  const button = selected ? (
    <Button
      {...shared}
      variant={ButtonVariant.Primary}
      color={ButtonColor.Cabbage}
    >
      {sentence(label)}
    </Button>
  ) : (
    <Button {...shared} variant={ButtonVariant.Float}>
      {sentence(label)}
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return <Tooltip content={tooltip}>{button}</Tooltip>;
};

/** A colour a chip carries: the two ends of a sky, or a look's two inks. */
const ChipSwatch = ({
  from,
  to,
}: {
  from: number;
  to: number;
}): ReactElement => (
  <i
    className="h-3 w-3 flex-none rounded-4"
    style={{
      background: `linear-gradient(135deg, ${hexs(from)}, ${hexs(to)})`,
    }}
  />
);

/** Bespoke control: a swatch of one specific colour, the one thing with no design-system token. */
const Swatch = ({
  colour,
  selected,
  onClick,
  label,
}: {
  colour: number;
  selected: boolean;
  onClick: () => void;
  /** Row name for screen readers; the tooltip shows only the hex. */
  label: string;
}): ReactElement => (
  <Tooltip content={hexs(colour)}>
    <button
      type="button"
      aria-label={`${label} ${hexs(colour)}`}
      aria-pressed={selected}
      onClick={onClick}
      style={{ background: hexs(colour) }}
      className={classNames(
        'h-6 w-6 flex-none rounded-8 border-2',
        selected ? 'border-text-primary' : 'border-transparent',
      )}
    />
  </Tooltip>
);

const CrestGlyph = ({ charge }: { charge: string }): ReactElement => (
  <svg viewBox="-52 -52 104 104" aria-hidden className="h-4 w-4 flex-none">
    <path
      d={(CHARGE_OF[charge] ?? CHARGE_OF.obelisk).d}
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

/** Reuses the same emitter that paints the world's banner, to avoid two shield implementations drifting apart. */
const CrestPreview = ({ crest }: { crest: WorldCrest }): ReactElement => {
  const url = useMemo(() => crestDataUrl(crest), [crest]);

  return (
    <div
      role="img"
      aria-label="Your standard"
      /* The shield's own 176:208, so the drawing is never squeezed. */
      className="aspect-[176/208] w-18 flex-none bg-contain bg-center bg-no-repeat"
      style={{ backgroundImage: url ? `url(${url})` : undefined }}
    />
  );
};

interface CrestBenchProps {
  userId: string;
  crest: WorldCrest | null;
  /** Must derive from the same districts the renderer used, so the bench opens showing the mark already visible on the world. */
  suggestion: WorldCrest | null;
  onChange: (crest: WorldCrest) => void;
}

/**
 * Commits the whole crest, not a patch: until saved there is no stored crest, so writing one key would leave a division with no charge under it.
 * Renders full height on the first frame — only the catalogue needs the network, so entitlements land into placeholder rows instead of growing the panel.
 */
const CrestBench = ({
  userId,
  crest,
  suggestion,
  onChange,
}: CrestBenchProps): ReactElement => {
  const { entitlements, isPending, isError } = useWorldEntitlements(
    userId,
    true,
  );
  const charges = useMemo(
    () =>
      (entitlements ?? [])
        .filter(({ kind }) => kind === 'charge')
        .map(({ id }) => id),
    [entitlements],
  );
  const tinctures = useMemo(
    () =>
      (entitlements ?? [])
        .filter(({ kind }) => kind === 'tincture')
        .map(({ id }) => parseInt(id.replace('#', ''), 16)),
    [entitlements],
  );

  const earned = crest ?? suggestion;
  /* Eligibility is answered without the query: `suggestion` derives from the
     same districts by the same rule the API applies, and a stored crest is
     proof on its own. The second term is the API having the last word when it
     genuinely grants nothing — a failed request is not that answer, so it gets
     its own state below instead of masquerading as "nothing earned". */
  if (!earned || (!isPending && !isError && !charges.length)) {
    return (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        Read a topic three times and its monument becomes a charge you can fly.
      </Typography>
    );
  }

  if (isError && !entitlements) {
    return (
      <div className="flex items-start gap-3">
        <CrestPreview crest={earned} />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Your charges could not be loaded. Try again in a moment.
        </Typography>
      </div>
    );
  }

  /* Falls back stored crest -> suggestion -> first-of-each, reachable only when the API grants something the renderer's derivation missed. */
  const current: WorldCrest = crest ??
    suggestion ?? {
      charge: charges[0],
      div: DIVISIONS[0].id,
      a: tinctures[0],
      b: tinctures[1] ?? tinctures[0],
    };
  const set = (patch: Partial<WorldCrest>) =>
    onChange({ ...current, ...patch });
  const total = Object.keys(CHARGES).length;

  return (
    <>
      <div className="flex items-start gap-3">
        <CrestPreview crest={current} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Row label="Field">
            <div className="flex flex-wrap gap-1">
              {isPending
                ? SWATCH_SKELETON.map((key) => (
                    <ElementPlaceholder
                      key={`a-${key}`}
                      className="h-6 w-6 rounded-8"
                    />
                  ))
                : tinctures.map((colour) => (
                    <Swatch
                      key={`a-${colour}`}
                      colour={colour}
                      selected={colour === current.a}
                      onClick={() => set({ a: colour })}
                      label="Field"
                    />
                  ))}
            </div>
          </Row>
          <Row label="Second tincture">
            <div className="flex flex-wrap gap-1">
              {isPending
                ? SWATCH_SKELETON.map((key) => (
                    <ElementPlaceholder
                      key={`b-${key}`}
                      className="h-6 w-6 rounded-8"
                    />
                  ))
                : tinctures.map((colour) => (
                    <Swatch
                      key={`b-${colour}`}
                      colour={colour}
                      selected={colour === current.b}
                      onClick={() => set({ b: colour })}
                      label="Second tincture"
                    />
                  ))}
            </div>
          </Row>
        </div>
      </div>

      <Row label="Pattern">
        <div className="flex flex-wrap gap-1">
          {DIVISIONS.map((division) => (
            <Chip
              key={division.id}
              label={division.n}
              selected={division.id === current.div}
              onClick={() => set({ div: division.id })}
            />
          ))}
        </div>
      </Row>

      <Row label="Charge">
        <div className="flex flex-wrap gap-1">
          {isPending
            ? CHARGE_SKELETON.map(({ key, width }) => (
                <ElementPlaceholder
                  key={key}
                  className={classNames('h-6 rounded-8', width)}
                />
              ))
            : charges.map((charge) => (
                <Chip
                  key={charge}
                  label={(CHARGE_OF[charge] ?? CHARGE_OF.obelisk).n}
                  selected={charge === current.charge}
                  icon={<CrestGlyph charge={charge} />}
                  onClick={() => set({ charge })}
                />
              ))}
        </div>
      </Row>

      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {isPending ? (
          <ElementPlaceholder className="inline-block h-3 w-32 rounded-4 align-middle" />
        ) : (
          `${charges.length} of ${total} charges earned`
        )}
      </Typography>
    </>
  );
};

interface SkyBenchProps {
  sky: WorldSky;
  onChange: (sky: WorldSky) => void;
}

/** Palette and hour are two independent, purely decorative axes — neither encodes any reading data. */
const SkyBench = ({ sky, onChange }: SkyBenchProps): ReactElement => (
  <>
    <Row label="Palette">
      <div className="flex flex-wrap gap-1">
        {PALETTES.map((palette) => (
          <Chip
            key={palette.id}
            label={palette.n}
            selected={palette.id === sky.pal}
            icon={<ChipSwatch from={palette.a} to={palette.b} />}
            onClick={() => onChange({ ...sky, pal: palette.id })}
          />
        ))}
      </div>
    </Row>
    <Row label="Hour">
      <div className="flex flex-wrap gap-1">
        {HOURS.map((hour) => (
          <Chip
            key={hour.id}
            label={hour.n}
            selected={hour.id === sky.hour}
            onClick={() => onChange({ ...sky, hour: hour.id })}
          />
        ))}
      </div>
    </Row>
  </>
);

interface LookBenchProps {
  look: WorldLook;
  onChange: (look: WorldLook) => void;
}

/** Called `look` in code/API/engine and "Vibes" on the panel — don't rename the code to match the label, it would add a translation layer against devcraft and the API field. */
const LookBench = ({ look, onChange }: LookBenchProps): ReactElement => {
  return (
    <>
      <Row label="Preset">
        <div className="flex flex-wrap gap-1">
          {LOOK_DEFS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.n}
              tooltip={preset.d}
              /* Picking a preset discards any fork of the current look. */
              selected={!look.mine && preset.id === look.id}
              icon={<ChipSwatch from={preset.sw[0]} to={preset.sw[1]} />}
              onClick={() => onChange(lookFromPreset(preset.id))}
            />
          ))}
        </div>
      </Row>

      <Row label="Fine-tune">
        <div className="flex flex-col gap-3">
          {/* One row per knob (not stacked label/slider) — seven knobs must fit under the crest and preset rows above a fixed-height rail. */}
          {KNOBS.map(({ k, n, min, max, step }) => (
            <div key={k} className="flex items-center gap-2">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="w-14 flex-none"
                truncate
              >
                {n}
              </Typography>
              <Slider
                compact
                thumbLabel={n}
                className="flex-1"
                min={min}
                max={max}
                step={step}
                value={[look[k]]}
                /* Moving any knob forks the preset into a custom look. */
                onValueChange={([value]) =>
                  onChange(forkLook(look, { [k]: value }))
                }
              />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="w-8 flex-none text-right tabular-nums"
              >
                {fmtKnob(k, look[k])}
              </Typography>
            </div>
          ))}
        </div>
      </Row>
    </>
  );
};

/** Replaces the rail's "Back to profile" rather than sitting alongside it — two back affordances would leave a reader guessing which one loses their edits. */
function WorldCustomizeHeader({
  onCancel,
}: {
  onCancel: () => void;
}): ReactElement {
  return (
    <header className="flex items-center justify-between gap-2">
      <Typography type={TypographyType.Body} bold>
        Make it yours
      </Typography>
      <CloseButton
        type="button"
        size={ButtonSize.Small}
        aria-label="Close customisation"
        onClick={onCancel}
      />
    </header>
  );
}

interface WorldCustomizeProps {
  userId: string;
  draft: WorldDraft;
  districts?: WorldDistrict[];
  settings: WorldDraftSettings;
}

/**
 * Every edit updates the live world behind the panel immediately; Save persists it, Cancel reverts.
 * Land, level, density and monuments are intentionally excluded — those come only from reading activity, never from this panel.
 */
function WorldCustomize({
  userId,
  draft,
  districts,
  settings,
}: WorldCustomizeProps): ReactElement {
  const { setSettings, error } = draft;
  const [suggestion, setSuggestion] = useState(0);
  const suggestions = useMemo(() => worldSuggestions(districts), [districts]);
  const patch = (next: Partial<WorldDraftSettings>) =>
    setSettings({ ...settings, ...next });

  return (
    <div className="flex flex-col gap-5">
      {/* Section heading names the field; TextField's own label is sr-only to avoid duplicating it visually. */}
      <Section title="Name">
        <TextField
          inputId="world-name"
          name="worldName"
          label="World name"
          fieldType="secondary"
          className={{ outerLabel: 'sr-only' }}
          maxLength={WORLD_NAME_MAX_LENGTH}
          value={settings.name ?? ''}
          placeholder={suggestions[0]}
          valueChanged={(name) => patch({ name })}
          actionButton={
            <Tooltip content="Another suggestion">
              <Button
                type="button"
                aria-label="Another suggestion"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<MagicIcon />}
                /* Walks a fixed list of suggestions (not random) — cycling can land back on the first one. */
                onClick={() => {
                  const next = (suggestion + 1) % suggestions.length;
                  setSuggestion(next);
                  patch({ name: suggestions[next] });
                }}
              />
            </Tooltip>
          }
        />
      </Section>

      <Section title="Crest">
        <CrestBench
          userId={userId}
          crest={settings.crest}
          suggestion={suggestedCrest(userId, districts)}
          onChange={(crest) => patch({ crest })}
        />
      </Section>

      <Section title="Sky">
        <SkyBench
          sky={resolveSky(settings)}
          onChange={(sky) => patch({ sky })}
        />
      </Section>

      <Section title="Vibes">
        <LookBench
          look={resolveLook(settings)}
          onChange={(look) => patch({ look })}
        />
      </Section>

      <Section title="Who can see it">
        <Switch
          inputId="world-private"
          name="worldPrivate"
          checked={settings.private}
          onToggle={() => patch({ private: !settings.private })}
        >
          Private
        </Switch>
      </Section>

      {!!error && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.StatusError}
        >
          {error}
        </Typography>
      )}
    </div>
  );
}

/** Action bar sits outside the scroller rather than sticky inside it — sticky only pins once content overflows, so on a short bench it would float mid-rail instead of anchoring to the bottom. */
function WorldBench({
  draft,
  children,
  className,
}: {
  draft: WorldDraft;
  children: ReactNode;
  className?: string;
}): ReactElement {
  const { cancel, save, isSaving } = draft;

  return (
    <div
      data-world-overlay
      className={classNames(
        'pointer-events-auto z-3 flex flex-col bg-background-default',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <WorldCustomizeHeader onCancel={cancel} />
        {children}
      </div>
      <div className="flex flex-none gap-2 border-t border-border-subtlest-tertiary p-4">
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={cancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="flex-1"
          onClick={save}
          loading={isSaving}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

/** The bench in the rail it replaces, on laptop and up. */
export function WorldCustomizeRail({
  draft,
  ...props
}: WorldCustomizeProps): ReactElement {
  return (
    <WorldBench
      draft={draft}
      className="absolute inset-y-0 left-0 z-1 w-80 border-r border-border-subtlest-tertiary"
    >
      <WorldCustomize draft={draft} {...props} />
    </WorldBench>
  );
}

/** Takes the whole screen rather than a drawer over the map — every control changes the world's look, and a partial sheet would leave too little world visible to judge. Closing is still one tap away. */
export function WorldCustomizeSheet({
  draft,
  ...props
}: WorldCustomizeProps): ReactElement {
  return (
    <WorldBench
      draft={draft}
      className="absolute inset-3 overflow-hidden rounded-16 border border-border-subtlest-tertiary"
    >
      <WorldCustomize draft={draft} {...props} />
    </WorldBench>
  );
}
