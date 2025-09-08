// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    if (this.getAttribute("href") !== "#") {
      e.preventDefault();
      document.querySelector(this.getAttribute("href"))
        .scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Simple animation on scroll
const cards = document.querySelectorAll(".card");
window.addEventListener("scroll", () => {
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }
  });
});

// Initial hidden state for cards
cards.forEach(card => {
  card.style.opacity = "0";
  card.style.transform = "translateY(40px)";
  card.style.transition = "all 0.6s ease-out";
});

// Language switch
function setLang(lang) {
  document.body.dir = (lang === "ar") ? "rtl" : "ltr";
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
}

// Default language
setLang("en");


