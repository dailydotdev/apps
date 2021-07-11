import React, {
  HTMLAttributes,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import classed from '../lib/classed';
import { Radio } from './fields/Radio';
import { Switch } from './fields/Switch';
import SettingsContext from '../contexts/SettingsContext';
import classNames from 'classnames';
import CardIcon from '../../icons/card.svg';
import LineIcon from '../../icons/line.svg';
import OpenLink from '../../icons/open_link.svg';
import { IconsSwitch } from './fields/IconsSwitch';
import AuthContext from '../contexts/AuthContext';
import { LoginModalMode } from '../types/LoginModalMode';
import { Button } from './buttons/Button';

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
  const { user, showLogin } = useContext(AuthContext);
  const {
    spaciness,
    setSpaciness,
    themeMode,
    setUIThemeMode,
    showOnlyUnreadPosts,
    toggleShowOnlyUnreadPosts,
    openNewTab,
    toggleOpenNewTab,
    insaneMode,
    toggleInsaneMode,
  } = useContext(SettingsContext);
  const [themes, setThemes] = useState([
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'Auto', value: 'auto' },
  ]);
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

  const onShowOnlyUnreadPosts = (): Promise<void> | void => {
    if (!user) {
      showLogin('settings', LoginModalMode.Default);
    } else {
      return toggleShowOnlyUnreadPosts();
    }
  };

  useEffect(() => {
    // If browser does not supports color-scheme, remove auto theme option
    if (window && !window.matchMedia('(prefers-color-scheme: dark)')) {
      const updatedThemes = themes.filter((theme) => theme.value !== 'auto');
      setThemes(updatedThemes);
    }
  }, []);

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
        <SectionTitle>Theme</SectionTitle>
        <Radio
          name="theme"
          options={themes}
          value={themeMode}
          onChange={setUIThemeMode}
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
            onToggle={onShowOnlyUnreadPosts}
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
      <Section className="laptop:hidden">
        <SectionTitle>Contact</SectionTitle>
        <Button
          className="btn-secondary self-start mt-1"
          tag="a"
          href="mailto:support@daily.dev"
          buttonSize="small"
          rightIcon={<OpenLink />}
        >
          Send feedback
        </Button>
      </Section>
    </div>
  );
}
