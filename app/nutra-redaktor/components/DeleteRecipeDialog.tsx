"use client";

import { useState } from "react";

type DeleteRecipeDialogProps = {
  isOpen: boolean;
  recipeName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function DeleteRecipeDialog({
  isOpen,
  recipeName,
  onCancel,
  onConfirm,
  isLoading = false,
}: DeleteRecipeDialogProps) {
  const [confirmation, setConfirmation] = useState("");

  if (!isOpen) return null;

  const isMatch = confirmation.trim() === recipeName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white">Delete Recipe</h3>
        <p className="mt-2 text-sm text-zinc-300">
          This will soft-delete the recipe. Type the recipe name to confirm.
        </p>
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-white">
          {recipeName}
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          Confirmation
          <input
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
        </label>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isMatch || isLoading}
            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-rose-500/40"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
