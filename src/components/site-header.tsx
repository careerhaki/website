"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import logo from "@/assets/careerhaki-logo.png";
import { ButtonLink } from "@/components/button";
import { bookingPath, navLinks } from "@/lib/navigation";

import styles from "./site-header.module.css";

/**
 * The site navigation: logo, links, "Book a call", and on phones a menu
 * button that opens a full-screen sheet. Motion N1 to N4; see the stylesheet.
 *
 * A page with a hero marks its main button with `data-hero-cta`. While that
 * button is on screen, "Book a call" here is an outline, so only one orange
 * booking button is ever in view (N2). This is pure CSS on first paint; the
 * script below only adds `data-past-hero` once the button has scrolled away.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // N1: mark the bar as scrolled once the top-of-page marker leaves the screen.
  useEffect(() => {
    const header = headerRef.current;
    const sentinel = sentinelRef.current;
    if (!header || !sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      header.dataset.scrolled = String(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // The phone menu sheet starts where the bar ends.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty("--head-h", `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // N2: note when the hero's button has scrolled off the top of the screen.
  useEffect(() => {
    const root = document.documentElement;
    const target = document.querySelector("[data-hero-cta]");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          root.dataset.pastHero = "";
        } else {
          delete root.dataset.pastHero;
        }
      },
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      delete root.dataset.pastHero;
    };
  }, [pathname]);

  // N4: while the sheet is open, the rest of the page is inert and does not
  // scroll; Escape or a wide window closes it.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const header = headerRef.current;
    const sheet = sheetRef.current;
    // Everything outside the bar and the sheet, at the top level of the page.
    // An element that holds the bar or the sheet stays live.
    const others = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        !(header && element.contains(header)) &&
        !(sheet && element.contains(sheet)),
    );
    root.dataset.menuOpen = "";
    for (const element of others) element.inert = true;
    const frame = requestAnimationFrame(() => firstLinkRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const wide = window.matchMedia("(width >= 53.75rem)");
    const onWide = () => {
      if (wide.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);
    return () => {
      cancelAnimationFrame(frame);
      delete root.dataset.menuOpen;
      for (const element of others) element.inert = false;
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <header
        ref={headerRef}
        className={styles.header}
        data-scrolled="false"
        data-menu-open={open ? "true" : undefined}
      >
        <div className={styles.inner}>
          <Link href="/" className={styles.logo} onClick={close}>
            <Image
              src={logo}
              alt="CareerHaki"
              sizes="139px"
              loading="eager"
              className={styles.logoImage}
            />
          </Link>

          <nav aria-label="Main" className={styles.links}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.link}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <ButtonLink href={bookingPath} size="small" className={styles.cta}>
              Book a call
            </ButtonLink>
            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <line className={styles.line1} x1="3" y1="6" x2="17" y2="6" />
                <line className={styles.line2} x1="3" y1="10" x2="17" y2="10" />
                <line className={styles.line3} x1="3" y1="14" x2="17" y2="14" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <nav
        id="site-menu"
        ref={sheetRef}
        aria-label="Menu"
        className={styles.sheet}
        data-open={open ? "true" : "false"}
      >
        <ul className={styles.sheetLinks}>
          {navLinks.map((link, index) => (
            <li
              key={link.href}
              className={styles.sheetItem}
              style={{ "--i": index } as CSSProperties}
            >
              <Link
                ref={index === 0 ? firstLinkRef : undefined}
                href={link.href}
                className={styles.sheetLink}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={close}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <ButtonLink
          href={bookingPath}
          arrow
          className={`${styles.sheetItem} ${styles.sheetCta}`}
          style={{ "--i": navLinks.length } as CSSProperties}
          onClick={close}
        >
          Book a discovery call
        </ButtonLink>
      </nav>
    </>
  );
}
