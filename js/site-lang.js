(function () {
  "use strict";

  var SUPPORTED = ["en", "fr", "de", "es", "it", "ro", "pl", "nl", "pt", "sv", "cs", "el", "hu", "da", "fi", "bg", "sk"];
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
      pl: "Wygeneruj Pakiet Twojej Firmy →",
      nl: "Genereer het Pack van Uw Firma →",
      pt: "Gere o Pack da Sua Empresa →",
      sv: "Generera Ditt Företags Paket →",
      cs: "Vygenerujte Balíček Vaší Firmy →",
      el: "Δημιουργήστε το Πακέτο της Εταιρείας σας →",
      hu: "Generálja Cége Csomagját →",
      da: "Generér Din Virksomheds Pakke →",
      fi: "Luo Yrityksesi Paketti →",
      bg: "Генерирайте Пакета на Вашата Фирма →",
      sk: "Vygenerujte Balíček Vašej Firmy →"
    },
    "chrome.footer_text": {
      en: "EU AI Act Ready™ — part of the 70-document governance library.",
      fr: "EU AI Act Ready™ — fait partie de la bibliothèque de gouvernance de 70 documents.",
      de: "EU AI Act Ready™ — Teil der Governance-Bibliothek mit 70 Dokumenten.",
      es: "EU AI Act Ready™ — parte de la biblioteca de gobernanza de 70 documentos.",
      it: "EU AI Act Ready™ — parte della libreria di governance di 70 documenti.",
      ro: "EU AI Act Ready™ — parte din biblioteca de guvernanță de 70 de documente.",
      pl: "EU AI Act Ready™ — część biblioteki zarządzania z 70 dokumentami.",
      nl: "EU AI Act Ready™ — onderdeel van de governance-bibliotheek met 70 documenten.",
      pt: "EU AI Act Ready™ — parte da biblioteca de governação de 70 documentos.",
      sv: "EU AI Act Ready™ — en del av styrningsbiblioteket med 70 dokument.",
      cs: "EU AI Act Ready™ — součást knihovny správy se 70 dokumenty.",
      el: "EU AI Act Ready™ — μέρος της βιβλιοθήκης διακυβέρνησης των 70 εγγράφων.",
      hu: "EU AI Act Ready™ — a 70 dokumentumos irányítási könyvtár része.",
      da: "EU AI Act Ready™ — en del af 70-dokument styringsbiblioteket.",
      fi: "EU AI Act Ready™ — osa 70 asiakirjan hallintakirjastoa.",
      bg: "EU AI Act Ready™ — част от библиотеката за управление със 70 документа.",
      sk: "EU AI Act Ready™ — súčasť knižnice správy so 70 dokumentmi."
    },
    "chrome.back_home": {
      en: "Back to homepage",
      fr: "Retour à l'accueil",
      de: "Zurück zur Startseite",
      es: "Volver a la página principal",
      it: "Torna alla homepage",
      ro: "Înapoi la pagina principală",
      pl: "Powrót do strony głównej",
      nl: "Terug naar startpagina",
      pt: "Voltar à página inicial",
      sv: "Tillbaka till startsidan",
      cs: "Zpět na domovskou stránku",
      el: "Επιστροφή στην αρχική σελίδα",
      hu: "Vissza a kezdőlapra",
      da: "Tilbage til forsiden",
      fi: "Takaisin etusivulle",
      bg: "Обратно към началната страница",
      sk: "Späť na domovskú stránku"
    },
    "chrome.governance_kicker": {
      en: "Governance Library",
      fr: "Bibliothèque de Gouvernance",
      de: "Governance-Bibliothek",
      es: "Biblioteca de Gobernanza",
      it: "Libreria di Governance",
      ro: "Bibliotecă de Guvernanță",
      pl: "Biblioteka Zarządzania",
      nl: "Governance-Bibliotheek",
      pt: "Biblioteca de Governação",
      sv: "Styrningsbibliotek",
      cs: "Knihovna Správy",
      el: "Βιβλιοθήκη Διακυβέρνησης",
      hu: "Irányítási Könyvtár",
      da: "Styringsbibliotek",
      fi: "Hallintakirjasto",
      bg: "Библиотека за Управление",
      sk: "Knižnica Správy"
    },
    "chrome.docs_in_module": {
      en: "7 documents in this module",
      fr: "7 documents dans ce module",
      de: "7 Dokumente in diesem Modul",
      es: "7 documentos en este módulo",
      it: "7 documenti in questo modulo",
      ro: "7 documente în acest modul",
      pl: "7 dokumentów w tym module",
      nl: "7 documenten in deze module",
      pt: "7 documentos neste módulo",
      sv: "7 dokument i denna modul",
      cs: "7 dokumentů v tomto modulu",
      el: "7 έγγραφα σε αυτή την ενότητα",
      hu: "7 dokumentum ebben a modulban",
      da: "7 dokumenter i dette modul",
      fi: "7 asiakirjaa tässä moduulissa",
      bg: "7 документа в този модул",
      sk: "7 dokumentov v tomto module"
    },
    "chrome.where_fits": {
      en: "Where this fits",
      fr: "Où cela s'inscrit",
      de: "Wo dies hineinpasst",
      es: "Dónde encaja esto",
      it: "Dove si inserisce",
      ro: "Unde se încadrează",
      pl: "Gdzie to pasuje",
      nl: "Waar dit past",
      pt: "Onde isto se encaixa",
      sv: "Var detta passar in",
      cs: "Kam to zapadá",
      el: "Πού ταιριάζει αυτό",
      hu: "Hová illik ez",
      da: "Hvor dette passer ind",
      fi: "Mihin tämä sopii",
      bg: "Къде се вписва това",
      sk: "Kam to zapadá"
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
    var flags = { en: "🇬🇧", fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸", it: "🇮🇹", ro: "🇷🇴", pl: "🇵🇱", nl: "🇳🇱", pt: "🇵🇹", sv: "🇸🇪", cs: "🇨🇿", el: "🇬🇷", hu: "🇭🇺", da: "🇩🇰", fi: "🇫🇮", bg: "🇧🇬", sk: "🇸🇰" };
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
