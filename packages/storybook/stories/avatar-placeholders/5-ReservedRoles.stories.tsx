import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Callout,
  CalloutTone,
  CharacterAvatar,
  Chip,
  Page,
  PageHeader,
  radiusForSize,
  Section,
  Surface,
  Table,
} from './shell';
import {
  LoggedOutComposer,
  NotificationList,
  PersonAvatar,
  TodayAvatar,
} from './surfaces';
import type { Backdrop, Concept } from './data';
import {
  characterById,
  deletedConcepts,
  getCharacterSrc,
  hashSeed,
  organizationConcepts,
  people,
  placeholderAvatarSrc,
  placeholderOrganizationSrc,
  placeholderSquadSrc,
  squadConcepts,
} from './data';

const meta: Meta = {
  title: 'Avatar Characters/5. Reserved roles',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const RoleHero = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6 tablet:flex-row tablet:items-center">
    <CharacterAvatar character={characterById[id]} sizePx={112} />
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="typo-title2">{title}</span>
      <div className="ap-pretty flex flex-col gap-2 text-text-tertiary typo-callout">
        {children}
      </div>
    </div>
  </div>
);

const Tile = ({
  src,
  sizePx,
  className,
}: {
  src: string;
  sizePx: number;
  className?: string;
}): ReactElement => (
  <img
    key={src}
    src={src}
    alt=""
    style={{
      width: sizePx,
      height: sizePx,
      borderRadius: radiusForSize(sizePx),
    }}
    className={classNames(
      'ap-swap shrink-0 bg-surface-float object-cover',
      className,
    )}
  />
);

const surfaceSwatches = [
  { label: 'Dark theme', color: '#0E1217' },
  { label: 'Light theme', color: '#FFFFFF' },
];

