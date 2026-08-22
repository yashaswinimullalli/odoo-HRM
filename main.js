/**
 * Intelligence Designed To Evolve — main.js
 * Count-up stats + mobile menu controller + nav active state
 */

document.addEventListener("DOMContentLoaded", () => {
  initStatsCounter();
  initMobileMenu();
  initNavLinks();
});

/* ================================================================
   1. Count-Up Stats Animation
   ================================================================ */
function initStatsCounter() {
  const statElements = document.querySelectorAll(".stat-num");
  if (!statElements.length) return;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCount = (el, target, decimals, duration, delay) => {
    setTimeout(() => {
      let startTime = null;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentVal = easedProgress * target;

        el.textContent = currentVal.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toFixed(decimals);
        }
      };

      requestAnimationFrame(step);
    }, delay);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statElements.forEach((el, i) => {
            const target = parseFloat(el.getAttribute("data-target")) || 0;
            const decimals =
              parseInt(el.getAttribute("data-decimals"), 10) || 0;
            const duration = 1500 + i * 80;
            const startOffset = 480 + i * 90;

            animateCount(el, target, decimals, duration, startOffset);
          });
          obs.disconnect();
        }
      });
    },
    { threshold: 0.25 }
  );

  const statsSection = document.querySelector(".stats");
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* ================================================================
   2. Mobile Menu Controller
   ================================================================ */
function initMobileMenu() {
  const burgerBtn = document.querySelector(".burger-btn");
  const overlay = document.getElementById("mobile-overlay");
  const sheet = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(
    ".mobile-link, .mobile-sign-in"
  );

  if (!burgerBtn || !overlay || !sheet) return;

  const openMenu = () => {
    burgerBtn.setAttribute("aria-expanded", "true");
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    sheet.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  };

  const closeMenu = () => {
    burgerBtn.setAttribute("aria-expanded", "false");
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  burgerBtn.addEventListener("click", () => {
    const isExpanded = burgerBtn.getAttribute("aria-expanded") === "true";
    isExpanded ? closeMenu() : openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      burgerBtn.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (
      window.innerWidth > 720 &&
      burgerBtn.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
    }
  });
}

/* ================================================================
   3. Desktop & Mobile Navigation Active Tab Switcher
   ================================================================ */
function initNavLinks() {
  const desktopLinks = document.querySelectorAll(".nav-pill .nav-link");
  const mobileLinks = document.querySelectorAll(".mobile-nav .mobile-link");

  const setupLinkGroup = (links) => {
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        links.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      });
    });
  };

  setupLinkGroup(desktopLinks);
  setupLinkGroup(mobileLinks);
}
