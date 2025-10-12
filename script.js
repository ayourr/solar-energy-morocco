let currentLanguage = "en";

// Language switcher
function setLang(lang) {
  currentLanguage = lang;
  document.documentElement.lang = lang;
  document.body.dir = lang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-en]").forEach((el) => {
    const translation = el.getAttribute(`data-${lang}`);
    if (translation !== null) {
      el.textContent = translation;
    }
  });

  document.querySelectorAll("[data-en-placeholder]").forEach((el) => {
    const translation = el.getAttribute(`data-${lang}-placeholder`);
    if (translation !== null) {
      el.setAttribute("placeholder", translation);
    }
  });
}

const STATUS_MESSAGES = {
  sending: {
    en: "Sending your request...",
    ar: "جارٍ إرسال طلبك...",
  },
  success: {
    en: "Thank you! Our team will contact you soon.",
    ar: "شكراً لك! سيتواصل معك فريقنا قريباً.",
  },
  error: {
    en: "Sorry, something went wrong. Please try again later.",
    ar: "عذراً، حدث خطأ ما. يرجى المحاولة لاحقاً.",
  },
  missing: {
    en: "Please fill in the required fields.",
    ar: "يرجى ملء الحقول المطلوبة.",
  },
};

function updateStatus(element, type) {
  if (!element) return;
  element.classList.remove("success", "error");
  if (type === "success") {
    element.classList.add("success");
  } else if (type === "error" || type === "missing") {
    element.classList.add("error");
  }
  element.textContent = STATUS_MESSAGES[type][currentLanguage];
}

// Run after page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const statusElement = document.getElementById("contact-status");
  const submitButton = form ? form.querySelector("button[type='submit']") : null;

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        updateStatus(statusElement, "missing");
        return;
      }

      const formData = Object.fromEntries(new FormData(form).entries());

      try {
        updateStatus(statusElement, "sending");
        if (submitButton) {
          submitButton.disabled = true;
        }

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        form.reset();
        updateStatus(statusElement, "success");
      } catch (error) {
        updateStatus(statusElement, "error");
        console.error("Unable to send contact request:", error);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  }

  setLang("ar"); // Always default to Arabic on first load
});
