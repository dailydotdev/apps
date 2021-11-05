import React, {
  FormEvent,
  HTMLAttributes,
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { updateProfile, UserProfile } from '../../lib/user';
import { TextField } from '../fields/TextField';
import { Switch } from '../fields/Switch';
import AuthContext from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import classed from '../../lib/classed';
import styles from './ProfileForm.module.css';
import { Summary, SummaryArrow } from '../utilities';
import { Dropdown } from '../fields/Dropdown';

const REQUIRED_FIELDS_COUNT = 4;

const TIMEZONES = [
  {
    value: 'Pacific/Midway',
    label: '(UTC-11:00) Midway Island, American Samoa',
  },
  {
    value: 'America/Adak',
    label: '(UTC-10:00) Aleutian Islands',
  },
  {
    value: 'Pacific/Honolulu',
    label: '(UTC-10:00) Hawaii',
  },
  {
    value: 'Pacific/Marquesas',
    label: '(UTC-09:30) Marquesas Islands',
  },
  {
    value: 'America/Anchorage',
    label: '(UTC-09:00) Alaska',
  },
  {
    value: 'America/Tijuana',
    label: '(UTC-08:00) Baja California',
  },
  {
    value: 'America/Los_Angeles',
    label: '(UTC-08:00) Pacific Time (US and Canada)',
  },
  {
    value: 'America/Phoenix',
    label: '(UTC-07:00) Arizona',
  },
  {
    value: 'America/Chihuahua',
    label: '(UTC-07:00) Chihuahua, La Paz, Mazatlan',
  },
  {
    value: 'America/Denver',
    label: '(UTC-07:00) Mountain Time (US and Canada), Navajo Nation',
  },
  {
    value: 'America/Belize',
    label: '(UTC-06:00) Central America',
  },
  {
    value: 'America/Chicago',
    label: '(UTC-06:00) Central Time (US and Canada)',
  },
  {
    value: 'Pacific/Easter',
    label: '(UTC-06:00) Easter Island',
  },
  {
    value: 'America/Mexico_City',
    label: '(UTC-06:00) Guadalajara, Mexico City, Monterrey',
  },
  {
    value: 'America/Regina',
    label: '(UTC-06:00) Saskatchewan',
  },
  {
    value: 'America/Bogota',
    label: '(UTC-05:00) Bogota, Lima, Quito',
  },
  {
    value: 'America/Cancun',
    label: '(UTC-05:00) Chetumal',
  },
  {
    value: 'America/New_York',
    label: '(UTC-05:00) Eastern Time (US and Canada)',
  },
  {
    value: 'America/Port-au-Prince',
    label: '(UTC-05:00) Haiti',
  },
  {
    value: 'America/Havana',
    label: '(UTC-05:00) Havana',
  },
  {
    value: 'America/Indiana/Indianapolis',
    label: '(UTC-05:00) Indiana (East)',
  },
  {
    value: 'America/Asuncion',
    label: '(UTC-04:00) Asuncion',
  },
  {
    value: 'America/Halifax',
    label: '(UTC-04:00) Atlantic Time (Canada)',
  },
  {
    value: 'America/Caracas',
    label: '(UTC-04:00) Caracas',
  },
  {
    value: 'America/Cuiaba',
    label: '(UTC-04:00) Cuiaba',
  },
  {
    value: 'America/Manaus',
    label: '(UTC-04:00) Georgetown, La Paz, Manaus, San Juan',
  },
  {
    value: 'America/Santiago',
    label: '(UTC-04:00) Santiago',
  },
  {
    value: 'America/Grand_Turk',
    label: '(UTC-04:00) Turks and Caicos',
  },
  {
    value: 'America/St_Johns',
    label: '(UTC-03:30) Newfoundland',
  },
  {
    value: 'America/Fortaleza',
    label: '(UTC-03:00) Araguaina',
  },
  {
    value: 'America/Sao_Paulo',
    label: '(UTC-03:00) Brasilia',
  },
  {
    value: 'America/Cayenne',
    label: '(UTC-03:00) Cayenne, Fortaleza',
  },
  {
    value: 'America/Buenos_Aires',
    label: '(UTC-03:00) City of Buenos Aires',
  },
  {
    value: 'America/Godthab',
    label: '(UTC-03:00) Greenland',
  },
  {
    value: 'America/Montevideo',
    label: '(UTC-03:00) Montevideo',
  },
  {
    value: 'America/Miquelon',
    label: '(UTC-03:00) Saint Pierre and Miquelon',
  },
  {
    value: 'America/Bahia',
    label: '(UTC-03:00) Salvador',
  },
  {
    value: 'America/Noronha',
    label: '(UTC-02:00) Fernando de Noronha',
  },
  {
    value: 'Atlantic/Azores',
    label: '(UTC-01:00) Azores',
  },
  {
    value: 'Atlantic/Cape_Verde',
    label: '(UTC-01:00) Cabo Verde Islands',
  },
  {
    value: 'Europe/London',
    label: '(UTC) Dublin, Edinburgh, Lisbon, London',
  },
  {
    value: 'Africa/Monrovia',
    label: '(UTC) Monrovia, Reykjavik',
  },
  {
    value: 'Europe/Amsterdam',
    label: '(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
  },
  {
    value: 'Europe/Belgrade',
    label: '(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague',
  },
  {
    value: 'Europe/Brussels',
    label: '(UTC+01:00) Brussels, Copenhagen, Madrid, Paris',
  },
  {
    value: 'Europe/Warsaw',
    label: '(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb',
  },
  {
    value: 'Africa/Algiers',
    label: '(UTC+01:00) West Central Africa',
  },
  {
    value: 'Africa/Casablanca',
    label: '(UTC+01:00) Casablanca',
  },
  {
    value: 'Africa/Windhoek',
    label: '(UTC+01:00) Windhoek',
  },
  {
    value: 'Asia/Amman',
    label: '(UTC+02:00) Amman',
  },
  {
    value: 'Europe/Athens',
    label: '(UTC+02:00) Athens, Bucharest',
  },
  {
    value: 'Asia/Beirut',
    label: '(UTC+02:00) Beirut',
  },
  {
    value: 'Africa/Cairo',
    label: '(UTC+02:00) Cairo',
  },
  {
    value: 'Asia/Damascus',
    label: '(UTC+02:00) Damascus',
  },
  {
    value: 'Asia/Gaza',
    label: '(UTC+02:00) Gaza, Hebron',
  },
  {
    value: 'Africa/Harare',
    label: '(UTC+02:00) Harare, Pretoria',
  },
  {
    value: 'Europe/Helsinki',
    label: '(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
  },
  {
    value: 'Asia/Jerusalem',
    label: '(UTC+02:00) Jerusalem',
  },
  {
    value: 'Europe/Kaliningrad',
    label: '(UTC+02:00) Kaliningrad',
  },
  {
    value: 'Africa/Tripoli',
    label: '(UTC+02:00) Tripoli',
  },
  {
    value: 'Asia/Baghdad',
    label: '(UTC+03:00) Baghdad',
  },
  {
    value: 'Asia/Istanbul',
    label: '(UTC+03:00) Istanbul',
  },
  {
    value: 'Asia/Kuwait',
    label: '(UTC+03:00) Kuwait, Riyadh',
  },
  {
    value: 'Europe/Minsk',
    label: '(UTC+03:00) Minsk',
  },
  {
    value: 'Europe/Moscow',
    label: '(UTC+03:00) Moscow, St. Petersburg',
  },
  {
    value: 'Africa/Nairobi',
    label: '(UTC+03:00) Nairobi',
  },
  {
    value: 'Asia/Tehran',
    label: '(UTC+03:30) Tehran',
  },
  {
    value: 'Asia/Muscat',
    label: '(UTC+04:00) Abu Dhabi, Muscat',
  },
  {
    value: 'Europe/Astrakhan',
    label: '(UTC+04:00) Astrakhan, Ulyanovsk, Volgograd',
  },
  {
    value: 'Asia/Baku',
    label: '(UTC+04:00) Baku',
  },
  {
    value: 'Europe/Samara',
    label: '(UTC+04:00) Izhevsk, Samara',
  },
  {
    value: 'Indian/Mauritius',
    label: '(UTC+04:00) Port Louis',
  },
  {
    value: 'Asia/Tbilisi',
    label: '(UTC+04:00) Tbilisi',
  },
  {
    value: 'Asia/Yerevan',
    label: '(UTC+04:00) Yerevan',
  },
  {
    value: 'Asia/Kabul',
    label: '(UTC+04:30) Kabul',
  },
  {
    value: 'Asia/Tashkent',
    label: '(UTC+05:00) Tashkent, Ashgabat',
  },
  {
    value: 'Asia/Yekaterinburg',
    label: '(UTC+05:00) Ekaterinburg',
  },
  {
    value: 'Asia/Karachi',
    label: '(UTC+05:00) Islamabad, Karachi',
  },
  {
    value: 'Asia/Kolkata',
    label: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
  },
  {
    value: 'Asia/Colombo',
    label: '(UTC+05:30) Sri Jayawardenepura',
  },
  {
    value: 'Asia/Katmandu',
    label: '(UTC+05:45) Kathmandu',
  },
  {
    value: 'Asia/Almaty',
    label: '(UTC+06:00) Astana',
  },
  {
    value: 'Asia/Dhaka',
    label: '(UTC+06:00) Dhaka',
  },
  {
    value: 'Asia/Rangoon',
    label: '(UTC+06:30) Yangon (Rangoon)',
  },
  {
    value: 'Asia/Novosibirsk',
    label: '(UTC+07:00) Novosibirsk',
  },
  {
    value: 'Asia/Bangkok',
    label: '(UTC+07:00) Bangkok, Hanoi, Jakarta',
  },
  {
    value: 'Asia/Barnaul',
    label: '(UTC+07:00) Barnaul, Gorno-Altaysk',
  },
  {
    value: 'Asia/Hovd',
    label: '(UTC+07:00) Hovd',
  },
  {
    value: 'Asia/Krasnoyarsk',
    label: '(UTC+07:00) Krasnoyarsk',
  },
  {
    value: 'Asia/Tomsk',
    label: '(UTC+07:00) Tomsk',
  },
  {
    value: 'Asia/Chongqing',
    label: '(UTC+08:00) Beijing, Chongqing, Hong Kong SAR, Urumqi',
  },
  {
    value: 'Asia/Irkutsk',
    label: '(UTC+08:00) Irkutsk',
  },
  {
    value: 'Asia/Kuala_Lumpur',
    label: '(UTC+08:00) Kuala Lumpur, Singapore',
  },
  {
    value: 'Australia/Perth',
    label: '(UTC+08:00) Perth',
  },
  {
    value: 'Asia/Taipei',
    label: '(UTC+08:00) Taipei',
  },
  {
    value: 'Asia/Ulaanbaatar',
    label: '(UTC+08:00) Ulaanbaatar',
  },
  {
    value: 'Asia/Pyongyang',
    label: '(UTC+08:30) Pyongyang',
  },
  {
    value: 'Australia/Eucla',
    label: '(UTC+08:45) Eucla',
  },
  {
    value: 'Asia/Chita',
    label: '(UTC+09:00) Chita',
  },
  {
    value: 'Asia/Tokyo',
    label: '(UTC+09:00) Osaka, Sapporo, Tokyo',
  },
  {
    value: 'Asia/Seoul',
    label: '(UTC+09:00) Seoul',
  },
  {
    value: 'Asia/Yakutsk',
    label: '(UTC+09:00) Yakutsk',
  },
  {
    value: 'Australia/Adelaide',
    label: '(UTC+09:30) Adelaide',
  },
  {
    value: 'Australia/Darwin',
    label: '(UTC+09:30) Darwin',
  },
  {
    value: 'Australia/Brisbane',
    label: '(UTC+10:00) Brisbane',
  },
  {
    value: 'Australia/Canberra',
    label: '(UTC+10:00) Canberra, Melbourne, Sydney',
  },
  {
    value: 'Pacific/Guam',
    label: '(UTC+10:00) Guam, Port Moresby',
  },
  {
    value: 'Australia/Hobart',
    label: '(UTC+10:00) Hobart',
  },
  {
    value: 'Asia/Vladivostok',
    label: '(UTC+10:00) Vladivostok',
  },
  {
    value: 'Australia/Lord_Howe',
    label: '(UTC+10:30) Lord Howe Island',
  },
  {
    value: 'Pacific/Bougainville',
    label: '(UTC+11:00) Bougainville Island',
  },
  {
    value: 'Asia/Srednekolymsk',
    label: '(UTC+11:00) Chokurdakh',
  },
  {
    value: 'Asia/Magadan',
    label: '(UTC+11:00) Magadan',
  },
  {
    value: 'Pacific/Norfolk',
    label: '(UTC+11:00) Norfolk Island',
  },
  {
    value: 'Asia/Sakhalin',
    label: '(UTC+11:00) Sakhalin',
  },
  {
    value: 'Pacific/Guadalcanal',
    label: '(UTC+11:00) Solomon Islands, New Caledonia',
  },
  {
    value: 'Asia/Anadyr',
    label: '(UTC+12:00) Anadyr, Petropavlovsk-Kamchatsky',
  },
  {
    value: 'Pacific/Auckland',
    label: '(UTC+12:00) Auckland, Wellington',
  },
  {
    value: 'Pacific/Fiji',
    label: '(UTC+12:00) Fiji Islands',
  },
  {
    value: 'Pacific/Chatham',
    label: '(UTC+12:45) Chatham Islands',
  },
  {
    value: 'Pacific/Tongatapu',
    label: "(UTC+13:00) Nuku'alofa",
  },
  {
    value: 'Pacific/Apia',
    label: '(UTC+13:00) Samoa',
  },
  {
    value: 'Pacific/Kiritimati',
    label: '(UTC+14:00) Kiritimati Island',
  },
];
const timezoneValues = TIMEZONES.map((timezone) => timezone.label);

export type RegistrationMode = 'default' | 'author' | 'update';

export interface ProfileFormProps extends HTMLAttributes<HTMLFormElement> {
  setDisableSubmit?: (disable: boolean) => void;
  onSuccessfulSubmit?: (optionalFields: boolean) => void | Promise<void>;
  mode?: RegistrationMode;
}

const FormField = classed(TextField, 'self-stretch mb-3');
const SectionHeading = classed(
  'h3',
  'mb-4 text-theme-label-tertiary typo-body',
  styles.sectionHeading,
);
const FormSwitch = classed(Switch, 'my-3', styles.formSwitch);

const defaultEmailHint = 'Not publicly shared';

export default function ProfileForm({
  setDisableSubmit,
  onSuccessfulSubmit,
  mode,
  className,
  ...props
}: ProfileFormProps): ReactElement {
  const { user, updateUser } = useContext(AuthContext);

  const formRef = useRef<HTMLFormElement>(null);

  const [usernameHint, setUsernameHint] = useState<string>();
  const [twitterHint, setTwitterHint] = useState<string>();
  const [githubHint, setGithubHint] = useState<string>();
  const [hashnodeHint, setHashnodeHint] = useState<string>();
  const [emailHint, setEmailHint] = useState(defaultEmailHint);

  const updateDisableSubmit = () => {
    if (formRef.current) {
      setDisableSubmit?.(!formRef.current.checkValidity());
    }
  };

  const usernameValidityUpdated = (valid: boolean) => {
    if (!valid && !usernameHint) {
      setUsernameHint('Username can only contain letters, numbers and _');
    }
    updateDisableSubmit();
  };

  const emailValidityUpdated = (valid: boolean) => {
    if (!valid && emailHint === defaultEmailHint) {
      setEmailHint('Must be a valid email');
    }
    updateDisableSubmit();
  };

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setDisableSubmit?.(true);
    const data = formToJson<UserProfile>(formRef.current, {
      name: '',
      email: '',
      username: '',
    });

    const res = await updateProfile(data);
    if ('error' in res) {
      if ('code' in res && res.code === 1) {
        if (res.field === 'email') {
          setEmailHint('This email is already used');
        } else if (res.field === 'username') {
          setUsernameHint('This username is already taken');
        } else if (res.field === 'twitter') {
          setTwitterHint('This Twitter handle is already used');
        } else if (res.field === 'github') {
          setGithubHint('This GitHub handle is already used');
        } else if (res.field === 'hashnode') {
          setGithubHint('This Hashnode handle is already used');
        }
      }
    } else {
      await updateUser({ ...user, ...res });
      setDisableSubmit?.(false);
      const filledFields = Object.keys(data).filter(
        (key) => data[key] !== undefined && data[key] !== null,
      );
      onSuccessfulSubmit?.(filledFields.length > REQUIRED_FIELDS_COUNT);
    }
  };

  const twitterField = (
    <FormField
      compact
      inputId="twitter"
      name="twitter"
      label="Twitter"
      value={user.twitter}
      hint={twitterHint}
      valid={!twitterHint}
      placeholder="handle"
      pattern="^@?(\w){1,15}$"
      maxLength={15}
      validityChanged={updateDisableSubmit}
      valueChanged={() => twitterHint && setTwitterHint(null)}
      required={mode === 'author'}
    />
  );

  const optionalFields = (
    <>
      <SectionHeading>About</SectionHeading>
      <FormField
        compact
        inputId="bio"
        name="bio"
        label="Bio"
        value={user.bio}
        maxLength={160}
        validityChanged={updateDisableSubmit}
      />

      <div className="flex flex-col items-stretch">
        <label className="px-2 mb-1 font-bold text-theme-label-primary">
          Time zone
        </label>
        <Dropdown
          selectedIndex={null}
          onChange={() => console.log('load')}
          className="w-40"
          options={timezoneValues}
        />
      </div>
      <FormField
        compact
        inputId="company"
        name="company"
        label="Company"
        value={user.company}
        maxLength={50}
        validityChanged={updateDisableSubmit}
      />
      <FormField
        compact
        inputId="title"
        name="title"
        label="Job title"
        value={user.title}
        maxLength={50}
        validityChanged={updateDisableSubmit}
      />
      <SectionHeading>Social</SectionHeading>
      {mode !== 'author' && twitterField}
      <FormField
        compact
        inputId="github"
        name="github"
        label="GitHub"
        value={user.github}
        hint={githubHint}
        valid={!githubHint}
        placeholder="handle"
        pattern="^@?([\w-]){1,39}$"
        maxLength={39}
        validityChanged={updateDisableSubmit}
        valueChanged={() => githubHint && setGithubHint(null)}
      />
      <FormField
        compact
        inputId="hashnode"
        name="hashnode"
        label="Hashnode"
        value={user.hashnode}
        hint={hashnodeHint}
        valid={!hashnodeHint}
        placeholder="handle"
        pattern="^@?([\w-]){1,39}$"
        maxLength={39}
        validityChanged={updateDisableSubmit}
        valueChanged={() => hashnodeHint && setHashnodeHint(null)}
      />
      <FormField
        compact
        inputId="portfolio"
        name="portfolio"
        label="Website"
        type="url"
        value={user.portfolio}
        validityChanged={updateDisableSubmit}
      />
    </>
  );

  return (
    <form
      className={classNames(className, 'flex flex-col w-full mt-10 p-0')}
      ref={formRef}
      onSubmit={onSubmit}
      {...props}
      data-testid="form"
    >
      <SectionHeading>Profile</SectionHeading>
      <FormField
        compact
        inputId="name"
        name="name"
        label="Name"
        value={user.name}
        required
        maxLength={50}
        pattern="^\w(.*)?"
        validityChanged={updateDisableSubmit}
      />
      <FormField
        compact
        inputId="username"
        name="username"
        label="Username"
        value={user.username}
        required
        hint={usernameHint}
        valid={!usernameHint}
        validityChanged={usernameValidityUpdated}
        maxLength={15}
        pattern="^@?(\w){1,15}$"
        valueChanged={() => usernameHint && setUsernameHint(null)}
      />
      <FormField
        compact
        inputId="email"
        name="email"
        label="Email"
        type="email"
        value={user.email}
        required
        hint={emailHint}
        valid={emailHint === defaultEmailHint}
        validityChanged={emailValidityUpdated}
        valueChanged={() =>
          emailHint !== defaultEmailHint && setEmailHint(defaultEmailHint)
        }
      />
      {mode === 'author' && twitterField}
      {mode === 'update' && (
        <>
          {optionalFields}
          <SectionHeading>Settings</SectionHeading>
        </>
      )}
      <FormSwitch
        name="acceptedMarketing"
        inputId="acceptedMarketing"
        checked={user.acceptedMarketing}
      >
        Subscribe to the Weekly Recap
      </FormSwitch>
      {mode !== 'update' && (
        <details
          className={`flex flex-col w-full border-b border-theme-divider-tertiary ${styles.optionalFields}`}
        >
          <Summary className={styles.optionalSummary}>
            <div className="flex items-center h-10 font-bold text-theme-label-tertiary typo-callout">
              More details (optional)
              <SummaryArrow />
            </div>
          </Summary>
          {optionalFields}
        </details>
      )}
    </form>
  );
}
