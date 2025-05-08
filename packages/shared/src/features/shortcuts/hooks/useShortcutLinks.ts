import type { FormEvent, MutableRefObject } from 'react';
import { useContext, useEffect, useRef } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import LogContext from '../../../contexts/LogContext';
import { LogEvent, ShortcutsSourceType, TargetType } from '../../../lib/log';
import { useShortcutsUser } from './useShortcutsUser';
import { useShortcuts } from '../contexts/ShortcutsProvider';

export interface UseShortcutLinks {
  formRef: MutableRefObject<HTMLFormElement>;
  onSaveChanges: (
    e: FormEvent,
  ) => Promise<{ errors: Record<string | number, string> }>;
  askTopSitesBrowserPermission: () => Promise<boolean>;
  hasCheckedPermission?: boolean;
  isTopSiteActive?: boolean;
  hasTopSites?: boolean;
  isManual?: boolean;
  shortcutLinks: string[];
  formLinks: string[];
  customLinks?: string[];
  hideShortcuts: boolean;
  showGetStarted: boolean;
}

export function useShortcutLinks(): UseShortcutLinks {
  const { logEvent } = useContext(LogContext);
  const formRef = useRef<HTMLFormElement>();

  const { isManual, topSites, hasCheckedPermission, askTopSitesPermission } =
    useShortcuts();

  const { customLinks, updateCustomLinks, showTopSites } = useSettingsContext();

  const hasTopSites = topSites === undefined ? null : topSites?.length > 0;
  const hasCustomLinks = customLinks?.length > 0;
  const isTopSiteActive =
    hasCheckedPermission && !hasCustomLinks && hasTopSites;
  const sites = topSites?.map((site) => site.url);
  const shortcutLinks = isTopSiteActive ? sites : customLinks;
  const formLinks = (isManual ? customLinks : sites) || [];

  const { isOldUser, showToggleShortcuts, hasCompletedFirstSession } =
    useShortcutsUser();
  const hasNoShortcuts = !shortcutLinks?.length && showTopSites;
  const showGetStarted =
    !isOldUser && hasNoShortcuts && !hasCompletedFirstSession;

  const getFormInputs = () =>
    Array.from(formRef.current.elements).filter(
      (el) => el.getAttribute('name') === 'shortcutLink',
    ) as HTMLInputElement[];

  const onSaveChanges = async (e: FormEvent) => {
    e.preventDefault();

    if (!isManual) {
      updateCustomLinks([]);
      return { errors: null };
    }

    if (!formRef.current) {
      return { errors: { message: 'Form not available' } };
    }

    const isValid = formRef.current.checkValidity();

    if (!isValid) {
      return { errors: { message: 'Some of the links are not valid!' } };
    }

    const links = getFormInputs()
      .map((el) => el.value.trim())
      .filter((link) => !!link);

    updateCustomLinks(links);

    logEvent({
      event_name: LogEvent.SaveShortcutAccess,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Custom }),
    });

    return { errors: null };
  };

  useEffect(() => {
    if (!formRef?.current) {
      return;
    }

    const elements = getFormInputs();

    elements.forEach((input: HTMLInputElement, i) => {
      // eslint-disable-next-line no-param-reassign
      input.value = formLinks?.[i]?.trim() || '';
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManual, hasCustomLinks]);

  return {
    formRef,
    isManual,
    formLinks,
    shortcutLinks,
    hasTopSites,
    isTopSiteActive,
    hasCheckedPermission,
    customLinks,
    showGetStarted,
    hideShortcuts: showToggleShortcuts,
    onSaveChanges,
    askTopSitesBrowserPermission: async () => {
      const granted = await askTopSitesPermission();

      if (granted) {
        logEvent({
          event_name: LogEvent.SaveShortcutAccess,
          target_type: TargetType.Shortcuts,
          extra: JSON.stringify({ source: ShortcutsSourceType.Browser }),
        });
      }

      return granted;
    },
  };
}
