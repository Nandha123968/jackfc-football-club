import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const initAnimations = () => {
  const ctx = gsap.context(() => {
    // =========================
    // SECTION REVEAL
    // =========================
    gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
      gsap.from(el, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // =========================
    // LEFT REVEAL
    // =========================
    gsap.utils.toArray<HTMLElement>(".reveal-left").forEach((el) => {
      gsap.from(el, {
        x: -120,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // =========================
    // RIGHT REVEAL
    // =========================
    gsap.utils.toArray<HTMLElement>(".reveal-right").forEach((el) => {
      gsap.from(el, {
        x: 120,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // =========================
    // SCALE CARDS
    // =========================
    gsap.utils.toArray<HTMLElement>(".scale-card").forEach((el) => {
      gsap.from(el, {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
        },
      });
    });

    // =========================
    // FLOATING GLOW
    // =========================
    gsap.to(".floating-glow", {
      y: -30,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  return ctx;
};
