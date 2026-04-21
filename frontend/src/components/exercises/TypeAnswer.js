import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export function TypeAnswer({ exercise, onAnswerChange, disabled }) {
    const hint = exercise.payload.hint;
    const [value, setValue] = useState("");
    return (_jsxs("div", { children: [_jsx("input", { type: "text", value: value, disabled: disabled, autoFocus: true, onChange: (e) => {
                    setValue(e.target.value);
                    onAnswerChange(e.target.value ? { text: e.target.value } : null);
                }, placeholder: "Type your answer\u2026", className: "w-full rounded-xl border-2 border-owl-mist px-4 py-3 text-lg focus:border-owl-blue focus:outline-none" }), hint && _jsxs("p", { className: "mt-2 text-sm text-slate-500", children: ["\uD83D\uDCA1 ", hint] })] }));
}