const BackdropContrast = ({
  backdrops,
  selectedId,
  onSelect,
}: {
  backdrops: Backdrop[];
  selectedId: string;
  onSelect: (id: string) => void;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-5">
    <div className="flex flex-col gap-1">
      <span className="font-bold typo-callout">Color and contrast</span>
      <span className="ap-pretty text-text-tertiary typo-footnote">
        The object has to survive 16 to 40 pixels on both themes. Click a row to
        use it in the previews below.
      </span>
    </div>
    {backdrops.map((item) => (
      <button
        key={item.id}
        type="button"
        aria-pressed={selectedId === item.id}
        onClick={() => onSelect(item.id)}
        className={classNames(
          'ap-press flex flex-wrap items-center gap-4 rounded-16 border p-3 text-left',
          selectedId === item.id
            ? 'border-accent-cabbage-default bg-surface-float'
            : 'border-transparent hover:bg-surface-hover',
        )}
      >
        <div className="flex w-56 flex-col">
          <span className="flex items-center gap-2 font-bold typo-footnote">
            {item.label}
            {item.picked && (
              <Chip className="bg-overlay-float-avocado text-accent-avocado-default">
                Picked
              </Chip>
            )}
          </span>
          <span className="ap-pretty text-text-tertiary typo-caption1">
            {item.note}
          </span>
        </div>
        {surfaceSwatches.map((swatch) => (
          <div
            key={swatch.label}
            title={swatch.label}
            style={{ background: swatch.color }}
            className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2"
          >
            {[16, 24, 32, 40].map((size) => (
              <Tile
                key={size}
                src={size <= 40 ? item.faceSrc : item.src}
                sizePx={size}
              />
            ))}
          </div>
        ))}
      </button>
    ))}
  </div>
);

const ConceptExplorer = ({
  concepts,
  todaySrc,
  renderContext,
}: {
  concepts: Concept[];
  todaySrc: string;
  renderContext: (src: (sizePx: number) => string) => ReactNode;
}): ReactElement => {
  const [selectedId, setSelectedId] = useState(
    concepts.find((item) => item.badge)?.id ?? concepts[0].id,
  );
  const selected =
    concepts.find((item) => item.id === selectedId) ?? concepts[0];
  const [backdropId, setBackdropId] = useState(
    selected.backdrops?.find((item) => item.picked)?.id,
  );
  const backdrop = selected.backdrops?.find((item) => item.id === backdropId);
  const art = backdrop ? { ...selected, ...backdrop } : selected;

  return (
    <div className="flex flex-col gap-6">
      <div
        className={classNames(
          'grid gap-3 tablet:grid-cols-2',
          concepts.length > 3 ? 'laptop:grid-cols-4' : 'laptop:grid-cols-3',
        )}
      >
        {concepts.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selectedId === item.id}
            onClick={() => {
              setSelectedId(item.id);
              setBackdropId(item.backdrops?.find((b) => b.picked)?.id);
            }}
            className={classNames(
              'ap-press flex flex-col gap-3 rounded-20 border p-3 text-left',
              selectedId === item.id
                ? 'border-accent-cabbage-default bg-surface-float'
                : 'border-border-subtlest-tertiary hover:bg-surface-hover',
            )}
          >
            <img
              src={item.src}
              alt=""
              className="aspect-square w-full rounded-16 object-cover"
            />
            <div className="flex flex-col gap-1 px-1 pb-1">
              <div className="flex items-center gap-2">
                <span className="font-bold typo-callout">{item.name}</span>
                {item.badge && (
                  <Chip className="bg-overlay-float-avocado text-accent-avocado-default">
                    {item.badge}
                  </Chip>
                )}
              </div>
              <span className="text-text-tertiary typo-footnote">
                {item.line}
              </span>
              <span className="ap-pretty text-text-quaternary typo-caption1">
                {item.why}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selected.backdrops && backdropId && (
        <BackdropContrast
          backdrops={selected.backdrops}
          selectedId={backdropId}
          onSelect={setBackdropId}
        />
      )}

      <div className="flex flex-wrap items-end gap-6 rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-5">
        {[16, 24, 32, 40, 64, 96].map((size) => (
          <div key={size} className="flex flex-col items-center gap-2">
            <Tile src={getCharacterSrc(art, size)} sizePx={size} />
            <span className="ap-tabular text-text-quaternary typo-caption2">
              {size}
            </span>
          </div>
        ))}
        <span className="ap-pretty max-w-[28ch] text-text-tertiary typo-footnote">
          {selected.name} across the production sizes. Face crop at 40 and
          below, centered on the subject.
        </span>
      </div>

      <div className="grid gap-6 tablet:grid-cols-2">
        <Surface
          label="Today"
          note="Only the placeholder changes between the two."
        >
          {renderContext(() => todaySrc)}
        </Surface>
        <Surface
          label={`With ${selected.name}${
            backdrop ? `, ${backdrop.label}` : ''
          }`}
          note="Click another card above to compare."
        >
          {renderContext((size) => getCharacterSrc(art, size))}
        </Surface>
      </div>
    </div>
  );
};

enum SlotTreatment {
  None = 'none',
  Dashed = 'dashed',
  Pixelated = 'pixelated',
  Both = 'both',
}

const treatmentLabel: Record<SlotTreatment, string> = {
  [SlotTreatment.None]: 'Art only',
  [SlotTreatment.Dashed]: 'Dashed slot',
  [SlotTreatment.Pixelated]: 'Pixelated',
  [SlotTreatment.Both]: 'Dashed and pixelated',
};

const treatmentNote: Record<SlotTreatment, string> = {
  [SlotTreatment.None]: 'The ghost alone carries the meaning.',
  [SlotTreatment.Dashed]:
    'The component dims the art and traces its own edge with a dashed line, same size and corner radius as every avatar. Says “someone was here” in UI language, and works with any art.',
  [SlotTreatment.Pixelated]:
    'The component downsamples the art to a few blocks. The avatar itself looks deleted.',
  [SlotTreatment.Both]:
    'Maximum “removed”. Strong, maybe too loud for a thread of real replies.',
};

const PIXEL_BLOCKS = 9;

const PixelatedImage = ({
  src,
  sizePx,
}: {
  src: string;
  sizePx: number;
}): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const context = canvasRef.current?.getContext('2d');
      if (!context) {
        return;
      }
      context.imageSmoothingEnabled = true;
      context.clearRect(0, 0, PIXEL_BLOCKS, PIXEL_BLOCKS);
      context.drawImage(image, 0, 0, PIXEL_BLOCKS, PIXEL_BLOCKS);
    };
    image.src = src;
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      width={PIXEL_BLOCKS}
      height={PIXEL_BLOCKS}
      style={{ width: sizePx, height: sizePx, imageRendering: 'pixelated' }}
      className="shrink-0"
    />
  );
};

