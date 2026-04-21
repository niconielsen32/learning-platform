import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "@/lib/utils";
export function TrueFalse({ onAnswerChange, disabled }) {
    const [selected, setSelected] = useState(null);
    const choose = (v) => {
        if (disabled)
            return;
        setSelected(v);
        onAnswerChange({ value: v });
    };
    return (_jsx("div", { className: "flex justify-center gap-4", children: [true, false].map((v) => (_jsx("button", { type: "button", onClick: () => choose(v), disabled: disabled, className: cn("min-w-[140px] rounded-2xl border-2 px-6 py-4 text-2xl font-extrabold transition", selected === v
                ? v
                    ? "border-owl-green bg-owl-green text-white"
                    : "border-owl-red bg-owl-red text-white"
                : "border-owl-mist bg-white hover:border-owl-blue/40"), children: v ? "True" : "False" }, String(v)))) }));
}
