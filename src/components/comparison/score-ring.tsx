/**
 * Circular score gauge (0–100). Renders at its final value with a CSS
 * transition for enhancement — never depends on JS/RAF to display correctly.
 */
export function ScoreRing({
  value,
  color,
  size = 96,
  label,
}: {
  value: number;
  color: string;
  size?: number;
  label?: string;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span
          className="font-display text-2xl font-extrabold"
          style={{ color }}
        >
          {value}
        </span>
        {label && (
          <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
