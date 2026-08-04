interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />

      <circle cx="12" cy="12" r="2" fill="currentColor" />

      <line
        x1="12"
        y1="1"
        x2="12"
        y2="4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <line
        x1="19.06"
        y1="4.94"
        x2="17.12"
        y2="6.88"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <line
        x1="23"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <line
        x1="19.06"
        y1="19.06"
        x2="17.12"
        y2="17.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <line
        x1="12"
        y1="23"
        x2="12"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <line
        x1="4.94"
        y1="19.06"
        x2="6.88"
        y2="17.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <line
        x1="1"
        y1="12"
        x2="4"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <line
        x1="4.94"
        y1="4.94"
        x2="6.88"
        y2="6.88"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
