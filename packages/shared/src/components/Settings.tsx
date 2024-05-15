import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import classed from '../lib/classed';
import { Radio } from './fields/Radio';
import { Switch } from './fields/Switch';
import SettingsContext, {
  themes as layoutThemes,
} from '../contexts/SettingsContext';
import { CardIcon, LineIcon } from './icons';
import { CustomSwitch } from './fields/CustomSwitch';
import { checkIsExtension } from '../lib/func';
import { useFeedLayout } from '../hooks';

const densities = [
  { label: 'Eco', value: 'eco' },
  { label: 'Roomy', value: 'roomy' },
  { label: 'Cozy', value: 'cozy' },
];
const Section = classed('section', 'flex flex-col font-bold mt-6');
const SectionTitle = classed(
  'h3',
  'text-text-tertiary mb-4 font-bold typo-footnote',
);
const SectionContent = classed(
  'div',
  'flex flex-col items-start pl-1.5 -my-0.5',
);

interface SettingsSwitchProps {
  name?: string;
  children: ReactNode;
  checked: boolean;
  onToggle: () => void;
}

const SettingsSwitch = ({ name, children, ...props }: SettingsSwitchProps) => {
  return (
    <Switch
      inputId={`${name}-switch`}
      name={name}
      className="my-3"
      compact={false}
      {...props}
    >
      {children}
    </Switch>
  );
};

export default function Settings({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  const isExtension = checkIsExtension();
  const { shouldUseMobileFeedLayout } = useFeedLayout({ feedRelated: false });
  const {
    spaciness,
    setSpaciness,
    themeMode,
    setTheme,
    openNewTab,
    toggleOpenNewTab,
    insaneMode,
    toggleInsaneMode,
    showTopSites,
    toggleShowTopSites,
    sortingEnabled,
    toggleSortingEnabled,
    optOutCompanion,
    toggleOptOutCompanion,
    autoDismissNotifications,
    toggleAutoDismissNotifications,
  } = useContext(SettingsContext);
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

  return (
    <div className={classNames('flex', 'flex-col', className)} {...props}>
      {!shouldUseMobileFeedLayout && (
        <Section className="!mt-0">
          <SectionTitle>Layout</SectionTitle>
          <CustomSwitch
            inputId="layout-switch"
            name="insaneMode"
            leftContent={<CardIcon secondary={!insaneMode} />}
            rightContent={<LineIcon secondary={insaneMode} />}
            checked={insaneMode}
            className="mx-1.5"
            onToggle={toggleInsaneMode}
          />
        </Section>
      )}
      <Section className={shouldUseMobileFeedLayout && '!mt-0'}>
        <SectionTitle>Theme</SectionTitle>
        <Radio
          name="theme"
          options={themes}
          value={themeMode}
          onChange={setTheme}
        />
      </Section>
      {!shouldUseMobileFeedLayout && (
        <Section>
          <SectionTitle>Density</SectionTitle>
          <Radio
            name="density"
            options={densities}
            value={spaciness}
            onChange={setSpaciness}
          />
        </Section>
      )}
      <Section>
        <SectionTitle>Preferences</SectionTitle>
        <SectionContent>
          <SettingsSwitch
            name="new-tab"
            checked={openNewTab}
            onToggle={toggleOpenNewTab}
          >
            Open links in new tab
          </SettingsSwitch>
          {isExtension && (
            <SettingsSwitch
              name="top-sites"
              checked={showTopSites}
              onToggle={toggleShowTopSites}
            >
              Show custom shortcuts
            </SettingsSwitch>
          )}
          <SettingsSwitch
            name="feed-sorting"
            checked={sortingEnabled}
            onToggle={toggleSortingEnabled}
          >
            Show feed sorting menu
          </SettingsSwitch>
          <SettingsSwitch
            name="hide-companion"
            checked={!optOutCompanion}
            onToggle={toggleOptOutCompanion}
          >
            Enable companion
          </SettingsSwitch>
        </SectionContent>
      </Section>
      <Section>
        <SectionTitle>Accessibility</SectionTitle>
        <SectionContent>
          <SettingsSwitch
            name="auto-dismiss-notifications"
            checked={autoDismissNotifications}
            onToggle={toggleAutoDismissNotifications}
          >
            Automatically dismiss notifications
          </SettingsSwitch>
        </SectionContent>
      </Section>
    </div>
  );
}
