import { utcToZonedTime } from 'date-fns-tz';
import type { FC } from 'react';
import { DaytimeIcon, NighttimeIcon } from '../components/icons/TimeZone';
import type { IconProps } from '../components/Icon';

interface TimeZoneItem {
  value: string;
  label: string;
  offset?: number;
}

const TIME_ZONES: TimeZoneItem[] = [
  {
    value: 'Pacific/Midway',
    label: 'Midway Island, American Samoa',
  },
  {
    value: 'America/Adak',
    label: 'Aleutian Islands',
  },
  {
    value: 'Pacific/Honolulu',
    label: 'Hawaii',
  },
  {
    value: 'Pacific/Marquesas',
    label: 'Marquesas Islands',
  },
  {
    value: 'America/Anchorage',
    label: 'Alaska',
  },
  {
    value: 'America/Tijuana',
    label: 'Baja California',
  },
  {
    value: 'America/Los_Angeles',
    label: 'Pacific Time (US and Canada)',
  },
  {
    value: 'America/Phoenix',
    label: 'Arizona',
  },
  {
    value: 'America/Chihuahua',
    label: 'Chihuahua, La Paz, Mazatlan',
  },
  {
    value: 'America/Denver',
    label: 'Mountain Time (US and Canada), Navajo Nation',
  },
  {
    value: 'America/Belize',
    label: 'Central America',
  },
  {
    value: 'America/Chicago',
    label: 'Central Time (US and Canada)',
  },
  {
    value: 'Pacific/Easter',
    label: 'Easter Island',
  },
  {
    value: 'America/Mexico_City',
    label: 'Guadalajara, Mexico City, Monterrey',
  },
  {
    value: 'America/Regina',
    label: 'Saskatchewan',
  },
  {
    value: 'America/Bogota',
    label: 'Bogota, Lima, Quito',
  },
  {
    value: 'America/Cancun',
    label: 'Chetumal',
  },
  {
    value: 'America/New_York',
    label: 'Eastern Time (US and Canada)',
  },
  {
    value: 'America/Port-au-Prince',
    label: 'Haiti',
  },
  {
    value: 'America/Havana',
    label: 'Havana',
  },
  {
    value: 'America/Indiana/Indianapolis',
    label: 'Indiana (East)',
  },
  {
    value: 'America/Asuncion',
    label: 'Asuncion',
  },
  {
    value: 'America/Halifax',
    label: 'Atlantic Time (Canada)',
  },
  {
    value: 'America/Caracas',
    label: 'Caracas',
  },
  {
    value: 'America/Cuiaba',
    label: 'Cuiaba',
  },
  {
    value: 'America/Manaus',
    label: 'Georgetown, La Paz, Manaus, San Juan',
  },
  {
    value: 'America/Santiago',
    label: 'Santiago',
  },
  {
    value: 'America/Grand_Turk',
    label: 'Turks and Caicos',
  },
  {
    value: 'America/St_Johns',
    label: 'Newfoundland',
  },
  {
    value: 'America/Fortaleza',
    label: 'Araguaina',
  },
  {
    value: 'America/Sao_Paulo',
    label: 'Brasilia',
  },
  {
    value: 'America/Cayenne',
    label: 'Cayenne, Fortaleza',
  },
  {
    value: 'America/Buenos_Aires',
    label: 'City of Buenos Aires',
  },
  {
    value: 'America/Godthab',
    label: 'Greenland',
  },
  {
    value: 'America/Montevideo',
    label: 'Montevideo',
  },
  {
    value: 'America/Miquelon',
    label: 'Saint Pierre and Miquelon',
  },
  {
    value: 'America/Bahia',
    label: 'Salvador',
  },
  {
    value: 'America/Noronha',
    label: 'Fernando de Noronha',
  },
  {
    value: 'Atlantic/Azores',
    label: 'Azores',
  },
  {
    value: 'Atlantic/Cape_Verde',
    label: 'Cabo Verde Islands',
  },
  {
    value: 'Europe/London',
    label: 'Dublin, Edinburgh, Lisbon, London',
  },
  {
    value: 'Africa/Monrovia',
    label: 'Monrovia, Reykjavik',
  },
  {
    value: 'Europe/Amsterdam',
    label: 'Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
  },
  {
    value: 'Europe/Belgrade',
    label: 'Belgrade, Bratislava, Budapest, Ljubljana, Prague',
  },
  {
    value: 'Europe/Brussels',
    label: 'Brussels, Copenhagen, Madrid, Paris',
  },
  {
    value: 'Europe/Warsaw',
    label: 'Sarajevo, Skopje, Warsaw, Zagreb',
  },
  {
    value: 'Africa/Algiers',
    label: 'West Central Africa',
  },
  {
    value: 'Africa/Casablanca',
    label: 'Casablanca',
  },
  {
    value: 'Africa/Windhoek',
    label: 'Windhoek',
  },
  {
    value: 'Asia/Amman',
    label: 'Amman',
  },
  {
    value: 'Europe/Athens',
    label: 'Athens, Bucharest',
  },
  {
    value: 'Asia/Beirut',
    label: 'Beirut',
  },
  {
    value: 'Africa/Cairo',
    label: 'Cairo',
  },
  {
    value: 'Asia/Damascus',
    label: 'Damascus',
  },
  {
    value: 'Asia/Gaza',
    label: 'Gaza, Hebron',
  },
  {
    value: 'Africa/Harare',
    label: 'Harare, Pretoria',
  },
  {
    value: 'Europe/Helsinki',
    label: 'Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
  },
  {
    value: 'Asia/Jerusalem',
    label: 'Jerusalem',
  },
  {
    value: 'Europe/Kaliningrad',
    label: 'Kaliningrad',
  },
  {
    value: 'Africa/Tripoli',
    label: 'Tripoli',
  },
  {
    value: 'Asia/Baghdad',
    label: 'Baghdad',
  },
  {
    value: 'Asia/Istanbul',
    label: 'Istanbul',
  },
  {
    value: 'Asia/Kuwait',
    label: 'Kuwait, Riyadh',
  },
  {
    value: 'Europe/Minsk',
    label: 'Minsk',
  },
  {
    value: 'Europe/Moscow',
    label: 'Moscow, St. Petersburg',
  },
  {
    value: 'Africa/Nairobi',
    label: 'Nairobi',
  },
  {
    value: 'Asia/Tehran',
    label: 'Tehran',
  },
  {
    value: 'Asia/Muscat',
    label: 'Abu Dhabi, Muscat',
  },
  {
    value: 'Europe/Astrakhan',
    label: 'Astrakhan, Ulyanovsk, Volgograd',
  },
  {
    value: 'Asia/Baku',
    label: 'Baku',
  },
  {
    value: 'Europe/Samara',
    label: 'Izhevsk, Samara',
  },
  {
    value: 'Indian/Mauritius',
    label: 'Port Louis',
  },
  {
    value: 'Asia/Tbilisi',
    label: 'Tbilisi',
  },
  {
    value: 'Asia/Yerevan',
    label: 'Yerevan',
  },
  {
    value: 'Asia/Kabul',
    label: 'Kabul',
  },
  {
    value: 'Asia/Tashkent',
    label: 'Tashkent, Ashgabat',
  },
  {
    value: 'Asia/Yekaterinburg',
    label: 'Ekaterinburg',
  },
  {
    value: 'Asia/Karachi',
    label: 'Islamabad, Karachi',
  },
  {
    value: 'Asia/Kolkata',
    label: 'Chennai, Kolkata, Mumbai, New Delhi',
  },
  {
    value: 'Asia/Colombo',
    label: 'Sri Jayawardenepura',
  },
  {
    value: 'Asia/Katmandu',
    label: 'Kathmandu',
  },
  {
    value: 'Asia/Almaty',
    label: 'Astana',
  },
  {
    value: 'Asia/Dhaka',
    label: 'Dhaka',
  },
  {
    value: 'Asia/Rangoon',
    label: 'Yangon (Rangoon)',
  },
  {
    value: 'Asia/Novosibirsk',
    label: 'Novosibirsk',
  },
  {
    value: 'Asia/Bangkok',
    label: 'Bangkok, Hanoi, Jakarta',
  },
  {
    value: 'Asia/Barnaul',
    label: 'Barnaul, Gorno-Altaysk',
  },
  {
    value: 'Asia/Hovd',
    label: 'Hovd',
  },
  {
    value: 'Asia/Krasnoyarsk',
    label: 'Krasnoyarsk',
  },
  {
    value: 'Asia/Tomsk',
    label: 'Tomsk',
  },
  {
    value: 'Asia/Chongqing',
    label: 'Beijing, Chongqing, Hong Kong SAR, Urumqi',
  },
  {
    value: 'Asia/Irkutsk',
    label: 'Irkutsk',
  },
  {
    value: 'Asia/Kuala_Lumpur',
    label: 'Kuala Lumpur, Singapore',
  },
  {
    value: 'Australia/Perth',
    label: 'Perth',
  },
  {
    value: 'Asia/Taipei',
    label: 'Taipei',
  },
  {
    value: 'Asia/Ulaanbaatar',
    label: 'Ulaanbaatar',
  },
  {
    value: 'Asia/Pyongyang',
    label: 'Pyongyang',
  },
  {
    value: 'Australia/Eucla',
    label: 'Eucla',
  },
  {
    value: 'Asia/Chita',
    label: 'Chita',
  },
  {
    value: 'Asia/Tokyo',
    label: 'Osaka, Sapporo, Tokyo',
  },
  {
    value: 'Asia/Seoul',
    label: 'Seoul',
  },
  {
    value: 'Asia/Yakutsk',
    label: 'Yakutsk',
  },
  {
    value: 'Australia/Adelaide',
    label: 'Adelaide',
  },
  {
    value: 'Australia/Darwin',
    label: 'Darwin',
  },
  {
    value: 'Australia/Brisbane',
    label: 'Brisbane',
  },
  {
    value: 'Australia/Canberra',
    label: 'Canberra, Melbourne, Sydney',
  },
  {
    value: 'Pacific/Guam',
    label: 'Guam, Port Moresby',
  },
  {
    value: 'Australia/Hobart',
    label: 'Hobart',
  },
  {
    value: 'Asia/Vladivostok',
    label: 'Vladivostok',
  },
  {
    value: 'Australia/Lord_Howe',
    label: 'Lord Howe Island',
  },
  {
    value: 'Pacific/Bougainville',
    label: 'Bougainville Island',
  },
  {
    value: 'Asia/Srednekolymsk',
    label: 'Chokurdakh',
  },
  {
    value: 'Asia/Magadan',
    label: 'Magadan',
  },
  {
    value: 'Pacific/Norfolk',
    label: 'Norfolk Island',
  },
  {
    value: 'Asia/Sakhalin',
    label: 'Sakhalin',
  },
  {
    value: 'Pacific/Guadalcanal',
    label: 'Solomon Islands, New Caledonia',
  },
  {
    value: 'Asia/Anadyr',
    label: 'Anadyr, Petropavlovsk-Kamchatsky',
  },
  {
    value: 'Pacific/Auckland',
    label: 'Auckland, Wellington',
  },
  {
    value: 'Pacific/Fiji',
    label: 'Fiji Islands',
  },
  {
    value: 'Pacific/Chatham',
    label: 'Chatham Islands',
  },
  {
    value: 'Pacific/Tongatapu',
    label: "Nuku'alofa",
  },
  {
    value: 'Pacific/Apia',
    label: 'Samoa',
  },
  {
    value: 'Pacific/Kiritimati',
    label: 'Kiritimati Island',
  },
  {
    value: 'Etc/UTC',
    label: 'Universal Time Coordinated',
  },
];

