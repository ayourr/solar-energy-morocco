// Language switcher
function setLang(lang) {
  // Set text direction
  document.body.dir = (lang === "ar") ? "rtl" : "ltr";

  // Update all text elements
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
}

// Run after page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  setLang("ar"); // Always default to Arabic on first load
});
