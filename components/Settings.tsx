import React, {
  HTMLAttributes,
  ReactElement,
  useContext,
  useMemo,
} from 'react';
import classed from '../lib/classed';
import Radio from './fields/Radio';
import Switch from './fields/Switch';
import SettingsContext from '../contexts/SettingsContext';
import classNames from 'classnames';

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
        'text-theme-label-tertiary mb-5 font-bold',
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
            className="big my-3"
            checked={lightMode}
            onToggle={toggleLightMode}
          >
            Light theme
          </Switch>
          <Switch
            inputId="hide-read-switch"
            name="hide-read"
            className="big my-3"
            checked={showOnlyUnreadPosts}
            onToggle={toggleShowOnlyUnreadPosts}
          >
            Hide read posts
          </Switch>
          <Switch
            inputId="new-tab-switch"
            name="new-tab"
            className="big my-3"
            checked={openNewTab}
            onToggle={toggleOpenNewTab}
          >
            Open links in new tab
          </Switch>
        </div>
      </Section>
    </div>
  );
}
