"use client";

import { useState } from "react";

type TagInputProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  helperText?: string;
  error?: string | null;
};

export default function TagInput({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  error,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const next = raw.trim();
    if (!next) return;
    if (value.some((tag) => tag.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, next]);
    setDraft("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
      event.preventDefault();
      addTag(draft);
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag));
  };

  return (
    <label className="flex flex-col gap-2 text-sm">
      <span>{label}</span>
      <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-emerald-100/70 transition hover:text-white"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={placeholder}
          className="min-w-[160px] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
        />
      </div>
      {helperText && !error && <span className="text-xs text-zinc-500">{helperText}</span>}
      {error && <span className="text-xs text-rose-200">{error}</span>}
    </label>
  );
}
