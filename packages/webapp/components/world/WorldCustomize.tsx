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

/* The crest tables and the look bench are the renderer's, and it is JavaScript
   on purpose — ported near-verbatim from devcraft so every future diff against
   the source stays readable. These are the shapes this file reads out of them. */
const CHARGE_OF = CHARGES as Record<string, { n: string; d: string }>;
const KNOBS = LOOK_KNOBS as {
  k: WorldLookKnob;
  n: string;
  min: number;
  max: number;
  step: number;
}[];
/* The two swatch colours are the sky's own zenith and horizon, so a palette
   chip is a thumbnail of the sky rather than a label for one. */
const PALETTES = SKY_PAL as { id: string; n: string; a: number; b: number }[];
const HOURS = SKY_HOUR as { id: string; n: string }[];

/* What the crest rows stand in as while the entitlements are on the wire.
   Everything else in that section is known on the first frame — the shield, the
   two row labels and all six divisions — so only the two rows that ARE the
   answer are placeheld, and the panel never changes height under the cursor.
   Eight is the count a founded world usually has; the widths are varied so the
   charge row reads as chips rather than as a progress bar. */
const SWATCH_SKELETON = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const CHARGE_SKELETON = [
  { key: 'c1', width: 'w-24' },
  { key: 'c2', width: 'w-20' },
  { key: 'c3', width: 'w-28' },
  { key: 'c4', width: 'w-20' },
  { key: 'c5', width: 'w-24' },
  { key: 'c6', width: 'w-16' },
];

/* No hint slot. Every one this panel had was its own heading in more words, and
   the two that survived a first cut ("everyone who visits sees your world
   through it", "private hides the world") were saying what the control they sat
   under already says the moment you use it. */
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

/**
 * A labelled row of controls inside a section.
 *
 * Every chip row needs one. A section heading says what you are dressing; it
 * cannot also say which axis a given row is, and a bare row of PLAIN / PER PALE
 * / PER FESS is six words with nothing telling you what they are six of.
 */
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

/* The engine's tables are SHOUTED, because the lab they came from was a lab.
   Converted here rather than in the tables themselves: they are ported
   near-verbatim so future diffs against devcraft stay readable, and how a name
   is CASED is this side's business anyway. */
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

/**
 * One chip for palettes, hours, presets, divisions and charges.
 *
 * The same shared Button in the same two states the tag pickers use — cabbage
 * primary when it is chosen, float when it is not. There is nothing special
 * about a chip on this panel, so it should not be a component that says there
 * is: five near-copies of a selected state is five places for it to drift out
 * of the design system.
 */
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

/**
 * A tincture to pick. Bespoke on purpose and the only thing here that is: it is
 * a swatch of one specific colour, which is the one control the design system
 * has no token for — the colour IS the value.
 */
