import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export function FillBlank({ exercise, onAnswerChange, disabled }) {
    const sentence = exercise.payload.sentence ?? "";
    const [value, setValue] = useState("");
    const [before, after] = sentence.split("___");
    return (_jsxs("div", { className: "text-xl", children: [_jsx("span", { children: before }), _jsx("input", { type: "text", value: value, disabled: disabled, onChange: (e) => {
                    setValue(e.target.value);
                    onAnswerChange(e.target.value ? { text: e.target.value } : null);
                }, autoFocus: true, className: "mx-2 inline-block min-w-[120px] border-b-4 border-owl-blue bg-transparent px-2 py-1 text-center font-bold focus:outline-none" }), _jsx("span", { children: after })] }));
}
