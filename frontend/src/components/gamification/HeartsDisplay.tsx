import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  current: number;
  max: number;
}

export function HeartsDisplay({ current, max }: Props) {
  return (
    <div className="pill text-owl-red">
      <Heart size={18} fill="currentColor" />
      <span>{current}</span>
      <span className="text-owl-mist">/{max}</span>
    </div>
  );
}

export function HeartsRow({ current, max }: Props) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Heart
          key={i}
          size={20}
          className={cn(i < current ? "text-owl-red" : "text-owl-mist")}
          fill={i < current ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}
