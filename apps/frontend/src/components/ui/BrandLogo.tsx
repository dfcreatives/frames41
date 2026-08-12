interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'auto'
  className?: string
  height?: number | string
}

/**
 * Official Frames41 Vector Logo component matching brand assets:
 * Bold "FRAMES41" + "9750443424" phone number + "BY JK FOTOZ" solid boxed badge.
 */
export default function BrandLogo({
  variant = 'auto',
  className = '',
  height = 42,
}: BrandLogoProps) {
  // Color configuration:
  // light: Black text & Black badge with White inner text (for light backgrounds)
  // dark: White text & White badge with Black inner text (for dark backgrounds)
  // auto: Uses currentColor
  const isDark = variant === 'dark'
  
  const mainColor = isDark ? '#FFFFFF' : variant === 'light' ? '#000000' : 'currentColor'
  const badgeBgColor = isDark ? '#FFFFFF' : variant === 'light' ? '#000000' : 'currentColor'
  const badgeTextColor = isDark ? '#000000' : '#FFFFFF'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 340 100"
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: 'auto' }}
      className={`inline-block select-none ${className}`}
      aria-label="FRAMES41 BY JK FOTOZ"
      role="img"
    >
      {/* Main Logotype: FRAMES41 */}
      <text
        x="0"
        y="58"
        fill={mainColor}
        fontFamily='Impact, "Arial Black", "Trebuchet MS", sans-serif'
        fontWeight="900"
        fontSize="68"
        letterSpacing="-1"
      >
        FRAMES41
      </text>

      {/* Phone Number: 9 7 5 0 4 4 3 4 2 4 */}
      <text
        x="2"
        y="92"
        fill={mainColor}
        fontFamily='"Trebuchet MS", "Arial", sans-serif'
        fontWeight="800"
        fontSize="22"
        letterSpacing="4.5"
      >
        9750443424
      </text>

      {/* Solid Badge Rectangle for BY JK FOTOZ */}
      <rect
        x="184"
        y="71"
        width="156"
        height="26"
        fill={badgeBgColor}
        rx="1"
      />

      {/* Inner Badge Text: BY JK FOTOZ */}
      <text
        x="262"
        y="90"
        fill={badgeTextColor}
        fontFamily='"Arial Black", "Impact", sans-serif'
        fontWeight="900"
        fontSize="17"
        letterSpacing="1.2"
        textAnchor="middle"
      >
        BY JK FOTOZ
      </text>
    </svg>
  )
}
