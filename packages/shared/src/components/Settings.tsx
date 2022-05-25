import React, {
  HTMLAttributes,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import classed from '../lib/classed';
import { Radio } from './fields/Radio';
import { Switch } from './fields/Switch';
import SettingsContext from '../contexts/SettingsContext';
import CardIcon from '../../icons/card.svg';
import LineIcon from '../../icons/line.svg';
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
        <div className="flex flex-col items-start pl-1.5 -my-0.5">
          <Switch
            inputId="hide-read-switch"
            name="hide-read"
            className="my-3"
            checked={showOnlyUnreadPosts}
            onToggle={() => onToggleForLoggedInUsers(toggleShowOnlyUnreadPosts)}
            compact={false}
          >
            Hide read posts
          </Switch>
          <Switch
            inputId="new-tab-switch"
            name="new-tab"
            className="my-3 big"
            checked={openNewTab}
            onToggle={toggleOpenNewTab}
            compact={false}
          >
            Open links in new tab
          </Switch>
          {isExtension && (
            <Switch
              inputId="top-sites-switch"
              name="top-sites"
              className="my-3 big"
              checked={showTopSites}
              onToggle={toggleShowTopSites}
              compact={false}
            >
              Show custom shortcuts
            </Switch>
          )}
          <Switch
            inputId="feed-sorting-switch"
            name="feed-sorting"
            className="my-3 big"
            checked={sortingEnabled}
            onToggle={toggleSortingEnabled}
            compact={false}
          >
            Show feed sorting menu
          </Switch>
          <Switch
            inputId="weekly-goal-widget-switch"
            name="weekly-goal-widget"
            className="my-3 big"
            checked={!optOutWeeklyGoal}
            onToggle={() => onToggleForLoggedInUsers(toggleOptOutWeeklyGoal)}
            compact={false}
          >
            Show Weekly Goal widget
          </Switch>
          {companionPlacement !== 'off' && (
            <Switch
              inputId="hide-companion-switch"
              name="hide-companion"
              className="my-3"
              checked={!optOutCompanion}
              onToggle={toggleOptOutCompanion}
              compact={false}
            >
              Enable companion
            </Switch>
          )}
        </div>
      </Section>
    </div>
  );
}
