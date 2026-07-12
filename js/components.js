const NAV_LINKS = [
  { href: "index.html", label: "Home", key: "home" },
  { href: "products.html", label: "Products", key: "products" },
  { href: "automation-scada.html", label: "Automation & SCADA", key: "automation" },
  { href: "applications.html", label: "Applications", key: "applications" },
  { href: "gallery.html", label: "Installations", key: "gallery" },
  { href: "about.html", label: "About", key: "about" },
];

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const activePage = document.body.dataset.page || "";

    const links = NAV_LINKS.map(
      (link) =>
        `<li><a href="${link.href}"${link.key === activePage ? ' class="active"' : ""}>${link.label}</a></li>`
    ).join("");

    this.innerHTML = `
      <header class="site-header">
        <div class="container">
          <a class="brand" href="index.html">
            <img src="assets/images/logo/bp-logo.png" alt="Bioprim Technologies logo" width="40" height="40">
            <span>Bioprim Technologies</span>
          </a>
          <nav>
            <ul class="nav-links" id="nav-links">
              ${links}
              <li><a href="contact.html" class="btn btn-primary" style="padding:0.6em 1.4em;">Request a Quote</a></li>
            </ul>
          </nav>
          <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>
    `;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a class="brand" href="index.html" style="color:#fff;">
                <img src="assets/images/logo/bp-logo.png" alt="Bioprim Technologies logo" width="40" height="40">
                <span>Bioprim Technologies</span>
              </a>
              <p style="color:rgba(255,255,255,0.65); margin-top:1rem; max-width:32ch;">
                Bioprocess Inspired…… Advanced fermenters, bioreactors, and PLC/SCADA automation, engineered in Mohali, Punjab.
              </p>
              <div class="footer-social">
                <a href="https://www.linkedin.com/company/bioprim-technologies" target="_blank" rel="noopener" aria-label="Bioprim Technologies on LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:#fff;"><path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul>
                <li><a href="products.html">Products</a></li>
                <li><a href="automation-scada.html">Automation &amp; SCADA</a></li>
                <li><a href="applications.html">Applications</a></li>
                <li><a href="gallery.html">Installations</a></li>
                <li><a href="about.html">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4>Products</h4>
              <ul>
                <li><a href="bioprim-a.html">Bioprim-A &mdash; Lab Scale</a></li>
                <li><a href="bioprim-p.html">Bioprim-P &mdash; Parallel</a></li>
                <li><a href="bioprim-i.html">Bioprim-I &mdash; In-Situ</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li>Plot No. 539, Industrial Area, Phase-9, Mohali, 160062, Punjab, India</li>
                <li><a href="tel:+919465570063">+91 94655 70063</a></li>
                <li><a href="tel:+916284250469">+91 62842 50469</a></li>
                <li><a href="mailto:info@bioprimtech.com">info@bioprimtech.com</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; ${year} Bioprim Technologies. All rights reserved.</span>
            <span><a href="contact.html">Request a Quote</a></span>
          </div>
        </div>
      </footer>
    `;
  }
}

class WhatsappFab extends HTMLElement {
  connectedCallback() {
    const message = encodeURIComponent(
      "Hi Bioprim Technologies, I'd like to enquire about your fermenters/bioreactors."
    );
    this.innerHTML = `
      <a class="whatsapp-fab" href="https://wa.me/919465570063?text=${message}" target="_blank" rel="noopener" aria-label="Chat with Bioprim Technologies on WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.33 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.8 14.14c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.79-4.16-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.14.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2 1.11.99 2.05 1.3 2.34 1.44.3.15.47.13.64-.08.18-.2.75-.87.95-1.17.2-.29.4-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.7-.17 1.38z"/></svg>
      </a>
    `;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
customElements.define("whatsapp-fab", WhatsappFab);
