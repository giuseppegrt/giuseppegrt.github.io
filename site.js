(() => {
  const currentYear = String(new Date().getFullYear());
  const lastUpdated = new Date(document.lastModified).toLocaleDateString("en-GB");

  document.querySelectorAll("[data-current-year]").forEach((yearElement) => {
    yearElement.textContent = currentYear;
  });

  document.querySelectorAll("[data-last-updated]").forEach((dateElement) => {
    dateElement.textContent = lastUpdated;
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
