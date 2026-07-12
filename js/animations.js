function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

function initCountUp() {
  const counters = document.querySelectorAll(".stat-number[data-target]");
  if (!counters.length) return;

  const animate = (el) => {
    const target = Number(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

function initGalleryControls() {
  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const strip = gallery.querySelector(".gallery-strip");
    const prev = gallery.querySelector("[data-gallery-prev]");
    const next = gallery.querySelector("[data-gallery-next]");
    if (!strip) return;

    const scrollAmount = () => strip.clientWidth * 0.8;
    prev?.addEventListener("click", () => strip.scrollBy({ left: -scrollAmount(), behavior: "smooth" }));
    next?.addEventListener("click", () => strip.scrollBy({ left: scrollAmount(), behavior: "smooth" }));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initCountUp();
  initGalleryControls();
});
