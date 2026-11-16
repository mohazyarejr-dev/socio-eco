import { Link } from "@tanstack/react-router";

export const BRAND_NAME = "Youth Health Matters";
export const BRAND_TAGLINE = "Healthy Youth • Stronger Communities";

/** Logo: a young person held in two open hands. */
export function BrandLogo({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <circle cx="24" cy="12" r="5.5" fill="currentColor" />
      <path
        d="M14.5 27c1.6-4.2 5-6.2 9.5-6.2s7.9 2 9.5 6.2"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M5 29c4.2-.2 7.2 1.6 10.4 4.6 2.2 2 4.2 3 8.6 3s6.4-1 8.6-3C35.8 30.6 38.8 28.8 43 29c-.9 8-8.1 14-19 14S5.9 37 5 29Z"
        fill="currentColor"
        opacity=".9"
      />
    </svg>
  );
}

export function BrandMark({
  className = "",
  tone = "dark",
  compact = false,
}: {
  className?: string;
  tone?: "dark" | "light";
  /** Hide the tagline (tight spaces such as the phone admin bar). */
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-3 ${className}`}
      aria-label={`${BRAND_NAME} — home`}
    >
      <BrandLogo className={`size-10 ${tone === "dark" ? "text-white" : "text-navy"}`} />
      <span className="leading-tight">
        <span
          className={`block text-[17px] font-extrabold tracking-tight ${
            tone === "dark" ? "text-white" : "text-navy"
          }`}
        >
          {BRAND_NAME}
        </span>
        {compact ? null : (
          <span
            className={`block text-[11px] font-medium ${
              tone === "dark" ? "text-white/70" : "text-muted-foreground"
            }`}
          >
            {BRAND_TAGLINE}
          </span>
        )}
      </span>
    </Link>
  );
}
