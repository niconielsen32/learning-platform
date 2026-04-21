import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
function shuffle(arr) {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
export function MatchPairs({ exercise, onAnswerChange, disabled }) {
    const pairs = exercise.payload.pairs ?? [];
    const lefts = useMemo(() => pairs.map((p) => p.left), [pairs]);
    const rights = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs]);
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [matches, setMatches] = useState({});
    useEffect(() => {
        const allMatched = lefts.every((l) => matches[l]);
        onAnswerChange(allMatched
            ? { matches: lefts.map((l) => ({ left: l, right: matches[l] })) }
            : null);
    }, [matches, lefts, onAnswerChange]);
    const tryMatch = (right) => {
        if (disabled)
            return;
        if (!selectedLeft)
            return;
        setMatches((m) => ({ ...m, [selectedLeft]: right }));
        setSelectedLeft(null);
    };
    const usedRights = new Set(Object.values(matches));
    return (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("div", { className: "space-y-2", children: lefts.map((l) => (_jsxs("button", { type: "button", disabled: disabled, onClick: () => setSelectedLeft(l), className: cn("w-full rounded-xl border-2 px-3 py-3 font-bold transition", matches[l]
                        ? "border-owl-green bg-owl-green/10 text-owl-green-dark"
                        : selectedLeft === l
                            ? "border-owl-blue bg-owl-blue/10"
                            : "border-owl-mist bg-white"), children: [l, matches[l] && _jsxs("span", { className: "block text-xs opacity-70", children: ["\u2192 ", matches[l]] })] }, l))) }), _jsx("div", { className: "space-y-2", children: rights.map((r) => (_jsx("button", { type: "button", disabled: disabled || usedRights.has(r), onClick: () => tryMatch(r), className: cn("w-full rounded-xl border-2 px-3 py-3 font-bold transition", usedRights.has(r)
                        ? "border-owl-mist bg-owl-mist/40 text-slate-400"
                        : "border-owl-mist bg-white hover:border-owl-blue/40"), children: r }, r))) })] }));
}
