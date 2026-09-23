
const TRUSTED_DOMAINS = [
  "wikipedia.org",
  "wikimedia.org",
  "wiktionary.org",
  "britannica.com",
  "gov.br",
  "google.com",
  "microsoft.com",
  "apple.com",
  "mozilla.org",
  "github.com",
  "stackoverflow.com",
  "who.int",
  "un.org",
  "nasa.gov",
  "nih.gov",
  "bbc.com",
  "reuters.com",
  "anthropic.com"
];

// Sufixos que indicam domínios institucionais geralmente confiáveis
const TRUSTED_SUFFIXES = [
  ".gov",
  ".gov.br",
  ".edu",
  ".edu.br",
  ".mil",
  ".int"
];

// TLDs historicamente muito associados a phishing/spam/malware
const SUSPICIOUS_TLDS = [
  "zip", "review", "country", "kim", "cricket", "science", "work",
  "party", "gq", "cf", "tk", "ml", "ga", "top", "xyz", "click", "link",
  "loan", "download", "racing", "win"
];

// Encurtadores de link comuns (ocultam o destino real)
const URL_SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
  "buff.ly", "adf.ly", "cutt.ly", "shorte.st", "rebrand.ly", "s.id"
];

// Palavras comuns em golpes de phishing quando combinadas com marcas
const PHISHING_KEYWORDS = [
  "login", "verify", "secure", "account", "update", "confirm",
  "banco", "senha", "seguranca", "verificar", "atualizar", "suporte"
];

// Marcas frequentemente imitadas em ataques de phishing (usadas para detectar
// domínios "quase iguais", como paypal.com ou google.com)
const IMPERSONATED_BRANDS = [
  "google.com",
  "facebook.com",
  "instagram.com",
  "whatsapp.com",
  "paypal.com",
  "apple.com",
  "microsoft.com",
  "amazon.com",
  "netflix.com",
  "outlook.com",
  "gmail.com",
  "itau.com.br",
  "bradesco.com.br",
  "caixa.gov.br",
  "nubank.com.br",
  "mercadolivre.com.br",
  "santander.com.br",
  "picpay.com",
  "linkedin.com",
  "twitter.com",
  "tiktok.com"
];

if (typeof module !== "undefined") {
  module.exports = {
    TRUSTED_DOMAINS,
    TRUSTED_SUFFIXES,
    SUSPICIOUS_TLDS,
    URL_SHORTENERS,
    PHISHING_KEYWORDS,
    IMPERSONATED_BRANDS
  };
}
