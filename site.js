(() => {
  const currentYear = String(new Date().getFullYear());

  document.querySelectorAll("[data-current-year]").forEach((yearElement) => {
    yearElement.textContent = currentYear;
  });

  const showLastUpdated = (lastModified) => {
    const date = new Date(lastModified);
    if (Number.isNaN(date.getTime())) return;

    const formatted = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Zurich",
    }).format(date);

    document.querySelectorAll("[data-last-updated]").forEach((dateElement) => {
      dateElement.textContent = formatted;
    });
  };

  const updateLastUpdated = async () => {
    if (window.location.protocol === "file:") {
      showLastUpdated(document.lastModified);
      return;
    }

    if (!/^https?:$/.test(window.location.protocol)) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    try {
      // GitHub Pages supplies the deployment date in this response header.
      const response = await fetch(window.location.href, {
        method: "HEAD",
        cache: "no-cache",
        signal: controller.signal,
      });
      const lastModified = response.headers.get("Last-Modified");
      if (response.ok && lastModified) showLastUpdated(lastModified);
    } catch {
      // Keep the placeholder if unavailable; never substitute the visit date.
    } finally {
      window.clearTimeout(timeout);
    }
  };

  updateLastUpdated();

  document.querySelectorAll(".nav-menu").forEach((menu) => {
    const toggle = menu.querySelector(".menu-toggle");
    const navigation = menu.closest(".site-nav");
    const links = menu.querySelector(".dropdown");
    const brand = navigation?.querySelector(".nav-brand");
    // Phone browsers commonly request desktop sites with a 980px viewport.
    const desktop = window.matchMedia("(min-width: 960px)");

    if (!toggle || !navigation || !links) return;

    const updateMenuLabel = () => {
      toggle.setAttribute("aria-label", menu.open ? "Close menu" : "Open menu");
    };

    // Reuse one set of links for the desktop sidebar and native mobile disclosure.
    const updateNavigation = () => {
      const focused = document.activeElement;
      const linkWasFocused = links.contains(focused);
      const toggleWasFocused = focused === toggle;
      const brandWasFocused = focused === brand;

      if (desktop.matches) {
        navigation.append(links);
        menu.open = false;
      } else {
        menu.append(links);
        menu.open = linkWasFocused;
      }

      document.body.classList.toggle("desktop-navigation", desktop.matches);
      updateMenuLabel();

      if (linkWasFocused) {
        focused.focus({ preventScroll: true });
      } else if (desktop.matches && toggleWasFocused) {
        (links.querySelector('[aria-current="page"]') || links.querySelector("a"))?.focus({ preventScroll: true });
      } else if (!desktop.matches && brandWasFocused) {
        toggle.focus({ preventScroll: true });
      }
    };

    updateNavigation();
    desktop.addEventListener("change", updateNavigation);
    menu.addEventListener("toggle", updateMenuLabel);

    document.addEventListener("keydown", (event) => {
      if (desktop.matches || event.key !== "Escape" || !menu.open) return;

      menu.open = false;
      toggle.focus();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!desktop.matches && menu.open && !menu.contains(event.target)) {
        menu.open = false;
      }
    });
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (delay) => new Promise((resolve) => window.setTimeout(resolve, delay));

  document.querySelectorAll("[data-subtitles]").forEach((subtitleElement) => {
    const textElement = subtitleElement.querySelector(".subtitle-text");
    const subtitles = subtitleElement.dataset.subtitles
      .split("|")
      .map((subtitle) => subtitle.trim())
      .filter(Boolean);

    if (!textElement || subtitles.length < 2) return;

    let subtitleIndex = Math.max(0, subtitles.indexOf(textElement.textContent.trim()));

    if (reduceMotion) {
      textElement.textContent = subtitles[subtitleIndex];
      return;
    }

    const typeLoop = async () => {
      while (true) {
        await sleep(1350);

        const currentSubtitle = subtitles[subtitleIndex];
        for (let i = currentSubtitle.length; i >= 0; i -= 1) {
          textElement.textContent = currentSubtitle.slice(0, i);
          await sleep(34);
        }

        subtitleIndex = (subtitleIndex + 1) % subtitles.length;
        const nextSubtitle = subtitles[subtitleIndex];

        for (let i = 1; i <= nextSubtitle.length; i += 1) {
          textElement.textContent = nextSubtitle.slice(0, i);
          await sleep(48);
        }
      }
    };

    typeLoop();
  });
})();
