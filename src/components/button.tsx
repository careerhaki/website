import Link from "next/link";
import type { ComponentProps } from "react";

import styles from "./button.module.css";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
  size?: "default" | "small";
  /** Show the forward arrow. Use it on the main action of a section. */
  arrow?: boolean;
};

/**
 * A link styled as one of the design system's two buttons. Button text is a
 * verb and an object ("Book a discovery call").
 */
export function ButtonLink({
  variant = "primary",
  size = "default",
  arrow = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const classes = [
    styles.button,
    styles[variant],
    size === "small" ? styles.small : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={classes} {...props}>
      {children}
      {arrow ? (
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
      ) : null}
    </Link>
  );
}
