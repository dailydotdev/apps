import React, { ReactElement, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Radio } from '../fields/Radio';
import SettingsContext, {
  themes as layoutThemes,
} from '../../contexts/SettingsContext';
import { CardIcon, LineIcon } from '../icons';
import { Checkbox } from '../fields/Checkbox';
import { IconProps, IconSize } from '../Icon';
import { PlaceholderCard } from '../cards/PlaceholderCard';
import { PlaceholderList } from '../cards/list/PlaceholderList';

export const FeedLayoutPreview = (): ReactElement => {
  const { themeMode, setTheme, insaneMode, toggleInsaneMode } =
    useContext(SettingsContext);
  const [themes, setThemes] = useState(layoutThemes);

  useEffect(() => {
    // If browser does not supports color-scheme, remove auto theme option
    if (window && !window.matchMedia('(prefers-color-scheme: dark)')) {
      const updatedThemes = themes.filter((theme) => theme.value !== 'auto');
      setThemes(updatedThemes);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CustomRadio = ({
    IconComponent,
    active,
    title,
    description,
  }: {
    IconComponent: React.ComponentType<IconProps>;
    active: boolean;
    title: string;
    description: string;
  }) => {
    return (
      <button
        type="button"
        className={classNames(
          'cursor-pointer rounded-16 border  p-4 text-left',
          active
            ? 'border-accent-cabbage-bolder bg-surface-float text-text-primary'
            : 'text-text-tertiary',
        )}
        onClick={toggleInsaneMode}
      >
        <div className="flex">
          <IconComponent secondary={active} size={IconSize.Medium} />
          <p className="ml-2 mr-auto font-bold typo-title3">{title}</p>
          {active && (
            <Checkbox
              className="pointer-events-none !p-0"
              checkmarkClassName="!mr-0"
              name="layout"
              checked={active}
            />
          )}
        </div>
        <p className="mt-1.5 typo-body">{description}</p>
      </button>
    );
  };

  return (
    <>
      <div className="mb-[3.75rem] flex flex-col items-center">
        <h2 className="typo-bold text-center typo-large-title">
          Feed layout preview
        </h2>
      </div>
      <main className="flex flex-col gap-10 laptop:flex-row">
        <aside className="flex w-full flex-col gap-5 laptop:w-[26.25rem]">
          <p className="font-bold typo-title3">Choose a layout</p>
          <CustomRadio
            IconComponent={CardIcon}
            active={!insaneMode}
            title="Cards"
            description="Offers a visually appealing design, making content easy to scan."
          />
          <CustomRadio
            IconComponent={LineIcon}
            active={insaneMode}
            title="List"
            description="Provides a compact, text-focused display, allowing for efficient
              browsing."
          />
          <p className="font-bold typo-title3">Choose a theme</p>
          <Radio
            className={{ container: '!flex-row' }}
            name="theme"
            options={themes}
            value={themeMode}
            onChange={setTheme}
          />
        </aside>
        <section className="w-full laptop:w-[38.75rem]">
          {insaneMode ? (
            <>
              <PlaceholderList />
              <PlaceholderList />
              <PlaceholderList />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <PlaceholderCard />
              <PlaceholderCard />
              <PlaceholderCard />
              <PlaceholderCard />
            </div>
          )}
        </section>
      </main>
    </>
  );
};
