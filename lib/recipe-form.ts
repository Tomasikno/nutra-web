"use client";

import type { HealthBenefit, Warning } from "@/lib/recipe-types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseMaybeJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const coerceHealthBenefits = (raw: unknown): HealthBenefit[] => {
  const parsed = parseMaybeJson(raw);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return { benefit: item, description: "" };
        }
        if (isObject(item)) {
          return {
            benefit: String(item.benefit ?? item.title ?? ""),
            description: typeof item.description === "string" ? item.description : "",
          };
        }
        return null;
      })
      .filter(
        (item): item is HealthBenefit =>
          Boolean(item) && (item.benefit.trim().length > 0 || item.description?.trim())
      );
  }

  if (typeof parsed === "string" && parsed.trim()) {
    return [{ benefit: parsed, description: "" }];
  }

  if (isObject(parsed)) {
    const benefit = String(parsed.benefit ?? parsed.title ?? "");
    const description = typeof parsed.description === "string" ? parsed.description : "";
    if (benefit.trim().length > 0 || description.trim().length > 0) {
      return [{ benefit, description }];
    }
  }

  return [];
};

export const coerceWarnings = (raw: unknown): Warning[] => {
  const parsed = parseMaybeJson(raw);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return { type: item, message: "" };
        }
        if (isObject(item)) {
          return {
            type: String(item.type ?? item.warning ?? ""),
            message: typeof item.message === "string" ? item.message : "",
          };
        }
        return null;
      })
      .filter(
        (item): item is Warning =>
          Boolean(item) && (item.type.trim().length > 0 || item.message.trim().length > 0)
      );
  }

  if (typeof parsed === "string" && parsed.trim()) {
    return [{ type: parsed, message: "" }];
  }

  if (isObject(parsed)) {
    const type = String(parsed.type ?? parsed.warning ?? "");
    const message = typeof parsed.message === "string" ? parsed.message : "";
    if (type.trim().length > 0 || message.trim().length > 0) {
      return [{ type, message }];
    }
  }

  return [];
};
