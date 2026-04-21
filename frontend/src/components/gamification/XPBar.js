import { jsx as _jsx } from "react/jsx-runtime";
export function XPBar({ current, total }) {
    const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    return (_jsx("div", { className: "h-4 w-full overflow-hidden rounded-full bg-owl-mist", children: _jsx("div", { className: "h-full rounded-full bg-owl-green transition-all duration-300", style: { width: `${pct}%` } }) }));
}
