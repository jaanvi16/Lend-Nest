export function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Location pin shape as the outer form */}
      <path
        d="M24 2C14.6 2 7 9.6 7 19c0 12 17 27 17 27s17-15 17-27c0-9.4-7.6-17-17-17z"
        fill="#111111"
      />
      {/* Inner yellow pin circle */}
      <circle cx="24" cy="19" r="12" fill="#FFC800" />
      {/* Book icon inside the pin */}
      <g transform="translate(15, 12)">
        <rect x="0" y="2" width="8" height="12" rx="1" fill="#111111" />
        <rect x="10" y="2" width="8" height="12" rx="1" fill="#111111" />
        <rect x="8" y="1" width="2" height="14" fill="#FFC800" />
      </g>
    </svg>
  );
}