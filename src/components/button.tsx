import Link from "next/link";
import type { ComponentProps } from "react";

import styles from "./button.module.css";

type ButtonStyle = {
  variant?: "primary" | "secondary";
  size?: "default" | "small";
  /** Show the forward arrow. Use it on the main action of a section. */
  arrow?: boolean;
};

// Built once (rendering-hoist-jsx).
const arrowIcon = (
  <svg
    className={styles.arrow}
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 8h11M9 4l4 4-4 4" />
  </svg>
);

function classes(
  variant: ButtonStyle["variant"],
  size: ButtonStyle["size"],
  className?: string,
) {
  return [
    styles.button,
    styles[variant ?? "primary"],
    size === "small" ? styles.small : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * A link to a page of this site, styled as one of the design system's two
 * buttons. Button text is a verb and an object ("Book a discovery call").
 */
export function ButtonLink({
  variant = "primary",
  size = "default",
  arrow = false,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & ButtonStyle) {
  return (
    <Link className={classes(variant, size, className)} {...props}>
      {children}
      {arrow ? arrowIcon : null}
    </Link>
  );
}

/**
 * The same buttons for an address outside this site, such as WhatsApp. A
 * plain link: Next.js has nothing to prefetch there.
 */
export function ButtonAnchor({
  variant = "primary",
  size = "default",
  arrow = false,
  className,
  children,
  ...props
}: ComponentProps<"a"> & ButtonStyle) {
  return (
    <a className={classes(variant, size, className)} {...props}>
      {children}
      {arrow ? arrowIcon : null}
    </a>
  );
}