const timeZoneCurrentOffsetLabel = (timeZone: TimeZoneItem) => {
  const date = new Date();
  date.setMilliseconds(0);
  const userOffset = (date.getTimezoneOffset() / 60) * -1;

  const timeZoneDate = utcToZonedTime(date, timeZone.value);
  const localTimeZoneDate = new Date(timeZoneDate.toLocaleString('en-US'));

  const diffHrs =
    (localTimeZoneDate.getTime() - date.getTime()) / 1000 / 60 / 60;
  const timeZoneOffset = userOffset + diffHrs;
  const offset = timeZoneOffset >= 24 ? timeZoneOffset - 24 : timeZoneOffset;
  return {
    label: `(UTC ${timeZoneOffset > 0 ? '+' : ''}${offset}) ${timeZone.label}`,
    offset,
  };
};

export const getTimeZoneOptions = (): TimeZoneItem[] => {
  return TIME_ZONES.map((timeZone) => {
    const labelOffset = timeZoneCurrentOffsetLabel(timeZone);
    return { ...timeZone, ...labelOffset };
  }).sort((a, b) => a.offset - b.offset);
};

export const getUserDefaultTimezone = (): string => {
  const timeZoneOptions = getTimeZoneOptions();
  const timeZoneOffset = (new Date().getTimezoneOffset() / 60) * -1;
  const timezoneGuess = timeZoneOptions.find((timezone) =>
    timezone.label.startsWith(
      `(UTC ${timeZoneOffset > 0 ? '+' : ''}${timeZoneOffset})`,
    ),
  );

  if (timezoneGuess) {
    return timezoneGuess.value;
  }

  return 'Europe/London';
};

interface InitialTimezoneProps {
  userTimezone?: string;
  update?: boolean;
}

export const getUserInitialTimezone = ({
  userTimezone,
  update = false,
}: InitialTimezoneProps = {}): string => {
  if (userTimezone) {
    return userTimezone;
  }

  if (update) {
    return 'Europe/London';
  }

  return getUserDefaultTimezone();
};

export const getHourTimezone = (timeZone: string): number => {
  const now = new Date();

  return parseInt(
    now.toLocaleString('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone,
    }),
    10,
  );
};

export const getTimeZoneIcon = (timezone: string): FC<IconProps> => {
  const hour = getHourTimezone(timezone);

  return hour >= 6 && hour < 18 ? DaytimeIcon : NighttimeIcon;
};
