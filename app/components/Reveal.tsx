"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

type HtmlElementTag = "div" | "section" | "article" | "span" | "p" | "header" | "footer" | "aside" | "main" | "nav" | "ul" | "li";

interface RevealProps {
  children: ReactNode;
  /** Animation direction. Default: "up" */
  direction?: RevealDirection;
  /** Delay in ms. Default: 0 */
  delay?: number;
  /** Duration in ms. Default: 600 */
  duration?: number;
  /** Translation distance in px. Default: 24 */
  distance?: number;
  /** IntersectionObserver threshold. Default: 0.15 */
  threshold?: number;
  /** Extra className on the wrapper */
  className?: string;
  /** Render as a different element. Default: "div" */
  as?: HtmlElementTag;
}

const directionTransform: Record<RevealDirection, (d: number) => string> = {
  up: (d) => `translateY(${d}px)`,
  down: (d) => `translateY(${-d}px)`,
  left: (d) => `translateX(${d}px)`,
  right: (d) => `translateX(${-d}px)`,
  none: () => "none",
};

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 600,
  distance = 24,
  threshold = 0.15,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionProperty = "opacity, transform";
          el.style.transitionDuration = `${duration}ms`;
          el.style.transitionTimingFunction = "cubic-bezier(0.16, 1, 0.3, 1)";
          el.style.transitionDelay = `${delay}ms`;
          el.style.opacity = "1";
          el.style.transform = "none";
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, duration, threshold]);

  const initialStyle: CSSProperties = {
    opacity: 0,
    transform: directionTransform[direction](distance),
    willChange: "opacity, transform",
  };

  const Component = Tag as React.ElementType;

  return (
    <Component ref={ref} className={className} style={initialStyle}>
      {children}
    </Component>
  );
}
