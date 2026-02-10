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
    const benefits: HealthBenefit[] = [];

    for (const item of parsed) {
      if (typeof item === "string") {
        if (item.trim().length > 0) {
          benefits.push({ benefit: item, description: "" });
        }
        continue;
      }

      if (isObject(item)) {
        const benefit = String(item.benefit ?? item.title ?? "");
        const description = typeof item.description === "string" ? item.description : "";

        if (benefit.trim().length > 0 || description.trim().length > 0) {
          benefits.push({ benefit, description });
        }
      }
    }

    return benefits;
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
    const warnings: Warning[] = [];

    for (const item of parsed) {
      if (typeof item === "string") {
        if (item.trim().length > 0) {
          warnings.push({ type: item, message: "" });
        }
        continue;
      }

      if (isObject(item)) {
        const type = String(item.type ?? item.warning ?? "");
        const message = typeof item.message === "string" ? item.message : "";

        if (type.trim().length > 0 || message.trim().length > 0) {
          warnings.push({ type, message });
        }
      }
    }

    return warnings;
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
