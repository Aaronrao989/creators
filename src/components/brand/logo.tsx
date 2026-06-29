import { cn } from "@/lib/utils";

/**
 * Creators Arena wordmark — inline SVG so it inherits `currentColor` and works on
 * navy, light and dark surfaces (the supplied PNG logo is navy-on-white only).
 */
export function Logo({
  className,
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9 shrink-0"
        fill="none"
        aria-hidden
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="2.6 2.4"
        />
        <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M30 18.5a8.5 8.5 0 1 0 0 11"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {showWord && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.15rem] font-extrabold tracking-[0.12em]">
            CREATORS
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[0.6rem] font-semibold tracking-[0.45em] opacity-70">
            <span className="h-px w-3 bg-current" />
            ARENA
            <span className="h-px w-3 bg-current" />
          </span>
        </span>
      )}
    </span>
  );
}
