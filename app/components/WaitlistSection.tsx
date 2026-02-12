"use client";

import Reveal from "@/app/components/Reveal";
import { FormEvent, useMemo, useState } from "react";

type WaitlistLabels = {
  badge: string;
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  submitButton: string;
  successMessage: string;
  invalidEmailMessage: string;
  genericErrorMessage: string;
  rateLimitMessage: string;
};

type WaitlistSectionProps = {
  locale: string;
  labels: WaitlistLabels;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 2;
const RATE_LIMIT_STORAGE_KEY = "nutra_waitlist_submission_timestamps";

function getStoredSubmissionTimestamps(now: number): number[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(RATE_LIMIT_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is number => typeof value === "number")
      .filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  } catch {
    return [];
  }
}

function persistSubmissionTimestamps(timestamps: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(timestamps));
}

function isValidEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}

export default function WaitlistSection({ locale, labels }: WaitlistSectionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  const statusClassName = useMemo(() => {
    if (statusType === "success") return "text-emerald-700";
    if (statusType === "error") return "text-rose-700";
    return "text-slate-700";
  }, [statusType]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setStatusType("error");
      setStatusMessage(labels.invalidEmailMessage);
      return;
    }

    const now = Date.now();
    const recentTimestamps = getStoredSubmissionTimestamps(now);
    if (recentTimestamps.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
      setStatusType("error");
      setStatusMessage(labels.rateLimitMessage);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const response = await fetch("/api/marketing-waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, locale }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? labels.genericErrorMessage);
      }

      persistSubmissionTimestamps([...recentTimestamps, now]);
      setEmail("");
      setStatusType("success");
      setStatusMessage(labels.successMessage);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error instanceof Error ? error.message : labels.genericErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="px-6 pb-8 lg:px-12" id="waitlist">
      <Reveal>
        <div className="mx-auto max-w-4xl rounded-3xl border border-forest-green/15 bg-[#e5dccd] p-8 text-center shadow-[0_24px_70px_-45px_rgba(28,51,37,0.8)] sm:p-10">
          <p className="mb-4 inline-flex rounded-full border border-forest-green/15 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-forest-green/80">
            {labels.badge}
          </p>
          <h2 className="display-type mb-5 text-4xl font-bold text-forest-green lg:text-5xl">{labels.title}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-forest-green/70">{labels.subtitle}</p>

          <form className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={labels.emailPlaceholder}
              className="h-16 w-full rounded-2xl border border-forest-green/15 bg-white px-6 text-lg text-forest-green placeholder:text-slate-500 focus:border-primary focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-16 rounded-2xl bg-primary px-8 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {labels.submitButton}
            </button>
          </form>

          {statusMessage ? (
            <p className={`mt-4 text-sm font-medium ${statusClassName}`} role="status">
              {statusMessage}
            </p>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
