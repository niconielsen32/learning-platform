import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
export function HeartsDisplay({ current, max }) {
    return (_jsxs("div", { className: "pill text-owl-red", children: [_jsx(Heart, { size: 18, fill: "currentColor" }), _jsx("span", { children: current }), _jsxs("span", { className: "text-owl-mist", children: ["/", max] })] }));
}
export function HeartsRow({ current, max }) {
    return (_jsx("div", { className: "flex gap-1", children: Array.from({ length: max }).map((_, i) => (_jsx(Heart, { size: 20, className: cn(i < current ? "text-owl-red" : "text-owl-mist"), fill: i < current ? "currentColor" : "none" }, i))) }));
}
