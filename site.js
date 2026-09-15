(() => {
  const currentYear = String(new Date().getFullYear());
  const lastUpdated = "15/09/2026";

  document.querySelectorAll("[data-current-year]").forEach((yearElement) => {
    yearElement.textContent = currentYear;
  });

  document.querySelectorAll("[data-last-updated]").forEach((dateElement) => {
    dateElement.textContent = lastUpdated;
  });

  document.querySelectorAll(".nav-menu").forEach((menu) => {
    const toggle = menu.querySelector(".menu-toggle");
    const navigation = menu.closest(".site-nav");
    const links = menu.querySelector(".dropdown");
    const brand = navigation?.querySelector(".nav-brand");
    const desktop = window.matchMedia("(min-width: 1024px)");

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
