(function () {
  "use strict";

  var SUPPORTED = ["en", "fr", "de", "es", "it", "ro", "pl"];
  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "site_lang";

  var CHROME_I18N = {
    "chrome.cta": {
      en: "Generate Your Firm's Pack →",
      fr: "Générez le Pack de Votre Entreprise →",
      de: "Erstellen Sie das Paket Ihrer Firma →",
      es: "Genera el Pack de Tu Empresa →",
      it: "Genera il Pack della Tua Azienda →",
      ro: "Generează Pachetul Firmei Tale →",
      pl: "Wygeneruj Pakiet Twojej Firmy →"
    },
    "chrome.footer_text": {
      en: "EU AI Act Ready™ — part of the 70-document governance library.",
      fr: "EU AI Act Ready™ — fait partie de la bibliothèque de gouvernance de 70 documents.",
      de: "EU AI Act Ready™ — Teil der Governance-Bibliothek mit 70 Dokumenten.",
      es: "EU AI Act Ready™ — parte de la biblioteca de gobernanza de 70 documentos.",
      it: "EU AI Act Ready™ — parte della libreria di governance di 70 documenti.",
      ro: "EU AI Act Ready™ — parte din biblioteca de guvernanță de 70 de documente.",
      pl: "EU AI Act Ready™ — część biblioteki zarządzania z 70 dokumentami."
    },
    "chrome.back_home": {
      en: "Back to homepage",
      fr: "Retour à l'accueil",
      de: "Zurück zur Startseite",
      es: "Volver a la página principal",
      it: "Torna alla homepage",
      ro: "Înapoi la pagina principală",
      pl: "Powrót do strony głównej"
    },
    "chrome.governance_kicker": {
      en: "Governance Library",
      fr: "Bibliothèque de Gouvernance",
      de: "Governance-Bibliothek",
      es: "Biblioteca de Gobernanza",
      it: "Libreria di Governance",
      ro: "Bibliotecă de Guvernanță",
      pl: "Biblioteka Zarządzania"
    },
    "chrome.docs_in_module": {
      en: "7 documents in this module",
      fr: "7 documents dans ce module",
      de: "7 Dokumente in diesem Modul",
      es: "7 documentos en este módulo",
      it: "7 documenti in questo modulo",
      ro: "7 documente în acest modul",
      pl: "7 dokumentów w tym module"
    },
    "chrome.where_fits": {
      en: "Where this fits",
      fr: "Où cela s'inscrit",
      de: "Wo dies hineinpasst",
      es: "Dónde encaja esto",
      it: "Dove si inserisce",
      ro: "Unde se încadrează",
      pl: "Gdzie to pasuje"
    }
  };

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      var entry = CHROME_I18N[key];
      if (!entry) return;
      var text = entry[lang] || entry[DEFAULT_LANG];
      node.textContent = text;
    });

    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem(STORAGE_KEY, lang);
    window.CURRENT_SITE_LANG = lang;

    document.querySelectorAll(".site-lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    var select = document.getElementById("siteLangSelect");
    if (select) select.value = lang;
  }

  function buildSelector() {
    var container = document.getElementById("site-lang-selector");
    if (!container) return;
    var flags = { en: "🇬🇧", fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸", it: "🇮🇹", ro: "🇷🇴", pl: "🇵🇱" };
    var select = document.createElement("select");
    select.id = "siteLangSelect";
    select.style.cssText = "background:#c90016;color:#fff;border:none;border-radius:8px;padding:6px 10px;font-weight:900;font-size:12px;cursor:pointer;";
    SUPPORTED.forEach(function (lang) {
      var opt = document.createElement("option");
      opt.value = lang;
      opt.textContent = flags[lang] + " " + lang.toUpperCase();
      select.appendChild(opt);
    });
    select.addEventListener("change", function () {
      applyLang(select.value);
    });
    container.appendChild(select);
  }

  function init() {
    buildSelector();
    var saved = localStorage.getItem(STORAGE_KEY);
    var browserLang = (navigator.language || "en").slice(0, 2);
    var initial = saved || (SUPPORTED.indexOf(browserLang) !== -1 ? browserLang : DEFAULT_LANG);
    applyLang(initial);
  }

  window.setSiteLang = applyLang;
  document.addEventListener("DOMContentLoaded", init);
})();
