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
import SettingsContext from '../contexts/SettingsContext';
import CardIcon from './icons/Card';
import LineIcon from './icons/Line';
import { IconsSwitch } from './fields/IconsSwitch';
import AuthContext from '../contexts/AuthContext';
import { Features, getFeatureValue } from '../lib/featureManagement';
import FeaturesContext from '../contexts/FeaturesContext';

const densities = [
  { label: 'Eco', value: 'eco' },
  { label: 'Roomy', value: 'roomy' },
  { label: 'Cozy', value: 'cozy' },
];
const Section = classed('section', 'flex flex-col font-bold mt-6');
const SectionTitle = classed(
  'h3',
  'text-theme-label-tertiary mb-4 font-bold typo-footnote',
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
  const isExtension = process.env.TARGET_BROWSER;
  const { user, showLogin } = useContext(AuthContext);
  const { flags } = useContext(FeaturesContext);
  const companionPlacement = getFeatureValue(
    Features.CompanionPermissionPlacement,
    flags,
  );
  const {
    spaciness,
    setSpaciness,
    themeMode,
    setTheme,
    showOnlyUnreadPosts,
    toggleShowOnlyUnreadPosts,
    openNewTab,
    toggleOpenNewTab,
    insaneMode,
    toggleInsaneMode,
    showTopSites,
    toggleShowTopSites,
    sortingEnabled,
    toggleSortingEnabled,
    optOutWeeklyGoal,
    toggleOptOutWeeklyGoal,
    optOutCompanion,
    toggleOptOutCompanion,
    autoDismissNotifications,
    toggleAutoDismissNotifications,
  } = useContext(SettingsContext);
  const [themes, setThemes] = useState([
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'Auto', value: 'auto' },
  ]);

  const onToggleForLoggedInUsers = (
    onToggleFunc: () => Promise<void> | void,
  ): Promise<void> | void => {
    if (!user) {
      showLogin('settings');
      return undefined;
    }

    return onToggleFunc();
  };

  useEffect(() => {
    // If browser does not supports color-scheme, remove auto theme option
    if (window && !window.matchMedia('(prefers-color-scheme: dark)')) {
      const updatedThemes = themes.filter((theme) => theme.value !== 'auto');
      setThemes(updatedThemes);
    }
  }, []);

  return (
    <div className={classNames('flex', 'flex-col p-6', className)} {...props}>
      <Section className="mt-0">
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
        <SectionTitle>Theme</SectionTitle>
        <Radio
          name="theme"
          options={themes}
          value={themeMode}
          onChange={setTheme}
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
        <SectionContent>
          <SettingsSwitch
            name="hide-read"
            checked={showOnlyUnreadPosts}
            onToggle={() => onToggleForLoggedInUsers(toggleShowOnlyUnreadPosts)}
          >
            Hide read posts
          </SettingsSwitch>
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
            name="weekly-goal-widget"
            checked={!optOutWeeklyGoal}
            onToggle={() => onToggleForLoggedInUsers(toggleOptOutWeeklyGoal)}
          >
            Show Weekly Goal widget
          </SettingsSwitch>
          {companionPlacement !== 'off' && (
            <SettingsSwitch
              name="hide-companion"
              checked={!optOutCompanion}
              onToggle={toggleOptOutCompanion}
            >
              Enable companion
            </SettingsSwitch>
          )}
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
