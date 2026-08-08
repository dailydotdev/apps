import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../../../lib/user';
import type { UserStack } from '../../../../graphql/user/userStack';
import { buildSectionsState, getVisibleSections } from './dnd';

const MAX_SECTIONS = 3;
const MAX_TOOLS_PER_SECTION = 4;

const FALLBACK_TILE_STYLES = [
  { background: 'rgba(186,86,225,.22)', color: '#D9A6F2' },
  { background: 'rgba(74,126,238,.2)', color: '#7BA7FF' },
  { background: 'rgba(87,224,135,.16)', color: '#57E087' },
  { background: 'rgba(255,226,76,.14)', color: '#FFE24C' },
  { background: 'rgba(229,94,80,.16)', color: '#F57869' },
];

const getStartedYear = (item: UserStack): number | null => {
  if (!item.startedAt) {
    return null;
  }
  const year = new Date(item.startedAt).getFullYear();
  return Number.isNaN(year) ? null : year;
};

const getYearsShipping = (items: UserStack[]): number | null => {
  const years = items
    .map(getStartedYear)
    .filter((year): year is number => year !== null);
  if (!years.length) {
    return null;
  }
  const span = new Date().getFullYear() - Math.min(...years);
  return span > 0 ? span : null;
};

const StackTool = ({
  item,
  index,
}: {
  item: UserStack;
  index: number;
}): ReactElement => {
  const title = item.title ?? item.tool.title;
  const iconUrl = item.icon || item.tool.faviconUrl;
  const startedYear = getStartedYear(item);
  const tile = FALLBACK_TILE_STYLES[index % FALLBACK_TILE_STYLES.length];

  return (
    <div className="border-white/10 bg-white/5 flex items-center gap-3.5 rounded-20 border px-4 py-3">
      {iconUrl ? (
        <img
          src={iconUrl}
          alt=""
          className="size-8 flex-none rounded-10 object-contain"
        />
      ) : (
        <span
          className="grid size-8 flex-none place-items-center rounded-10 text-base font-bold"
          style={tile}
        >
          {title.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="flex-1 truncate text-[23px] font-bold text-white">
        {title}
      </span>
      {startedYear && (
        <span className="font-mono text-[17px] text-raw-salt-90/64">
          &apos;{String(startedYear).slice(-2)}
        </span>
      )}
    </div>
  );
};

export interface StackShareCardProps {
  user: PublicProfile;
  items: UserStack[];
}

export const StackShareCard = ({
  user,
  items,
}: StackShareCardProps): ReactElement => {
  const sections = buildSectionsState(items);
  const visibleSections = getVisibleSections(sections).slice(0, MAX_SECTIONS);
  const yearsShipping = getYearsShipping(items);

  return (
    <div
      className="relative flex h-[630px] w-[1200px] flex-col overflow-hidden bg-[#0A0D12] p-14"
      style={{
        backgroundImage: [
          'radial-gradient(60% 90% at 100% 0%, rgba(107,86,221,.26), transparent 60%)',
          'radial-gradient(50% 80% at 0% 100%, rgba(186,86,225,.18), transparent 55%)',
        ].join(', '),
      }}
    >
      <div className="flex items-center gap-6">
        {user.image && (
          <img
            src={user.image}
            alt=""
            className="size-[100px] flex-none rounded-26 object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[40px] font-bold leading-tight text-white">
            {user.name}
          </div>
          <div className="mt-1 font-mono text-[23px] text-raw-salt-90/64">
            @{user.username} · my stack
          </div>
        </div>
        <div className="flex-none text-right">
          {yearsShipping && (
            <div className="font-mono text-[25px] text-raw-salt-50">
              <b className="text-[31px] text-accent-cheese-default">
                {yearsShipping} yrs
              </b>{' '}
              shipping
            </div>
          )}
          <div className="mt-2 text-[24px] font-bold text-white">
            daily<span className="font-normal text-raw-salt-90">.dev</span>
          </div>
        </div>
      </div>

      <div
        className="mt-8 grid flex-1 gap-7"
        style={{
          gridTemplateColumns: `repeat(${
            visibleSections.length || 1
          }, minmax(0, 1fr))`,
        }}
      >
        {visibleSections.map((section) => (
          <div key={section} className="min-w-0">
            <h5 className="border-white/10 mb-4 border-b pb-2.5 text-lg font-bold uppercase tracking-widest text-raw-salt-90/64">
              {section}
            </h5>
            <div className="flex flex-col gap-3">
              {sections[section]
                .slice(0, MAX_TOOLS_PER_SECTION)
                .map((item, index) => (
                  <StackTool key={item.id} item={item} index={index} />
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-6">
        <span className="font-mono text-[22px] text-raw-salt-90">
          app.daily.dev/
          <b className="font-semibold text-[#D9A6F2]">{user.username}</b>
        </span>
        <span className="text-[19px] text-raw-salt-90/64">
          Where developers grow together
        </span>
      </div>
    </div>
  );
};
