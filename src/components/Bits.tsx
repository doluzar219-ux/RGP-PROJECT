import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ *
 *  Washi tape — a semi-transparent, slightly angled strip of tape.
 * ------------------------------------------------------------------ */
export function WashiTape({
  background = "linear-gradient(135deg,#f6c9ce,#e5a1aa)",
  className,
  style,
  rotate = -6,
}: {
  background?: string;
  className?: string;
  style?: CSSProperties;
  rotate?: number;
}) {
  return (
    <span
      aria-hidden
      className={cn("washi h-6 w-24", className)}
      style={{
        // @ts-expect-error custom property
        "--tape-bg": background,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  A pushpin / sticker that holds a card to the cork board.
 * ------------------------------------------------------------------ */
export function Pin({
  emoji,
  color = "#c8913f",
  className,
  size = 22,
}: {
  emoji?: string;
  color?: string;
  className?: string;
  size?: number;
}) {
  if (emoji) {
    return (
      <span
        aria-hidden
        className={cn("select-none drop-shadow-[1px_2px_1px_rgba(47,40,34,.45)]", className)}
        style={{ fontSize: size }}
      >
        {emoji}
      </span>
    );
  }
  return (
    <span aria-hidden className={cn("block", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <ellipse cx="12" cy="20" rx="4" ry="1.6" fill="rgba(47,40,34,.28)" />
        <circle cx="12" cy="9" r="7" fill={color} />
        <circle cx="9.6" cy="6.6" r="2.3" fill="rgba(255,255,255,.55)" />
        <path d="M12 15.5 L12 21" stroke="#3b3129" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Thick-paper button. Press it and it really goes down.
 * ------------------------------------------------------------------ */
type PaperButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "cream" | "clay" | "sage" | "sky" | "gold" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

const TONES: Record<string, string> = {
  cream: "#fffcf2",
  clay: "#eeb18d",
  sage: "#b9d3b0",
  sky: "#bcd7ea",
  gold: "#f2d492",
  ghost: "transparent",
};

export function PaperButton({
  tone = "cream",
  size = "md",
  className,
  children,
  disabled,
  ...rest
}: PaperButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={cn(
        "paper-btn wobble-soft font-print text-ink drag-none transition-all",
        "focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none shadow-none filter grayscale-[30%]",
        size === "sm" && "px-3 py-1 text-sm",
        size === "md" && "px-4 py-1.5 text-base",
        size === "lg" && "px-6 py-2.5 text-xl",
        className,
      )}
      style={{
        // @ts-expect-error custom property
        "--btn-bg": TONES[tone],
        ...rest.style,
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 *  Doodles — tiny hand-drawn SVG flourishes
 * ------------------------------------------------------------------ */
export function SketchArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 46" className={className} fill="none" aria-hidden>
      <path
        d="M4 34c14-22 40-30 74-24"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M63 3c6 3.5 11 5.6 15 7-3.5 3.4-6.4 7.6-8.6 12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SketchStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 2.6c1.3 4.6 2.4 6.2 6.9 7.6-4.3 1.8-5.6 3.3-6.6 11-1.3-7.3-2.6-9-7.2-10.7 4.4-1.3 5.6-3 6.9-7.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A wobbling ink frame drawn around any block */
export function InkFrame({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      preserveAspectRatio="none"
      viewBox="0 0 200 120"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 8c48-4 100-5 192-3M197 6c2 34 2 70 1 108M198 112c-58 3-120 4-194 2M3 114C1 80 1 44 3 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.75"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  A yellow sticky note with a handwritten tip
 * ------------------------------------------------------------------ */
export function StickyNote({
  children,
  rotate = -2.2,
  className,
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ rotate: rotate * -0.3, y: -3 }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
      className={cn(
        "relative px-4 pb-4 pt-5 font-hand text-lg leading-snug text-ink",
        className,
      )}
      style={{
        transform: `rotate(${rotate}deg)`,
        background: "linear-gradient(170deg,#fdf3a8,#f6e78a 65%,#eeda78)",
        boxShadow:
          "2px 3px 0 rgba(47,40,34,.13), 0 14px 20px -14px rgba(47,40,34,.75)",
        clipPath: "polygon(0 0, 100% 0, 100% 92%, 93% 100%, 0 100%)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-1.5 h-3.5 w-14 -translate-x-1/2 rounded-[1px] bg-white/45 shadow-[0_1px_2px_rgba(47,40,34,.2)]"
      />
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  Coffee ring stain — purely decorative
 * ------------------------------------------------------------------ */
export function CoffeeRing({
  className,
  size = 130,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute select-none", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <g fill="none" stroke="#8a5a24" strokeOpacity="0.17">
          <circle cx="60" cy="60" r="47" strokeWidth="7" />
          <circle cx="60" cy="60" r="41" strokeWidth="2" strokeOpacity="0.1" />
          <path
            d="M18 44a44 44 0 0 1 66-22"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.09"
          />
        </g>
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Section heading in marker pen, with a torn label behind it
 * ------------------------------------------------------------------ */
export function MarkerHeading({
  children,
  sub,
  className,
}: {
  children: ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end gap-3", className)}>
      <motion.h2
        initial={{ rotate: -1.6, y: 6, opacity: 0 }}
        animate={{ rotate: -1.6, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
        className="font-marker text-2xl leading-none text-ink sm:text-3xl"
      >
        {children}
      </motion.h2>
      {sub && <span className="font-hand text-lg text-ink-soft">{sub}</span>}
    </div>
  );
}
