import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const premiumMotion = () => {
  // Use GSAP context for proper cleanup and scoped ScrollTriggers
  const ctx = gsap.context(() => {
    // =========================================
    // HERO PARALLAX
    // =========================================
    if (document.querySelector(".hero-bg")) {
      gsap.to(".hero-bg", {
        scale: 1.15,
        y: 120,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    }

    // =========================================
    // HERO TEXT PARALLAX
    // =========================================
    if (document.querySelector(".hero-title")) {
      gsap.to(".hero-title", {
        y: -80,
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    }

    // =========================================
    // FADE REVEAL
    // =========================================
    gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 100,
        duration: 1.4,
        ease: "power4.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        }
      });
    });

    // =========================================
    // STAGGER CARDS
    // =========================================
    if (document.querySelector(".premium-card") && document.querySelector(".cards-wrapper")) {
      gsap.from(".premium-card", {
        opacity: 0,
        y: 80,
        stagger: 0.2,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".cards-wrapper",
          start: "top 80%",
        }
      });
    } else if (document.querySelector(".premium-card")) {
      // Fallback trigger if cards-wrapper doesn't wrap them directly
      gsap.from(".premium-card", {
        opacity: 0,
        y: 80,
        stagger: 0.15,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".premium-card",
          start: "top 85%",
        }
      });
    }

    // =========================================
    // LUXURY IMAGE REVEAL
    // =========================================
    gsap.utils.toArray<HTMLElement>(".image-reveal").forEach((img) => {
      gsap.from(img, {
        scale: 1.3,
        opacity: 0,
        duration: 1.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: img,
          start: "top 85%",
        }
      });
    });

    // =========================================
    // FLOATING GLOW
    // =========================================
    if (document.querySelector(".premium-glow")) {
      gsap.to(".premium-glow", {
        y: -40,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    // =========================================
    // BUTTON MAGNETIC
    // =========================================
    const buttons = document.querySelectorAll(".magnetic-btn");
    buttons.forEach((btn: any) => {
      const onMouseMove = (e: any) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.25,
          y: y * 0.25,
          duration: 0.3,
        });
      };

      const onMouseLeave = () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.4,
        });
      };

      btn.addEventListener("mousemove", onMouseMove);
      btn.addEventListener("mouseleave", onMouseLeave);
      
      // Store event listeners on the element so they can be disposed during context revert
      btn._onMouseMove = onMouseMove;
      btn._onMouseLeave = onMouseLeave;
    });

  });

  return ctx;
};

