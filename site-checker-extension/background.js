const CHAVE_EVENTOS = "eventosMonitoramento";
const CHAVE_MONITORAMENTO = "monitoramentoAtivo";
const LIMITE_EVENTOS = 200;

let filaDeGravacao = Promise.resolve();

function normalizarUrl(valor) {
  try {
    const url = new URL(valor);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch (erro) {
    return null;
  }
}

function registrarEvento(evento) {
  filaDeGravacao = filaDeGravacao
    .then(async () => {
      const configuracao = await chrome.storage.local.get(CHAVE_MONITORAMENTO);
      if (configuracao[CHAVE_MONITORAMENTO] !== true) return;

      const dados = await chrome.storage.local.get(CHAVE_EVENTOS);
      const eventos = dados[CHAVE_EVENTOS] || [];
      eventos.unshift({ ...evento, registradoEm: new Date().toISOString() });
      await chrome.storage.local.set({
        [CHAVE_EVENTOS]: eventos.slice(0, LIMITE_EVENTOS)
      });
    })
    .catch(erro => {
      console.error("Não foi possível registrar o evento:", erro);
    });
}

chrome.webRequest.onBeforeRedirect.addListener(
  detalhes => {
    const origem = normalizarUrl(detalhes.url);
    const destino = normalizarUrl(detalhes.redirectUrl);
    if (!origem || !destino) return;

    registrarEvento({
      tipo: "redirecionamento",
      origem,
      destino,
      codigoHttp: detalhes.statusCode
    });
  },
  { urls: ["http://*/*", "https://*/*"], types: ["main_frame"] }
);

chrome.downloads.onCreated.addListener(download => {
  const url = normalizarUrl(download.url);
  if (!url) return;

  const urlFinal = normalizarUrl(download.finalUrl);
  registrarEvento({
    tipo: "download",
    url,
    urlFinal: urlFinal || url,
    mime: download.mime || "",
    tamanhoBytes: download.totalBytes >= 0 ? download.totalBytes : null
  });
});
