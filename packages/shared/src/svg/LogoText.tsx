import React, { ReactElement } from 'react';

interface LogoTextProps {
  isPlus?: Date;
  className?: {
    container?: string;
    group?: string;
  };
}

export default function LogoText({
  isPlus = false,
  className,
}: LogoTextProps): ReactElement {
  return (
    <svg
      viewBox="0 0 77 20"
      xmlns="http://www.w3.org/2000/svg"
      className={className?.container}
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M2.15093 7.22871V13.7036H5.7075L6.46132 15.8618H2.15093C0.963005 15.8618 0 14.8955 0 13.7036V7.22871C0 6.03673 0.963005 5.07043 2.15093 5.07043H5.7075V7.22871H6.46132V2.91215C6.46132 2.31616 6.94346 1.83301 7.53821 1.83301H8.61509V14.7827C8.61509 15.3787 8.13296 15.8618 7.53821 15.8618H6.46132V7.22871H2.15093ZM12.9198 15.8619C11.7319 15.8619 10.7689 14.8956 10.7689 13.7036V11.5453C10.7689 10.3533 11.7319 9.387 12.9198 9.387H16.4764V11.5453H17.2302V7.22871H11.3066L11.3066 6.14957C11.3066 5.55358 11.7881 5.07043 12.3821 5.07043H17.2302C18.4197 5.07043 19.384 6.03673 19.384 7.22871V14.7827C19.384 15.3787 18.9018 15.8619 18.3071 15.8619H17.2302V11.5453H12.9198V13.7036H16.4764L17.2302 15.8619C14.575 15.8619 13.1382 15.8619 12.9198 15.8619ZM21.5377 15.8618V6.14957C21.5377 5.55358 22.0192 5.07043 22.6132 5.07043H23.6887V14.7827C23.6887 15.3787 23.2072 15.8618 22.6132 15.8618H21.5377ZM23.6887 2.9192C23.6887 3.22014 23.5856 3.47405 23.3794 3.68095C23.1732 3.88784 22.9201 3.99129 22.6202 3.99129C22.3203 3.99129 22.0649 3.88784 21.854 3.68095C21.6432 3.47405 21.5377 3.22014 21.5377 2.9192C21.5377 2.60886 21.6432 2.35024 21.854 2.14335C22.0649 1.93645 22.3203 1.83301 22.6202 1.83301C22.9201 1.83301 23.1732 1.93645 23.3794 2.14335C23.5856 2.35024 23.6887 2.60886 23.6887 2.9192ZM25.8453 15.8618V2.91215C25.8453 2.31616 26.3268 1.83301 26.9207 1.83301H27.9962V14.7827C27.9962 15.3787 27.5147 15.8618 26.9207 15.8618H25.8453ZM33.1033 15.8662L30.1994 6.73344C30.0258 6.16349 30.353 5.56019 30.921 5.38594L31.944 5.07043L34.3132 12.8267L36.4454 5.83435C36.619 5.2644 37.2127 4.94362 37.7807 5.11787L38.7679 5.43338L35.1101 17.5716C34.8336 18.479 33.9988 19.0988 33.0532 19.0989L31.2751 19.0993C30.6811 19.0993 30.1995 18.6163 30.1994 18.0203L30.1996 16.941H31.9871C32.5794 16.941 33.101 16.4605 33.1033 15.8662Z"
          fill="var(--theme-text-primary)"
          className={className?.group}
        />
        <path
          d="M42.2753 16.0022V14.4773H40.7109V16.0022H42.2753ZM46.9543 16.1019C47.7128 16.1019 48.3551 15.9119 48.8813 15.5319C49.4075 15.1518 49.7749 14.6435 49.9835 14.007V16.0022H51.2777V5.45605H49.9835V10.1733C49.7749 9.53674 49.4075 9.02844 48.8813 8.64839C48.3551 8.26835 47.7128 8.07833 46.9543 8.07833C46.2622 8.07833 45.6459 8.23985 45.1055 8.56289C44.565 8.88592 44.1407 9.35147 43.8326 9.95953C43.5245 10.5676 43.3704 11.2802 43.3704 12.0973C43.3704 12.9143 43.5245 13.6245 43.8326 14.2279C44.1407 14.8312 44.565 15.2944 45.1055 15.6174C45.6459 15.9404 46.2622 16.1019 46.9543 16.1019ZM47.324 14.9618C46.5276 14.9618 45.89 14.7077 45.4112 14.1994C44.9324 13.6911 44.693 12.9904 44.693 12.0973C44.693 11.2042 44.9324 10.5035 45.4112 9.99516C45.89 9.48686 46.5276 9.23271 47.324 9.23271C47.836 9.23271 48.2935 9.34909 48.6964 9.58187C49.0994 9.81464 49.4146 10.1496 49.6422 10.5866C49.8697 11.0236 49.9835 11.5272 49.9835 12.0973C49.9835 12.6673 49.8697 13.1685 49.6422 13.6008C49.4146 14.0331 49.0994 14.368 48.6964 14.6055C48.2935 14.8431 47.836 14.9618 47.324 14.9618ZM56.7957 16.1019C57.4499 16.1019 58.0378 15.9832 58.5592 15.7457C59.0807 15.5081 59.505 15.1756 59.8321 14.748C60.1592 14.3205 60.3701 13.8359 60.4649 13.2944H59.0854C58.9906 13.8264 58.7323 14.2516 58.3103 14.5699C57.8884 14.8882 57.3646 15.0473 56.7388 15.0473C56.0467 15.0473 55.4613 14.8241 54.9825 14.3775C54.5037 13.931 54.25 13.2611 54.2216 12.368H60.4649C60.5029 12.1685 60.5218 11.931 60.5218 11.6555C60.5218 10.9999 60.3725 10.4013 60.0738 9.85977C59.7752 9.31822 59.3438 8.88592 58.7797 8.56289C58.2155 8.23985 57.5542 8.07833 56.7957 8.07833C56.0467 8.07833 55.383 8.23985 54.8047 8.56289C54.2263 8.88592 53.7736 9.35147 53.4465 9.95953C53.1194 10.5676 52.9559 11.2802 52.9559 12.0973C52.9559 12.9143 53.1194 13.6245 53.4465 14.2279C53.7736 14.8312 54.2263 15.2944 54.8047 15.6174C55.383 15.9404 56.0467 16.1019 56.7957 16.1019ZM59.2134 11.741H54.2216C54.2595 10.8859 54.5202 10.2374 55.0038 9.79564C55.4873 9.35384 56.0846 9.13295 56.7957 9.13295C57.2413 9.13295 57.6538 9.22796 58.033 9.41798C58.4123 9.608 58.7109 9.89778 58.929 10.2873C59.1471 10.6769 59.2419 11.1614 59.2134 11.741ZM65.9972 16.0022L69.0549 8.17809H67.6611L65.2434 14.6198L62.7973 8.17809H61.4036L64.4612 16.0022H65.9972Z"
          fillOpacity={0.64}
          fill="var(--theme-text-primary)"
          fillRule="nonzero"
          className={className?.group}
        />

        {isPlus && (
          <path
            d="M70.1166 4.81076C70.9941 5.23684 71.7066 5.94936 72.1327 6.82677C72.5587 5.94936 73.2713 5.23684 74.1487 4.81076C73.2713 4.38468 72.5587 3.67215 72.1327 2.79475C71.7066 3.67215 70.9941 4.38468 70.1166 4.81076ZM72.1327 0.901064L71.6982 0.900757C71.6969 2.81971 70.1416 4.37499 68.2227 4.37635L68.223 4.81076L68.2227 5.24517C70.1416 5.24652 71.6969 6.8018 71.6982 8.72076L72.1327 8.72045L72.5671 8.72076C72.5684 6.8018 74.1237 5.24652 76.0427 5.24517L76.0423 4.81076L76.0427 4.37635C74.1237 4.37499 72.5684 2.81971 72.5671 0.900757L72.1327 0.901064Z"
            fill="var(--theme-accent-bacon-default)"
          />
        )}
      </g>
    </svg>
  );
}
