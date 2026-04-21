import { Flame } from "lucide-react";

interface Props {
  count: number;
}

export function StreakBadge({ count }: Props) {
  const active = count > 0;
  return (
    <div className="pill" style={{ color: active ? "#FF8800" : "#A0A0A0" }}>
      <Flame size={18} fill={active ? "currentColor" : "none"} />
      <span>{count}</span>
    </div>
  );
}
