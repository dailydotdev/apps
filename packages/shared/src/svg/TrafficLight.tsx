import React, { ReactElement } from 'react';

export default function TrafficLight(): ReactElement {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 pointer-events-none icon"
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Group-7" transform="translate(6.25, 2.25)">
          <g id="Group-6" transform="translate(3.75, 2.75)">
            <circle id="Oval" fill="#39E58C" cx="2" cy="12" r="2" />
            <circle id="Oval" fill="#FF8E3B" cx="2" cy="7" r="2" />
            <circle id="Oval" fill="#E04337" cx="2" cy="2" r="2" />
          </g>
          <path
            d="M5.75,0 C8.92563731,0 11.5,2.57436269 11.5,5.75 L11.5,13.75 C11.5,16.9256373 8.92563731,19.5 5.75,19.5 C2.57436269,19.5 0,16.9256373 0,13.75 L0,5.75 C0,2.57436269 2.57436269,0 5.75,0 Z M5.75,1.5 C3.40278981,1.5 1.5,3.40278981 1.5,5.75 L1.5,13.75 C1.5,16.0972102 3.40278981,18 5.75,18 C8.09721019,18 10,16.0972102 10,13.75 L10,5.75 C10,3.40278981 8.09721019,1.5 5.75,1.5 Z"
            fill="#A8B3CF"
            fillRule="nonzero"
          />
        </g>
      </g>
    </svg>
  );
}
