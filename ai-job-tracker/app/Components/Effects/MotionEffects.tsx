"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MotionEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (event: PointerEvent) => {
      root.style.setProperty("--spot-x", `${event.clientX}px`);
      root.style.setProperty("--spot-y", `${event.clientY}px`);
      const card = (event.target as HTMLElement | null)?.closest(
        "[data-tilt]"
      ) as HTMLElement | null;
      document.querySelectorAll<HTMLElement>("[data-tilt].is-tilting").forEach((el) => {
        if (el !== card) {
          el.classList.remove("is-tilting");
          el.style.transform = "";
        }
      });
      if (!card || reduced) {
        return;
      }
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.classList.add("is-tilting");
      card.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-6px)`;
    };
    const resetTilt = () => {
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        el.style.transform = "";
        el.classList.remove("is-tilting");
      });
    };
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest(
        "button, a"
      ) as HTMLElement | null;
      if (!target || reduced || target.closest("[data-no-ripple]")) {
        return;
      }
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "js-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      target.classList.add("ripple-host");
      target.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", resetTilt);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", resetTilt);
      document.removeEventListener("click", onClick);
    };
  }, []);

    useEffect(() => {
      const page = document.querySelector("[data-page]");
      if (!page) {
        return;
      }
      page.classList.remove("page-enter");
      void (page as HTMLElement).offsetWidth;
      page.classList.add("page-enter");
    }, [pathname]);
    
  return <div className="cursor-spot" aria-hidden />;
}
