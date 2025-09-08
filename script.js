// Language switcher
function setLang(lang) {
  document.body.dir = (lang === "ar") ? "rtl" : "ltr";
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
}

// Default language
setLang("en");
