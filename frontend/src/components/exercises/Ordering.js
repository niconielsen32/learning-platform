import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
export function Ordering({ exercise, onAnswerChange, disabled }) {
    const items = exercise.payload.items ?? [];
    const [order, setOrder] = useState(items.map((_, i) => i));
    useEffect(() => {
        onAnswerChange({ order });
    }, [order, onAnswerChange]);
    const move = (idx, dir) => {
        if (disabled)
            return;
        const target = idx + dir;
        if (target < 0 || target >= order.length)
            return;
        const next = [...order];
        [next[idx], next[target]] = [next[target], next[idx]];
        setOrder(next);
    };
    return (_jsx("ol", { className: "space-y-2", children: order.map((itemIdx, posIdx) => (_jsxs("li", { className: "flex items-center gap-2 rounded-xl border-2 border-owl-mist bg-white px-4 py-3 font-bold", children: [_jsxs("span", { className: "w-6 text-center text-sm opacity-60", children: [posIdx + 1, "."] }), _jsx("span", { className: "flex-1", children: items[itemIdx] }), _jsx("button", { type: "button", disabled: disabled || posIdx === 0, onClick: () => move(posIdx, -1), className: "rounded p-1 hover:bg-owl-mist disabled:opacity-30", children: _jsx(ChevronUp, { size: 18 }) }), _jsx("button", { type: "button", disabled: disabled || posIdx === order.length - 1, onClick: () => move(posIdx, 1), className: "rounded p-1 hover:bg-owl-mist disabled:opacity-30", children: _jsx(ChevronDown, { size: 18 }) })] }, itemIdx))) }));
}
