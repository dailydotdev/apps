const TIME_ZONES = [
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

const timeZoneCurrentOffsetLabel = (timeZone: string) => {
  return `(UTC) ${timeZone}`;
};

export const getTimeZoneOptions = (): { value: string; label: string }[] => {
  return TIME_ZONES.map((timezone) => {
    return { ...timezone, label: timeZoneCurrentOffsetLabel(timezone.label) };
  });
};
