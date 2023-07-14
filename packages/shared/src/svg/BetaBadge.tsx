import React, { HTMLAttributes, ReactElement } from 'react';

export default function BetaBadge({
  className,
}: HTMLAttributes<SVGElement>): ReactElement {
  return (
    <svg
      className={className}
      width="40"
      height="16.216"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m40 0-3.243 16.216H0L3.243 0H40zM20.707 3.75H14.71l-1.603 9.223h6.011l.266-1.527h-4.155l.43-2.47h3.535l.266-1.489h-3.547L16.3 5.29h4.136l.272-1.539zm7.887 0h-7.298l-.272 1.54h2.705l-1.33 7.683h1.856l1.33-7.684h2.736l.273-1.539zm-21.1 0L5.89 12.973h3.541c1.077 0 1.927-.242 2.55-.725.623-.484.964-1.16 1.023-2.03.03-.473-.057-.884-.26-1.233a1.55 1.55 0 0 0-.855-.712c1.018-.43 1.556-1.113 1.615-2.046.051-.781-.192-1.387-.728-1.818-.536-.431-1.339-.648-2.407-.653L7.493 3.75zm24.438 0h-1.717l-4.928 9.223h2.046l.95-1.9h3.218l.292 1.9h1.894L31.932 3.75zM8.45 8.957l1.748.006c.384.017.658.132.82.345.163.214.214.51.155.89-.059.385-.242.69-.55.916-.309.226-.691.339-1.147.339l-1.464-.007.438-2.49zM30.747 6.1l.52 3.433h-2.224L30.747 6.1zM9.083 5.29l1.368.006c.887.004 1.278.378 1.172 1.12-.059.377-.237.67-.535.881-.298.211-.681.321-1.15.33l-1.26-.013.405-2.325z"
        fill="#FFF"
        fillRule="evenodd"
      />
    </svg>
  );
}
