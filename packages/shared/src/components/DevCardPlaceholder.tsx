import React, { ReactElement } from 'react';

export default function DevCardPlaceholder({
  profileImage,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  profileImage?: string;
}): ReactElement {
  return (
    <svg
      width="126"
      height="183"
      viewBox="0 0 126 183"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <g filter="url(#filter0_i_4070_3873)">
        <path
          d="M0.587402 25.92C0.587402 16.6571 0.587402 12.0256 2.44715 8.51312C3.94795 5.6786 6.266 3.36055 9.10052 1.85975C12.613 0 17.2445 0 26.5074 0H99.4927C108.756 0 113.387 0 116.9 1.85975C119.734 3.36055 122.052 5.6786 123.553 8.51312C125.413 12.0256 125.413 16.6571 125.413 25.92V157.08C125.413 166.343 125.413 170.974 123.553 174.487C122.052 177.321 119.734 179.639 116.9 181.14C113.387 183 108.756 183 99.4927 183H26.5074C17.2445 183 12.613 183 9.10052 181.14C6.266 179.639 3.94795 177.321 2.44715 174.487C0.587402 170.974 0.587402 166.343 0.587402 157.08V25.92Z"
          fill="url(#paint0_linear_4070_3873)"
        />
      </g>
      <path
        d="M1.0874 25.92C1.0874 21.28 1.08782 17.8311 1.3181 15.1022C1.54787 12.3794 2.00378 10.419 2.88903 8.74709C4.34294 6.00114 6.58855 3.75553 9.33449 2.30163C11.0064 1.41638 12.9668 0.960463 15.6896 0.730698C18.4185 0.500415 21.8674 0.5 26.5074 0.5H99.4927C104.133 0.5 107.582 0.500415 110.31 0.730698C113.033 0.960463 114.994 1.41638 116.666 2.30163C119.412 3.75553 121.657 6.00115 123.111 8.74709C123.996 10.419 124.452 12.3794 124.682 15.1022C124.912 17.8311 124.913 21.28 124.913 25.92V157.08C124.913 161.72 124.912 165.169 124.682 167.898C124.452 170.621 123.996 172.581 123.111 174.253C121.657 176.999 119.412 179.244 116.666 180.698C114.994 181.584 113.033 182.04 110.31 182.269C107.582 182.5 104.133 182.5 99.4927 182.5H26.5074C21.8674 182.5 18.4185 182.5 15.6896 182.269C12.9668 182.04 11.0064 181.584 9.33449 180.698C6.58855 179.244 4.34294 176.999 2.88903 174.253C2.00378 172.581 1.54787 170.621 1.3181 167.898C1.08782 165.169 1.0874 161.72 1.0874 157.08V25.92Z"
        stroke="url(#paint1_linear_4070_3873)"
      />
      <g clipPath="url(#clip0_4070_3873)">
        <mask
          id="mask0_4070_3873"
          style={{ maskType: 'alpha' }}
          maskUnits="userSpaceOnUse"
          x="10"
          y="11"
          width="53"
          height="53"
        >
          <path
            d="M10 26.9C10 18.1187 17.1187 11 25.9 11H47.1C55.8813 11 63 18.1187 63 26.9V48.1C63 56.8813 55.8813 64 47.1 64H25.9C17.1187 64 10 56.8813 10 48.1V26.9Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_4070_3873)">
          <rect x="10" y="11" width="53" height="53" fill="url(#pattern0)" />
        </g>
      </g>
      {profileImage && (
        <rect
          x="11.5"
          y="12.5"
          width="50"
          height="50"
          rx="11.5"
          stroke="white"
          strokeWidth="3"
        />
      )}
      <path
        d="M121.945 163.738H90.3536C81.8426 163.738 74.9431 170.637 74.9431 179.148H106.535C115.046 179.148 121.945 172.249 121.945 163.738Z"
        fill="#0E1217"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M95.2121 170.441V172.51H96.3487L96.5896 173.2H95.2121C94.8324 173.2 94.5247 172.891 94.5247 172.51V170.441C94.5247 170.06 94.8324 169.751 95.2121 169.751H96.3487V170.441H96.5896V169.061C96.5896 168.871 96.7437 168.716 96.9338 168.716H97.2779V172.855C97.2779 173.045 97.1238 173.2 96.9338 173.2H96.5896V170.441H95.2121ZM98.6536 173.2C98.274 173.2 97.9662 172.891 97.9662 172.51V171.82C97.9662 171.439 98.274 171.131 98.6536 171.131H99.7903V171.82H100.031V170.441H98.1381L98.1381 170.096C98.1381 169.906 98.292 169.751 98.4818 169.751H100.031C100.411 169.751 100.72 170.06 100.72 170.441V172.855C100.72 173.045 100.565 173.2 100.375 173.2H100.031V171.82H98.6536V172.51H99.7903L100.031 173.2C99.1826 173.2 98.7235 173.2 98.6536 173.2ZM101.408 173.2V170.096C101.408 169.906 101.562 169.751 101.752 169.751H102.095V172.855C102.095 173.045 101.941 173.2 101.752 173.2H101.408ZM102.095 169.064C102.095 169.16 102.062 169.241 101.996 169.307C101.93 169.373 101.85 169.406 101.754 169.406C101.658 169.406 101.576 169.373 101.509 169.307C101.442 169.241 101.408 169.16 101.408 169.064C101.408 168.964 101.442 168.882 101.509 168.816C101.576 168.75 101.658 168.716 101.754 168.716C101.85 168.716 101.93 168.75 101.996 168.816C102.062 168.882 102.095 168.964 102.095 169.064ZM102.784 173.2V169.061C102.784 168.871 102.938 168.716 103.128 168.716H103.472V172.855C103.472 173.045 103.318 173.2 103.128 173.2H102.784ZM105.104 173.201L104.176 170.283C104.12 170.1 104.225 169.908 104.407 169.852L104.734 169.751L105.491 172.23L106.172 169.995C106.228 169.813 106.417 169.711 106.599 169.766L106.914 169.867L105.745 173.746C105.657 174.036 105.39 174.234 105.088 174.234L104.52 174.235C104.33 174.235 104.176 174.08 104.176 173.89L104.176 173.545H104.747C104.937 173.545 105.103 173.391 105.104 173.201Z"
        fill="white"
      />
      <path
        d="M108.036 173.245V172.757H107.536V173.245H108.036ZM109.531 173.277C109.773 173.277 109.979 173.216 110.147 173.094C110.315 172.973 110.432 172.811 110.499 172.607V173.245H110.913V169.874H110.499V171.382C110.432 171.179 110.315 171.016 110.147 170.895C109.979 170.773 109.773 170.712 109.531 170.712C109.31 170.712 109.113 170.764 108.94 170.867C108.767 170.971 108.632 171.119 108.533 171.314C108.435 171.508 108.386 171.736 108.386 171.997C108.386 172.258 108.435 172.485 108.533 172.678C108.632 172.871 108.767 173.019 108.94 173.122C109.113 173.225 109.31 173.277 109.531 173.277ZM109.649 172.912C109.395 172.912 109.191 172.831 109.038 172.669C108.885 172.506 108.808 172.282 108.808 171.997C108.808 171.711 108.885 171.487 109.038 171.325C109.191 171.163 109.395 171.081 109.649 171.081C109.813 171.081 109.959 171.119 110.088 171.193C110.217 171.267 110.317 171.374 110.39 171.514C110.463 171.654 110.499 171.815 110.499 171.997C110.499 172.179 110.463 172.339 110.39 172.477C110.317 172.615 110.217 172.723 110.088 172.798C109.959 172.874 109.813 172.912 109.649 172.912ZM112.676 173.277C112.885 173.277 113.073 173.239 113.24 173.163C113.406 173.087 113.542 172.981 113.647 172.844C113.751 172.707 113.819 172.552 113.849 172.379H113.408C113.378 172.549 113.295 172.685 113.16 172.787C113.025 172.889 112.858 172.94 112.658 172.94C112.437 172.94 112.25 172.868 112.097 172.726C111.944 172.583 111.863 172.369 111.854 172.083H113.849C113.861 172.02 113.867 171.944 113.867 171.856C113.867 171.646 113.819 171.455 113.724 171.282C113.628 171.109 113.491 170.971 113.31 170.867C113.13 170.764 112.919 170.712 112.676 170.712C112.437 170.712 112.225 170.764 112.04 170.867C111.855 170.971 111.71 171.119 111.606 171.314C111.501 171.508 111.449 171.736 111.449 171.997C111.449 172.258 111.501 172.485 111.606 172.678C111.71 172.871 111.855 173.019 112.04 173.122C112.225 173.225 112.437 173.277 112.676 173.277ZM113.449 171.883H111.854C111.866 171.61 111.949 171.402 112.104 171.261C112.258 171.12 112.449 171.049 112.676 171.049C112.819 171.049 112.95 171.08 113.072 171.141C113.193 171.201 113.288 171.294 113.358 171.418C113.428 171.543 113.458 171.698 113.449 171.883ZM115.617 173.245L116.594 170.744H116.149L115.376 172.803L114.594 170.744H114.149L115.126 173.245H115.617Z"
        fill="#A8B3CF"
        fillOpacity="0.64"
      />
      <path
        d="M90.9497 171.413L89.734 170.195L90.3415 168.977L92.3168 170.956C92.5685 171.209 92.5685 171.617 92.3168 171.87L89.8856 174.306C89.6339 174.558 89.2258 174.558 88.9742 174.306C88.7225 174.054 88.7225 173.645 88.9742 173.393L90.9497 171.413Z"
        fill="#A8B3CF"
        fillOpacity="0.64"
      />
      <path
        d="M88.9746 168.55C89.2263 168.298 89.6345 168.298 89.8862 168.55L90.342 169.007L85.024 174.336C84.7723 174.588 84.3641 174.588 84.1125 174.336L83.6566 173.879L88.9746 168.55ZM86.6954 170.225L85.7838 171.139L84.5681 169.92L83.0485 171.443L84.2642 172.661L83.6566 173.879L81.6813 171.9C81.4296 171.648 81.4296 171.239 81.6813 170.986L84.1125 168.55C84.3641 168.298 84.7723 168.298 85.024 168.55L86.6954 170.225Z"
        fill="white"
      />

      <defs>
        <filter
          id="filter0_i_4070_3873"
          x="0.587402"
          y="0"
          width="124.825"
          height="187"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_4070_3873"
          />
        </filter>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_4070_3873" transform="scale(0.00217391)" />
        </pattern>
        <linearGradient
          id="paint0_linear_4070_3873"
          x1="0.587402"
          y1="0"
          x2="170.817"
          y2="116.86"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F3796C" />
          <stop offset="0.241554" stopColor="#FE7AB6" />
          <stop offset="0.4" stopColor="#FFB760" />
          <stop offset="0.713254" stopColor="#FE7AB6" />
          <stop offset="1" stopColor="#F3796C" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_4070_3873"
          x1="63"
          y1="0"
          x2="63"
          y2="156.313"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.53" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <clipPath id="clip0_4070_3873">
          <rect x="10" y="11" width="53" height="53" rx="13" fill="white" />
        </clipPath>
        <image
          id="image0_4070_3873"
          width="460"
          height="460"
          xlinkHref={profileImage}
        />
      </defs>
    </svg>
  );
}
