function initHeaderBehavior() {
  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }
}

// site-header injects its markup in connectedCallback (custom element upgrade),
// which can happen after DOMContentLoaded fires, so poll briefly until it's ready.
function whenHeaderReady(callback, attempts = 20) {
  if (document.querySelector(".site-header")) {
    callback();
  } else if (attempts > 0) {
    requestAnimationFrame(() => whenHeaderReady(callback, attempts - 1));
  }
}

whenHeaderReady(initHeaderBehavior);