const Swatch = ({
  colour,
  selected,
  onClick,
  label,
}: {
  colour: number;
  selected: boolean;
  onClick: () => void;
  /** Which row this is, for a screen reader. The tooltip shows only the hex —
      the row is already labelled right above it for anyone who can see it. */
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

/**
 * The mark, drawn by the same emitter that paints the banner flying over the
 * world. A second SVG copy for the DOM would be the same shield drawn twice and
 * drifting apart by the second change.
 */
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
  /**
   * What is flying over the world right now, for a reader who has never touched
   * the crest. Derived by the caller from the same districts the renderer used,
   * so opening the bench shows the mark they can already see rather than a
   * second, differently-derived one.
   */
  suggestion: WorldCrest | null;
  onChange: (crest: WorldCrest) => void;
}

/**
 * The standard: a charge out of the monuments you have raised, tinctures out of
 * the districts you founded, and a division that is free because a division
 * encodes nothing. You cannot build one that lies.
 *
 * Committing writes the WHOLE crest rather than the one field that changed:
 * until somebody touches it there is no stored crest at all, so patching a
 * single key onto nothing would save a division with no charge under it.
 *
 * It draws its full height on the FIRST frame. Only the catalogue needs the
 * network — what the shield currently looks like, what the rows are called and
 * which divisions exist are all in hand — so the entitlements land into two rows
 * of placeholders rather than into a one-line "loading" that then grows into a
 * section and shoves the sky, the look and the Save button down the panel.
 */
const CrestBench = ({
  userId,
  crest,
  suggestion,
  onChange,
}: CrestBenchProps): ReactElement => {
  const { entitlements, isPending } = useWorldEntitlements(userId, true);
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

  /* Eligibility is having built something, and it is answered WITHOUT the query:
     `suggestion` is derived from the same districts the renderer used and by the
     same rule the API applies, so a world with nothing raised says so on the
     first frame instead of after a round trip that could only agree. A stored
     crest is proof on its own — you cannot un-earn a charge. */
  /* The second term is the API having the last word: if it grants nothing after
     all, its answer wins over the derivation. That path does shift the panel,
     and it should — the two disagreeing is a real event, not a loading state. */
  if ((!crest && !suggestion) || (!isPending && !charges.length)) {
    return (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        Read a topic three times and its monument becomes a charge you can fly.
      </Typography>
    );
  }

  /* The stored crest, then the one already flying, and only then a first-of-each
     assembly — which is reachable when the API has granted something the
     renderer's own derivation did not pick. */
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

      {/* Real work, this line: it is where a reader finds out the catalogue IS
          the portrait. Without it the charge row reads as a short list of icons
          rather than as the list of things they have built. */}
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

/**
 * Eight palettes and five hours: forty skies.
 *
 * Two axes rather than one list of forty, because two axes is what makes a sky
 * feel FOUND instead of picked — you arrive at a combination nobody put in a
 * menu. Both are free because neither carries a fact: the sky used to report
 * whichever realm you had been reading lately, and losing that readout is
 * exactly what let it be handed over. Which quarters of the map are large says
 * the same thing, permanently and unfakeably.
 */
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

/**
 * Six starting points and the seven knobs that fork one.
 *
 * The knobs are on screen rather than behind a disclosure, which is how the lab
 * had them and the reason is the same: a preset is a starting point, and the
 * whole claim of this section is that your taste gets the last word. Folded away
 * they read as an advanced mode nobody is expected to open, which is the
 * opposite of the offer.
 *
 * Moving one deselects the presets and that is the entire ceremony. A look of
 * your own does not have to be named, saved or confirmed — it is just what the
 * knobs are set to, and clicking any preset is how you leave it again.
 *
 * Called a LOOK everywhere in the code and "Vibes" on the panel. The API field,
 * the engine's uniforms and devcraft all say `look`, so renaming the code to
 * follow one label would put a translation layer between this file and the three
 * things it talks to.
 */
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
              /* Picking a preset throws the fork away, which is the honest
                 reading of the gesture — you clicked a different look. */
              selected={!look.mine && preset.id === look.id}
              icon={<ChipSwatch from={preset.sw[0]} to={preset.sw[1]} />}
              onClick={() => onChange(lookFromPreset(preset.id))}
            />
          ))}
        </div>
      </Row>

      <Row label="Fine-tune">
        <div className="flex flex-col gap-3">
          {/* One row per knob: name, track, number. Stacked label-over-slider is
              twice the height for seven of them, and the rail has a crest and a
              preset row above it and a Save under it. */}
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
                /* Any knob turns the preset into a look of your own. It is not
                   a mode you enter, it is what happens the moment you disagree
                   with one. */
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

/**
 * The bench's own title bar. It replaces the rail's "Back to profile" rather
 * than sitting under it: while the bench is open the way out is out of the
 * bench, and two back affordances one above the other is a reader guessing
 * which one loses their edits.
 */
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
 * What the gear opens: the one place a world can be made somebody's own.
 *
 * Every edit lands on the world behind the panel immediately — this is a bench
 * over a live frame, not a form with a preview pane — and Save is what makes it
 * survive a reload. Cancel puts the world back the way it was found.
 *
 * Land, level, density and monuments are not in here and never will be. Those
 * are the portrait: the reading writes them, and nothing on this panel can make
 * a world claim to be bigger than it was read into being.
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
      {/* One label, not two. The heading names the field, so the field's own
          label is there for a screen reader and nowhere else. */}
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
                /* ✦ does not reroll. It walks a fixed list of shapes built from
                   the same facts, so pressing it four times and landing back on
                   the first one is possible. A suggestion you accept is still a
                   name you chose, so it commits. */
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

/**
 * The bench's own shell: a scrolling column with a bar bolted to the bottom.
 *
 * The bar is OUTSIDE the scroller rather than sticky inside it. Sticky only
 * pins an element once the content is long enough to push it off — so on a
 * short bench it comes to rest wherever the sections happen to end, floating in
 * the middle of the rail. A footer that is sometimes at the bottom is worse
 * than one that never is.
 */
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

/**
 * The same bench below laptop, where there is no rail for it to replace.
 *
 * It takes the whole screen rather than opening as a drawer over the map: every
 * control in here changes what the world looks like, and a sheet covering the
 * bottom half of a phone leaves a strip of world too small to judge a grade by.
 * The world is still live underneath — closing it is one tap away.
 */
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
