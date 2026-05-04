(() => {
  const currentYear = String(new Date().getFullYear());
  const lastUpdated = new Date(document.lastModified).toLocaleDateString("en-GB");

  document.querySelectorAll("[data-current-year]").forEach((yearElement) => {
    yearElement.textContent = currentYear;
  });

  document.querySelectorAll("[data-last-updated]").forEach((dateElement) => {
    dateElement.textContent = lastUpdated;
  });
})();
