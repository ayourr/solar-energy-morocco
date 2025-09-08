// Language switcher
function setLang(lang) {
  // Set text direction
  document.body.dir = (lang === "ar") ? "rtl" : "ltr";

  // Update all text elements
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });

  // Save the chosen language
  localStorage.setItem("lang", lang);
}

// Load preferred language on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "ar"; // default Arabic
  setLang(savedLang);
});
