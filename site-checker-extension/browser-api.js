// Chrome, Edge, Brave e Firefox usam a mesma base de WebExtensions.
// Alguns navegadores chamam a API de "browser" e outros de "chrome".
const navegador = globalThis.browser || globalThis.chrome;

function obterConfiguracao(chave) {
  return navegador.storage.sync.get([chave]);
}

function salvarConfiguracao(dados) {
  return navegador.storage.sync.set(dados);
}
