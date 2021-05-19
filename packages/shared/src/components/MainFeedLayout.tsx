import React, {
  DependencyList,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Feed, { FeedProps } from './Feed';
import AuthContext from '../contexts/AuthContext';
import {
  getSourcesSettingsQueryKey,
  getTagsSettingsQueryKey,
} from '../hooks/useMutateFilters';
import { FeedSettingsData } from '../graphql/feedSettings';
import { LoggedUser } from '../lib/user';
import OnboardingContext from '../contexts/OnboardingContext';
import MagnifyingIcon from '../../icons/magnifying.svg';
import { Dropdown, DropdownProps } from './fields/Dropdown';
import { Button, ButtonProps } from './buttons/Button';
import { FeedPage } from './utilities';
import utilitiesStyles from './utilities.module.css';
import styles from './MainFeedLayout.module.css';
import CalendarIcon from '../../icons/calendar.svg';

const SearchEmptyScreen = dynamic(
  () => import(/* webpackChunkName: "emptySearch" */ './SearchEmptyScreen'),
);

export type Tab = {
  name: string;
  path: string;
  title: string;
  default?: boolean;
};
export const tabs: Tab[] = [
  {
    name: 'popular',
    path: '/popular',
    title: 'Popular',
    default: true,
  },
  {
    name: 'upvoted',
    path: `/upvoted`,
    title: 'Upvoted',
  },
  {
    name: 'discussed',
    path: `/discussed`,
    title: 'Discussed',
  },
  {
    name: 'recent',
    path: `/recent`,
    title: 'Recent',
  },
];

export type MainFeedLayoutProps<T> = {
  feedName: string;
  query: string;
  queryIfLogged?: string;
  variables?: T;
  children?: ReactNode;
  useNavButtonsNotLinks?: boolean;
  onNavTabClicked?: (tab: Tab) => unknown;
  onSearchButtonClicked?: () => unknown;
  searchChildren: ReactNode;
};

const getQueryBasedOnLogin = (
  tokenRefreshed: boolean,
  user: LoggedUser | null,
  query: string,
  queryIfLogged: string | null,
): string | null => {
  if (tokenRefreshed) {
    if (user && queryIfLogged) {
      return queryIfLogged;
    } else {
      return query;
    }
  }
  return null;
};

const periods = [
  { value: 7, text: 'Last week' },
  { value: 30, text: 'Last month' },
  { value: 365, text: 'Last year' },
];
const periodTexts = periods.map((period) => period.text);

function ButtonOrLink({
  asLink,
  href,
  ...props
}: { asLink: boolean; href: string } & ButtonProps<'button'>) {
  if (asLink) {
    return (
      <Link href={href} passHref prefetch={false}>
        <Button {...props} tag="a" />
      </Link>
    );
  }
  return <Button {...props} />;
}

export default function MainFeedLayout<T>({
  feedName,
  query,
  queryIfLogged,
  variables,
  children,
  useNavButtonsNotLinks,
  onNavTabClicked,
  onSearchButtonClicked,
  searchChildren,
}: MainFeedLayoutProps<T>): ReactElement {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { onboardingStep, onboardingReady } = useContext(OnboardingContext);
  const showWelcome = onboardingStep === 1;
  const finalQuery = getQueryBasedOnLogin(
    tokenRefreshed,
    user,
    query,
    queryIfLogged,
  );
  const [loadedTagsSettings, setLoadedTagsSettings] = useState(false);
  const [loadedSourcesSettings, setLoadedSourcesSettings] = useState(false);
  const [feedDeps, setFeedDeps] = useState<DependencyList>([0]);
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  const tagsQueryKey = getTagsSettingsQueryKey(user);
  const { data: tagsSettings } = useQuery<FeedSettingsData>(
    tagsQueryKey,
    () => ({ feedSettings: { includeTags: [] } }),
    {
      enabled: false,
    },
  );
  const sourcesQueryKey = getSourcesSettingsQueryKey(user);
  const { data: sourcesSettings } = useQuery<FeedSettingsData>(
    sourcesQueryKey,
    () => ({ feedSettings: { excludeSources: [] } }),
    {
      enabled: false,
    },
  );
  useEffect(() => {
    if (tagsSettings) {
      if (loadedTagsSettings) {
        setFeedDeps([feedDeps[0] + 1]);
      } else {
        setLoadedTagsSettings(true);
      }
    }
  }, [tagsSettings]);

  useEffect(() => {
    if (sourcesSettings) {
      if (loadedSourcesSettings) {
        setFeedDeps([feedDeps[0] + 1]);
      } else {
        setLoadedSourcesSettings(true);
      }
    }
  }, [sourcesSettings]);

  const isSearch = feedName === 'search';
  const isUpvoted = feedName === 'upvoted';

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    return {
      query: finalQuery,
      variables: isUpvoted
        ? { ...variables, period: periods[selectedPeriod].value }
        : variables,
      dep: feedDeps,
      emptyScreen: isSearch ? <SearchEmptyScreen /> : undefined,
    };
  }, [isSearch, finalQuery, variables, feedDeps]);

  const tabClassNames = isSearch ? 'btn-tertiary invisible' : 'btn-tertiary';
  const periodDropdownProps: DropdownProps = {
    style: { width: '11rem' },
    buttonSize: 'medium',
    icon: <CalendarIcon />,
    selectedIndex: selectedPeriod,
    options: periodTexts,
    onChange: (value, index) => {
      setSelectedPeriod(index);
      setFeedDeps([feedDeps[0] + 1]);
    },
  };

  return (
    <FeedPage
      className={classNames({
        [utilitiesStyles.notReady]: !onboardingReady,
      })}
    >
      {showWelcome && (
        <div
          role="status"
          className={`self-stretch -mt-1 mb-12 mx-auto py-3 px-6 text-theme-label-secondary rounded-2xl border border-theme-divider-secondary text-center typo-callout ${styles.welcome}`}
        >
          Dear developer, our mission is to serve all the best programming news
          you’ll ever need. Ready?
        </div>
      )}
      <nav className="relative h-11 flex self-stretch items-center mb-6 overflow-x-auto no-scrollbar">
        <ButtonOrLink
          asLink={!useNavButtonsNotLinks}
          href="/search"
          buttonSize="small"
          icon={<MagnifyingIcon />}
          className={tabClassNames}
          title="Search"
          onClick={onSearchButtonClicked}
        />
        {tabs.map((tab) => (
          <ButtonOrLink
            asLink={!useNavButtonsNotLinks}
            href={tab.path}
            key={tab.path}
            buttonSize="small"
            pressed={tab.name === feedName}
            className={tabClassNames}
            onClick={() => onNavTabClicked?.(tab)}
          >
            {tab.title}
          </ButtonOrLink>
        ))}
        {isUpvoted && (
          <Dropdown
            className="hidden laptop:block ml-auto mr-px"
            {...periodDropdownProps}
          />
        )}
        {isSearch ? searchChildren : undefined}
      </nav>
      {isUpvoted && (
        <Dropdown className="laptop:hidden mb-6" {...periodDropdownProps} />
      )}
      <Feed {...feedProps} />
      {children}
    </FeedPage>
  );
}
