import * as React from "react"

/**
 * Lumen brand mark — an "L" monogram with a light spark.
 * Lucide-compatible: renders in `currentColor`, accepts `className` and any
 * SVG props, so it can drop into any logo slot (sidebar, navbar, login, etc.).
 */
export const LumenMark = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Lumen"
    className={className}
    {...props}
  >
    <path d="M8 5v12h8" />
    <circle cx="16.5" cy="6" r="1.75" fill="currentColor" stroke="none" />
  </svg>
))

LumenMark.displayName = "LumenMark"

export default LumenMark
