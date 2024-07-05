import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  Dispatch,
  FormEvent,
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import useTopSites from '../useTopSites';

interface UseShortcutLinks {
  formRef: MutableRefObject<HTMLFormElement>;
  onSaveChanges: (
    e: FormEvent,
  ) => Promise<{ errors: Record<string | number, string> }>;
  askTopSitesPermission: () => Promise<boolean>;
  revokePermission: () => Promise<unknown>;
  onIsManual: Dispatch<boolean>;
  resetSelected: () => unknown;
  hasCheckedPermission?: boolean;
  isTopSiteActive?: boolean;
  hasTopSites?: boolean;
  isManual?: boolean;
  shortcutLinks: string[];
  formLinks: string[];
}

export default function useShortcutLinks(): UseShortcutLinks {
  const { logEvent } = useContext(LogContext);
  const formRef = useRef<HTMLFormElement>();
  const [isManual, setIsManual] = useState(true);
  const { customLinks, updateCustomLinks } = useContext(SettingsContext);
  const {
    topSites,
    hasCheckedPermission,
    revokePermission,
    askTopSitesPermission,
  } = useTopSites();
  const hasTopSites = topSites === undefined ? null : topSites?.length > 0;
  const hasCustomLinks = customLinks?.length > 0;
  const isTopSiteActive =
    hasCheckedPermission && !hasCustomLinks && hasTopSites;
  const sites = topSites?.map((site) => site.url);
  const shortcutLinks = isTopSiteActive ? sites : customLinks;
  const formLinks = (isManual ? customLinks : sites) || [];

  const resetSelected = () => {
    if (topSites !== undefined && !hasCustomLinks) {
      setIsManual(false);
    } else {
      setIsManual(true);
    }
  };

  const getFormInputs = () =>
    Array.from(formRef.current.elements).filter(
      (el) => el.getAttribute('name') === 'shortcutLink',
    ) as HTMLInputElement[];

  useEffect(() => {
    if (hasCheckedPermission) {
      resetSelected();
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCheckedPermission]);

  const onRevokePermission = async () => {
    await revokePermission();

    setIsManual(true);

    logEvent({
      event_name: LogEvent.RevokeShortcutAccess,
      target_type: TargetType.Shortcuts,
    });
  };

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

  return useMemo(
    () => ({
      formRef,
      isManual,
      formLinks,
      shortcutLinks,
      hasTopSites,
      isTopSiteActive,
      hasCheckedPermission,
      customLinks,
      onSaveChanges,
      askTopSitesPermission: async () => {
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
      resetSelected,
      onIsManual: setIsManual,
      revokePermission: onRevokePermission,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      formRef,
      isManual,
      formLinks,
      shortcutLinks,
      hasTopSites,
      isTopSiteActive,
      hasCheckedPermission,
      onSaveChanges,
      askTopSitesPermission,
      resetSelected,
      setIsManual,
      onRevokePermission,
    ],
  );
}
