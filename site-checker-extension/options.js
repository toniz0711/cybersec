document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["safeBrowsingApiKey"], data => {
    if (data.safeBrowsingApiKey) {
      document.getElementById("apiKey").value = data.safeBrowsingApiKey;
    }
  });
  carregarMonitoramento();
});

document.getElementById("save").addEventListener("click", () => {
  const apiKey = document.getElementById("apiKey").value.trim();
  chrome.storage.sync.set({ safeBrowsingApiKey: apiKey }, () => {
    const status = document.getElementById("status");
    status.textContent = "Configurações salvas!";
    setTimeout(() => (status.textContent = ""), 2000);
  });
});

function carregarMonitoramento() {
  chrome.storage.local.get(["monitoramentoAtivo", "eventosMonitoramento"], data => {
    document.getElementById("monitoramentoAtivo").checked =
      data.monitoramentoAtivo === true;

    const lista = document.getElementById("eventos");
    lista.replaceChildren();
    (data.eventosMonitoramento || []).slice(0, 20).forEach(evento => {
      const item = document.createElement("li");
      const quando = new Date(evento.registradoEm).toLocaleString();
      const descricao = evento.tipo === "redirecionamento"
        ? `Redirecionamento: ${evento.origem} → ${evento.destino} (HTTP ${evento.codigoHttp})`
        : `Download: ${evento.urlFinal}`;
      item.textContent = `${quando} — ${descricao}`;
      lista.appendChild(item);
    });
  });
}

document.getElementById("monitoramentoAtivo").addEventListener("change", evento => {
  chrome.storage.local.set({ monitoramentoAtivo: evento.target.checked }, carregarMonitoramento);
});

document.getElementById("limparEventos").addEventListener("click", () => {
  chrome.storage.local.set({ eventosMonitoramento: [] }, carregarMonitoramento);
});
