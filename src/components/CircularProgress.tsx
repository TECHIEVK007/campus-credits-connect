interface CircularProgressProps {
  current: number;
  max: number;
}

const CircularProgress = ({ current, max }: CircularProgressProps) => {
  const radius = 90;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const ratio = Math.max(0, Math.min(1, current / max));
  const strokeDashoffset = circumference - ratio * circumference;

  const color =
    ratio > 0.6 ? "hsl(var(--success))" : ratio > 0.3 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.6s ease" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground">{current}</span>
        <span className="text-sm text-muted-foreground">/ {max}</span>
        <span className="text-xs text-muted-foreground mt-1">Credits</span>
      </div>
    </div>
  );
};

export default CircularProgress;
