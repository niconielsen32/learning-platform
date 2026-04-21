import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flame } from "lucide-react";
export function StreakBadge({ count }) {
    const active = count > 0;
    return (_jsxs("div", { className: "pill", style: { color: active ? "#FF8800" : "#A0A0A0" }, children: [_jsx(Flame, { size: 18, fill: active ? "currentColor" : "none" }), _jsx("span", { children: count })] }));
}
