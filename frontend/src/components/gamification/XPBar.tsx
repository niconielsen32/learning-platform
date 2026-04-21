interface Props {
  current: number;
  total: number;
}

export function XPBar({ current, total }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-owl-mist">
      <div
        className="h-full rounded-full bg-owl-green transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
