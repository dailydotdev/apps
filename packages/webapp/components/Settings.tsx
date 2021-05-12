import React, {
  HTMLAttributes,
  ReactElement,
  useContext,
  useMemo,
} from 'react';
import classed from '@dailydotdev/shared/src/lib/classed';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import classNames from 'classnames';
import CardIcon from '@dailydotdev/shared/icons/card.svg';
import LineIcon from '@dailydotdev/shared/icons/line.svg';
import { IconsSwitch } from '@dailydotdev/shared/src/components/fields/IconsSwitch';

const densities = [
  { label: 'Eco', value: 'eco' },
  { label: 'Roomy', value: 'roomy' },
  { label: 'Cozy', value: 'cozy' },
];

export default function Settings({
  panelMode = false,
  className,
  ...props
}: {
  panelMode?: boolean;
} & HTMLAttributes<HTMLDivElement>): ReactElement {
  const {
    spaciness,
    setSpaciness,
    lightMode,
    toggleLightMode,
    showOnlyUnreadPosts,
    toggleShowOnlyUnreadPosts,
    openNewTab,
    toggleOpenNewTab,
    insaneMode,
    toggleInsaneMode,
  } = useContext(SettingsContext);

  const Section = useMemo(
    () =>
      classed(
        'section',
        'flex flex-col font-bold',
        panelMode ? 'mx-5' : 'mt-6',
      ),
    [panelMode],
  );

  const SectionTitle = useMemo(
    () =>
      classed(
        'h3',
        'text-theme-label-tertiary mb-4 font-bold',
        panelMode ? 'typo-callout' : 'typo-body',
      ),
    [panelMode],
  );

  return (
    <div
      className={classNames(
        'flex',
        panelMode ? 'flex-row pl-20 pr-6 pt-10 pb-6' : 'flex-col p-6',
        className,
      )}
      {...props}
    >
      <h2
        className={classNames(
          'font-bold',
          panelMode ? 'typo-body mr-5' : 'typo-title2',
        )}
      >
        Settings
      </h2>
      <Section>
        <SectionTitle>Layout</SectionTitle>
        <IconsSwitch
          inputId="layout-switch"
          name="insaneMode"
          leftIcon={CardIcon}
          rightIcon={LineIcon}
          checked={insaneMode}
          className="mx-1.5"
          onToggle={toggleInsaneMode}
        />
      </Section>
      <Section>
        <SectionTitle>Density</SectionTitle>
        <Radio
          name="density"
          options={densities}
          value={spaciness}
          onChange={setSpaciness}
        />
      </Section>
      <Section>
        <SectionTitle>Preferences</SectionTitle>
        <div className="flex flex-col items-start pl-1.5 -my-0.5">
          <Switch
            inputId="theme-switch"
            name="theme"
            className="my-3"
            checked={lightMode}
            onToggle={toggleLightMode}
            compact={false}
          >
            Light theme
          </Switch>
          <Switch
            inputId="hide-read-switch"
            name="hide-read"
            className="my-3"
            checked={showOnlyUnreadPosts}
            onToggle={toggleShowOnlyUnreadPosts}
            compact={false}
          >
            Hide read posts
          </Switch>
          <Switch
            inputId="new-tab-switch"
            name="new-tab"
            className="big my-3"
            checked={openNewTab}
            onToggle={toggleOpenNewTab}
            compact={false}
          >
            Open links in new tab
          </Switch>
        </div>
      </Section>
    </div>
  );
}