const DeletedSlot = ({
  art,
  sizePx,
  treatment,
}: {
  art: Concept;
  sizePx: number;
  treatment: SlotTreatment;
}): ReactElement => {
  const src = getCharacterSrc(art, sizePx);
  const isDashed =
    treatment === SlotTreatment.Dashed || treatment === SlotTreatment.Both;
  const isPixelated =
    treatment === SlotTreatment.Pixelated || treatment === SlotTreatment.Both;
  const borderRadius = radiusForSize(sizePx);

  return (
    <span
      style={{ width: sizePx, height: sizePx, borderRadius }}
      className="relative flex shrink-0 overflow-hidden"
    >
      <span
        className={classNames('flex size-full', isDashed && 'opacity-[0.64]')}
      >
        {isPixelated ? (
          <PixelatedImage src={src} sizePx={sizePx} />
        ) : (
          <img src={src} alt="" className="size-full object-cover" />
        )}
      </span>
      {isDashed && (
        <span
          aria-hidden
          style={{ borderRadius }}
          className="pointer-events-none absolute inset-0 border border-dashed border-text-secondary"
        />
      )}
    </span>
  );
};

const DeletedTreatments = (): ReactElement => {
  const [artId, setArtId] = useState(deletedConcepts[0].id);
  const [treatment, setTreatment] = useState(SlotTreatment.Dashed);
  const art =
    deletedConcepts.find((item) => item.id === artId) ?? deletedConcepts[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-text-tertiary typo-footnote">Art</span>
        {deletedConcepts.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={artId === item.id}
            onClick={() => setArtId(item.id)}
            className={classNames(
              'ap-press flex items-center gap-2 rounded-12 border py-1 pl-1 pr-3 typo-footnote',
              artId === item.id
                ? 'border-accent-cabbage-default bg-surface-float font-bold'
                : 'border-border-subtlest-tertiary',
            )}
          >
            <Tile src={item.faceSrc} sizePx={24} />
            {item.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-4">
        {Object.values(SlotTreatment).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={treatment === value}
            onClick={() => setTreatment(value)}
            className={classNames(
              'ap-press flex flex-col gap-3 rounded-20 border p-4 text-left',
              treatment === value
                ? 'border-accent-cabbage-default bg-surface-float'
                : 'border-border-subtlest-tertiary hover:bg-surface-hover',
            )}
          >
            <div className="flex items-end gap-3">
              {[24, 32, 40].map((size) => (
                <DeletedSlot
                  key={size}
                  art={art}
                  sizePx={size}
                  treatment={value}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 font-bold typo-callout">
                {treatmentLabel[value]}
                {value === SlotTreatment.Dashed && (
                  <Chip className="bg-overlay-float-avocado text-accent-avocado-default">
                    Recommended
                  </Chip>
                )}
              </span>
              <span className="ap-pretty text-text-tertiary typo-caption1">
                {treatmentNote[value]}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 tablet:grid-cols-2">
        <Surface
          label="Today"
          note="The same silhouette everyone without a photo wears."
        >
          <DeletedThread
            avatar={<Tile src={placeholderAvatarSrc} sizePx={32} />}
          />
        </Surface>
        <Surface
          label={`${art.name}, ${treatmentLabel[treatment].toLowerCase()}`}
          note="Pick an art and a treatment above."
        >
          <DeletedThread
            avatar={<DeletedSlot art={art} sizePx={32} treatment={treatment} />}
          />
        </Surface>
      </div>
    </div>
  );
};

const DeletedThread = ({ avatar }: { avatar: ReactNode }): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="flex gap-3">
      <PersonAvatar person={people[0]} size={ProfileImageSize.Large} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-bold typo-callout">{people[0].name}</span>
        <p className="text-text-primary typo-callout">
          Anyone benchmarked this against the old resolver?
        </p>
      </div>
    </div>
    <div className="ml-11 flex gap-3">
      {avatar}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-bold text-text-tertiary typo-callout">
          Deleted user
        </span>
        <p className="text-text-quaternary typo-callout">
          This comment was removed with the account.
        </p>
      </div>
    </div>
    <div className="ml-11 flex gap-3">
      <PersonAvatar person={people[1]} size={ProfileImageSize.Medium} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-bold typo-callout">{people[1].name}</span>
        <p className="text-text-primary typo-callout">
          We did, 30% faster cold start.
        </p>
        <span className="flex items-center gap-1 text-text-tertiary typo-footnote">
          <UpvoteIcon size={IconSize.Size16} /> 9
        </span>
      </div>
    </div>
  </div>
);

const OrganizationContext = ({
  src,
}: {
  src: (sizePx: number) => string;
}): ReactElement => (
  <div className="flex flex-col gap-5">
    <div className="flex items-center gap-4">
      <Tile src={src(96)} sizePx={72} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="typo-title3">Northwind Labs</span>
        <span className="text-text-tertiary typo-footnote">
          Organization · 24 members on daily.dev
        </span>
      </div>
    </div>
    <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-4">
      {['Senior Platform Engineer', 'Staff Frontend Engineer'].map((role) => (
        <div key={role} className="flex items-center gap-3">
          <Tile src={src(40)} sizePx={40} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold typo-callout">{role}</span>
            <span className="truncate text-text-tertiary typo-footnote">
              Northwind Labs · Remote
            </span>
          </div>
          <Chip>Hiring</Chip>
        </div>
      ))}
      <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
        <Tile src={src(20)} sizePx={20} />
        Experience entry on a profile, at 20 pixels
      </div>
    </div>
  </div>
);

const squadNames = [
  { id: 'sq-rustaceans-tlv', name: 'Rustaceans TLV', members: '1.2k' },
  { id: 'sq-design-engineers', name: 'Design Engineers', members: '840' },
  { id: 'sq-weekend-shippers-1', name: 'Weekend Shippers', members: '312' },
];

const SquadContext = ({
  src,
}: {
  src: (sizePx: number) => string;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    {squadNames.map((squad) => (
      <div key={squad.id} className="flex items-center gap-3">
        <Tile src={src(48)} sizePx={48} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold typo-callout">{squad.name}</span>
          <span className="truncate text-text-tertiary typo-footnote">
            {squad.members} members
          </span>
        </div>
        <Chip>Join</Chip>
      </div>
    ))}
  </div>
);

const RotatedSquads = (): ReactElement => (
  <div className="grid gap-6 tablet:grid-cols-2">
    <Surface
      label="The campfire for every squad"
      note="The pick. One image, one meaning: a group gathers here."
    >
      <SquadContext src={(size) => getCharacterSrc(squadConcepts[0], size)} />
    </Surface>
    <Surface
      label="Optional later: rotate by squad id"
      note="Only if a directory of brand-new squads ever feels repetitive. Same hash as people, and each squad keeps its art forever."
    >
      <div className="flex flex-col gap-3">
        {squadNames.map((squad) => {
          const art = squadConcepts[hashSeed(squad.id) % squadConcepts.length];
          return (
            <div key={squad.id} className="flex items-center gap-3">
              <Tile src={getCharacterSrc(art, 48)} sizePx={48} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-bold typo-callout">
                  {squad.name}
                </span>
                <span className="truncate text-text-tertiary typo-footnote">
                  {squad.members} members · {art.name}
                </span>
              </div>
              <Chip>Join</Chip>
            </div>
          );
        })}
      </div>
    </Surface>
  </div>
);

export const ReservedRoles: StoryObj = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Which faces are not for anyone?"
        title="Creatures are people. Objects are places. Patchy is us. The ghost is gone."
        goal="Every avatar tells you what kind of thing you are looking at before you read a name."
        metric="Zero user accounts rendering Patchy, a ghost, or an object."
      >
        <p>
          The rule that keeps the whole system legible: a creature or a person
          is always one individual. Organizations and squads get objects, so
          they can never be mistaken for a member. Patchy stays the one
          character only daily.dev can wear. Deleted accounts get their own
          quiet character instead of the silhouette.
        </p>
        <p>
          The organization, squad and deleted-user art below was generated for
          this page in the cast&apos;s style. Each has two or three directions.
          Click a card to see it at every size and in context.
        </p>
      </PageHeader>

      <Section title="Patchy is daily.dev">
        <RoleHero id="patchy" title="Official accounts only">
          <p>
            System notifications, the daily.dev team account, product
            announcements and moderation replies. Never in the assignable pool,
            never in the picker, and the collar mark is his alone (which is why
            Idle&apos;s scarf needs repainting).
          </p>
          <p>
            Reserving him is also an impersonation guard. If nobody can pick the
            dog, a reply wearing the dog is ours.
          </p>
        </RoleHero>
        <Surface
          label="Notifications"
          note="Your weekly digest comes from Patchy, people's activity from their own faces."
        >
          <NotificationList />
        </Surface>
      </Section>

      <Section
        title="Deleted accounts get a ghost"
        description="Gray on gray on purpose: next to the colorful cast, low contrast is the message, someone left. The new directions push further, from a ghost fading out to only its dotted outline left behind. Kind, never spooky: closed eyes, soft light."
      >
        <ConceptExplorer
          concepts={deletedConcepts}
          todaySrc={placeholderAvatarSrc}
          renderContext={(src) => (
            <DeletedThread avatar={<Tile src={src(32)} sizePx={32} />} />
          )}
        />
      </Section>

      <Section
        title="Treat the slot, not just the art"
        description="The avatar component can say “removed” on its own, whatever art sits inside. A dashed empty slot is a pattern people already read as “nothing here”, and it keeps working if the art ever changes. Pixelation makes the avatar itself look deleted. Try each art with each treatment."
      >
        <DeletedTreatments />
      </Section>

      <Section
        title="Organizations get a workplace object"
        description="Replaces both the company building icon (job posts, recruiter workspace, experience entries) and the organization page fallback. Objects with a small face, so they belong to the cast without ever reading as a person. HQ was re-rendered on teal: the first purple version disappeared into its own backdrop below 32 pixels."
      >
        <ConceptExplorer
          concepts={organizationConcepts}
          todaySrc={placeholderOrganizationSrc}
          renderContext={(src) => <OrganizationContext src={src} />}
        />
      </Section>

      <Section
        title="Squads without a cover get a gathering"
        description="A squad is many people, so its art is a shared object or a place: several faces in one image, or none at all. Never a single creature."
      >
        <ConceptExplorer
          concepts={squadConcepts}
          todaySrc={placeholderSquadSrc}
          renderContext={(src) => <SquadContext src={src} />}
        />
        <RotatedSquads />
      </Section>

      <Section
        title="Logged out, the slot is a preview"
        description="Today the composer shows the silhouette as you. With characters it shows the cast, and only moves when you hover or focus it. A tiny, honest answer to “what happens if I sign up”."
      >
        <Surface label="Logged-out comment composer">
          <LoggedOutComposer />
        </Surface>
      </Section>

      <Section title="The whole vocabulary">
        <Table
          head={['Entity', 'Today', 'Proposal', 'Rule']}
          rows={[
            [
              'Person without a photo',
              <TodayAvatar key="person" sizePx={32} />,
              'Assigned critter or bot, or one they pick',
              'One creature, one person',
            ],
            [
              'daily.dev official',
              '—',
              'Patchy',
              'Never assignable, never pickable',
            ],
            [
              'Deleted account',
              <TodayAvatar key="deleted" sizePx={32} />,
              `${deletedConcepts[0].name} ghost in a dashed slot`,
              'Gray on gray, so it reads as someone who left',
            ],
            [
              'Organization or company',
              <img
                key="org"
                src={placeholderOrganizationSrc}
                alt=""
                className="size-8 rounded-10"
              />,
              `${organizationConcepts[0].name} on teal`,
              'A workplace object with a face',
            ],
            [
              'Squad without a cover',
              <img
                key="squad"
                src={placeholderSquadSrc}
                alt=""
                className="size-8 rounded-10"
              />,
              `${squadConcepts[0].name}, purple flame`,
              'A gathering, never a single creature',
            ],
            [
              'Source without a logo',
              'Post cover placeholder',
              'Keep it',
              'Publications are content, not identity',
            ],
          ]}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout
            tone={CalloutTone.Bad}
            title="A huddle of member faces for squads"
          >
            Tempting, and cute at 96 pixels. At 24 it is three smudges, and it
            changes every time membership does.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Leave room for more objects">
            A rubber duck for bots and integrations, a coffee mug for event
            accounts. Objects are the vocabulary for &ldquo;not a person&rdquo;.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
