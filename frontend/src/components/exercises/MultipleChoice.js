import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "@/lib/utils";
export function MultipleChoice({ exercise, onAnswerChange, disabled }) {
    const options = exercise.payload.options ?? [];
    const [selected, setSelected] = useState(null);
    const choose = (idx) => {
        if (disabled)
            return;
        setSelected(idx);
        onAnswerChange({ selected_index: idx });
    };
    return (_jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2", children: options.map((opt, idx) => (_jsxs("button", { type: "button", onClick: () => choose(idx), disabled: disabled, className: cn("rounded-xl border-2 px-4 py-4 text-left font-bold transition", selected === idx
                ? "border-owl-blue bg-owl-blue/10 text-owl-blue"
                : "border-owl-mist bg-white hover:border-owl-blue/40"), children: [_jsx("span", { className: "mr-3 inline-block w-6 text-center text-sm font-extrabold opacity-60", children: String.fromCharCode(65 + idx) }), opt] }, idx))) }));
}
