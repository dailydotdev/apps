import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons/Refresh';
import {
  Callout,
  CharacterAvatar,
  Page,
  PageHeader,
  Section,
  Table,
} from './shell';
import {
  assignablePoolV1,
  duplicateChance,
  getCharacterForUser,
  hashSeed,
  people,
  randomId,
} from './data';

const meta: Meta = {
  title: 'Avatar Characters/2. Assignment',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const SAMPLE_SIZE = 10000;
const sampleIds = Array.from(
  { length: SAMPLE_SIZE },
  (_, index) =>
    `${index.toString(36)}${hashSeed(`seed-${index}`).toString(36)}`,
);

const percent = (value: number): string => `${Math.round(value * 100)}%`;

const Playground = () => {
  const [userId, setUserId] = useState(people[0].id);
  const hash = hashSeed(userId);
  const index = hash % assignablePoolV1.length;
  const character = getCharacterForUser(userId);

  return (
    <div className="ap-elevated grid gap-6 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6 laptop:grid-cols-[1fr_auto]">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-text-tertiary typo-footnote">User id</span>
          <div className="flex gap-2">
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              spellCheck={false}
              className="min-w-0 flex-1 rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2 font-mono text-text-primary typo-callout focus:border-accent-cabbage-default focus:outline-none"
            />
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Medium}
              icon={<RefreshIcon />}
              onClick={() => setUserId(randomId())}
            >
              New signup
            </Button>
          </div>
        </label>
        <dl className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'FNV-1a hash',
              value: `0x${hash.toString(16).padStart(8, '0')}`,
            },
            { label: `hash mod ${assignablePoolV1.length}`, value: index },
            { label: 'Character', value: character.name },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-14 bg-surface-float px-3 py-2.5"
            >
              <dt className="text-text-quaternary typo-caption1">{label}</dt>
              <dd className="ap-tabular truncate font-mono font-bold typo-callout">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="ap-pretty text-text-tertiary typo-footnote">
          Type anything. The same string always lands on the same character, in
          this browser, on the server, in the extension and in the iOS wrapper.
          That is the whole mechanism, and why phase one needs no backend
          change.
        </p>
      </div>
      <div className="flex items-center justify-center gap-4 laptop:flex-col">
        <CharacterAvatar
          character={character}
          sizePx={128}
          animationKey={character.id}
        />
        <div className="flex items-end gap-2">
          {[24, 40].map((size) => (
            <CharacterAvatar
              key={size}
              character={character}
              sizePx={size}
              animationKey={`${character.id}-${size}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Distribution = () => {
  const counts = useMemo(() => {
    const tally = new Array(assignablePoolV1.length).fill(0);
    sampleIds.forEach((id) => {
      tally[hashSeed(id) % assignablePoolV1.length] += 1;
    });
    return tally;
  }, []);
  const expected = SAMPLE_SIZE / assignablePoolV1.length;
  const max = Math.max(...counts);

  return (
    <div className="flex flex-col gap-3 rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-5">
      <div className="flex h-40 gap-1.5">
        {assignablePoolV1.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-1 flex-col items-center justify-end gap-2"
            title={`${item.name}: ${counts[index]}`}
          >
            <span className="ap-tabular text-text-quaternary typo-caption2">
              {counts[index]}
            </span>
            <div
              className="w-full rounded-t-6 bg-accent-cabbage-default"
              style={{ height: `${(counts[index] / max) * 85}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {assignablePoolV1.map((item) => (
          <div key={item.id} className="flex flex-1 justify-center">
            <CharacterAvatar character={item} sizePx={24} />
          </div>
        ))}
      </div>
      <span className="text-text-tertiary typo-footnote">
        {SAMPLE_SIZE.toLocaleString()} simulated signups, about{' '}
        {Math.round(expected)} each expected. Every character gets its fair
        share, no character becomes &ldquo;the default one&rdquo;.
      </span>
    </div>
  );
};

const GROWN_POOL_SIZE = assignablePoolV1.length + 6;

const FrozenPool = () => {
  const changed = useMemo(
    () =>
      sampleIds.filter((id) => {
        const hash = hashSeed(id);
        return hash % assignablePoolV1.length !== hash % GROWN_POOL_SIZE;
      }).length / SAMPLE_SIZE,
    [],
  );

  return (
    <div className="grid gap-4 tablet:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-20 border border-accent-ketchup-default bg-background-subtle p-5">
        <span className="text-text-tertiary typo-footnote">
          Naive: append 6 characters, keep hashing mod pool length
        </span>
        <span className="ap-tabular text-accent-ketchup-default typo-mega3">
          {percent(changed)}
        </span>
        <span className="ap-pretty text-text-tertiary typo-callout">
          of existing users wake up with a different face the morning we ship.
          Every comment they ever wrote changes avatar overnight.
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-20 border border-accent-avocado-default bg-background-subtle p-5">
        <span className="text-text-tertiary typo-footnote">
          Versioned: the v1 pool is frozen, new characters never touch it
        </span>
        <span className="ap-tabular text-accent-avocado-default typo-mega3">
          0%
        </span>
        <span className="ap-pretty text-text-tertiary typo-callout">
          change. New characters reach people through the picker, and through
          signup once the backend assigns (phase three). Nobody&apos;s face
          moves unless they move it.
        </span>
      </div>
    </div>
  );
};

const StackSimulator = () => {
  const [ids, setIds] = useState(() => Array.from({ length: 5 }, randomId));
  const assigned = ids.map((id) => getCharacterForUser(id));
  const seen = new Map<string, number>();
  assigned.forEach((item) => seen.set(item.id, (seen.get(item.id) ?? 0) + 1));

  return (
    <div className="flex flex-col gap-4 rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="ap-stack flex">
          {assigned.map((item, index) => (
            <CharacterAvatar
              // eslint-disable-next-line react/no-array-index-key
              key={`${ids[index]}-${index}`}
              character={item}
              sizePx={40}
              animationKey={ids[index]}
              className={classNames(
                (seen.get(item.id) ?? 0) > 1 &&
                  'outline outline-2 outline-accent-ketchup-default',
              )}
            />
          ))}
        </div>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          icon={<RefreshIcon />}
          onClick={() => setIds(Array.from({ length: 5 }, randomId))}
        >
          Five new members
        </Button>
        <span className="text-text-tertiary typo-footnote">
          {[...seen.values()].some((count) => count > 1)
            ? 'Duplicate in this stack, outlined.'
            : 'All five distinct.'}
        </span>
      </div>
    </div>
  );
};

const poolSizes = [assignablePoolV1.length, 32, 64, 128];
const groupSizes = [3, 5, 8];

export const Assignment: StoryObj = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="How does someone get their character?"
        title="Your character is a function of your user id. Same input, same face, everywhere."
        goal="A stable identity for every no-photo account with zero backend work in phase one."
        metric="Faces that change after a release: zero."
      >
        <p>
          The resolver hashes the user id with FNV-1a and takes it modulo the
          assignable pool. It is keyed on the id and never the username, because
          usernames change and faces should not. It is deterministic, so the
          server-rendered feed, the hydrated client, the extension and the
          native wrappers all agree without talking to each other.
        </p>
      </PageHeader>

      <Section title="Try it">
        <Playground />
      </Section>

      <Section
        title="Even across 10,000 signups"
        description="A hash, not a counter, so there is no ordering effect: the first thousand users of a launch day do not all become octopuses."
      >
        <Distribution />
      </Section>

      <Section
        title="Why the v1 pool is frozen"
        description="The obvious way to add characters later quietly rewrites everyone's identity. The number on the left is computed live from the same 10,000 ids."
      >
        <FrozenPool />
      </Section>

      <Section
        title="Duplicates in a stack are the real constraint"
        description="Squad member stacks, upvoter rows and comment threads put five or more faces side by side. With a small pool, two people sharing a character is common. The birthday problem says how common."
      >
        <StackSimulator />
        <Table
          head={[
            'Assignable pool',
            ...groupSizes.map((size) => `${size} faces side by side`),
          ]}
          rows={poolSizes.map((pool) => [
            <span key="pool" className="font-bold text-text-primary">
              {pool}
              {pool === assignablePoolV1.length ? ' (today)' : ''}
            </span>,
            ...groupSizes.map((size) => (
              <span key={size} className="ap-tabular">
                {percent(duplicateChance(pool, size))} chance of a duplicate
              </span>
            )),
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout title="Grow the critters first">
            Doubling the assignable pool roughly halves duplicate stacks. The
            transparent-layer export from the art brief gets there fastest: 18
            characters on 8 token backdrops is 144 faces.
          </Callout>
          <Callout title="Accept the rest">
            A duplicate is two different names next to the same character, not a
            bug. Real photos collide too (two people in the same conference
            hoodie). Do not de-duplicate per list, it would give one person two
            faces.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
