const CIRCUNFERENCIA = 2 * Math.PI * 52;

function corPorNivel(nivel) {
  if (nivel === "seguro") return "#4caf50";
  if (nivel === "atencao") return "#ffb020";
  return "#ff5252";
}

function textoPorNivel(nivel) {
  if (nivel === "seguro") return "✅ Parece seguro";
  if (nivel === "atencao") return "⚠️ Atenção necessária";
  return "🚫 Sinais de risco";
}

function renderizar(resultadoAnalise) {
  const { pontuacao, nivel, hostname, resultados } = resultadoAnalise;

  document.getElementById("url-display").textContent = hostname || "URL desconhecida";

  const ringFill = document.getElementById("ring-fill");
  const offset = CIRCUNFERENCIA - (pontuacao / 100) * CIRCUNFERENCIA;
  ringFill.style.strokeDasharray = CIRCUNFERENCIA;
  ringFill.style.strokeDashoffset = offset;
  ringFill.style.stroke = corPorNivel(nivel);

  document.getElementById("score-number").textContent = pontuacao;

  const badge = document.getElementById("badge");
  badge.textContent = textoPorNivel(nivel);
  badge.className = "badge " + nivel;

  const detailsEl = document.getElementById("details");
  detailsEl.innerHTML = "";
  resultados.forEach(r => {
    const div = document.createElement("div");
    div.className = "detail-item " + r.tipo;
    const prefixo = r.tipo === "positivo" ? "✓ " : r.tipo === "negativo" ? "✗ " : "ℹ ";
    div.textContent = prefixo + r.motivo;
    detailsEl.appendChild(div);
  });
}

function atualizarStatusSafeBrowsing(texto, tipo) {
  const el = document.getElementById("sb-status");
  if (!el) return;
  el.textContent = texto;
  el.className = "sb-status" + (tipo ? " " + tipo : "");
}

// se houver chave configurada, confirma no Google Safe Browsing depois da análise local
async function verificarComSafeBrowsing(tab, resultadoHeuristico) {
  atualizarStatusSafeBrowsing("", "");

  if (!tab.url || !/^https?:/i.test(tab.url)) return;

  const dadosStorage = await new Promise(resolve =>
    chrome.storage.sync.get(["safeBrowsingApiKey"], resolve)
  );
  const apiKey = (dadosStorage.safeBrowsingApiKey || "").trim();
  if (!apiKey) {
    atualizarStatusSafeBrowsing(
      "ℹ️ Configure sua chave da API do Google Safe Browsing nas opções.",
      "erro"
    );
    return;
  }

  atualizarStatusSafeBrowsing("🔍 Consultando Google Safe Browsing...", "checando");

  const resultadoSB = await verificarSafeBrowsing(tab.url, apiKey);

  if (!resultadoSB.verificado) {
    let mensagem = "Falha de rede ao acessar o Google Safe Browsing.";
    if (resultadoSB.status === 400) {
      mensagem = "Requisição rejeitada (HTTP 400). Confira o formato da chamada.";
    } else if (resultadoSB.status === 403) {
      mensagem = "Acesso negado (HTTP 403). Confira a chave, se a API está ativada no Google Cloud e as restrições da chave.";
    } else if (resultadoSB.status === 429) {
      mensagem = "Limite de consultas excedido (HTTP 429). Confira a quota do projeto Google Cloud.";
    } else if (resultadoSB.status >= 500) {
      mensagem = `Serviço do Google indisponível (HTTP ${resultadoSB.status}). Tente novamente mais tarde.`;
    } else if (resultadoSB.status) {
      mensagem = `O Google Safe Browsing respondeu com HTTP ${resultadoSB.status}.`;
    }
    atualizarStatusSafeBrowsing(
      `⚠️ ${mensagem}`,
      "erro"
    );
    return;
  }

  if (resultadoSB.malicioso) {
    atualizarStatusSafeBrowsing("🚨 Ameaça confirmada pelo Google Safe Browsing!", "malicioso");
    renderizar({
      ...resultadoHeuristico,
      pontuacao: 0,
      nivel: "risco",
      resultados: [
        {
          pontos: -100,
          motivo: `Este site está na lista de ameaças conhecidas do Google Safe Browsing (${resultadoSB.tipos.join(", ")}).`,
          tipo: "negativo"
        },
        ...resultadoHeuristico.resultados
      ]
    });
  } else {
    atualizarStatusSafeBrowsing("✓ Nenhuma ameaça conhecida (Google Safe Browsing)", "limpo");
    const pontuacaoAjustada = Math.min(100, resultadoHeuristico.pontuacao + 5);
    renderizar({
      ...resultadoHeuristico,
      pontuacao: pontuacaoAjustada,
      nivel: pontuacaoAjustada >= 75 ? "seguro" : pontuacaoAjustada >= 45 ? "atencao" : "risco",
      resultados: [
        ...resultadoHeuristico.resultados,
        { pontos: 5, motivo: "Nenhuma ameaça conhecida encontrada na base do Google Safe Browsing.", tipo: "positivo" }
      ]
    });
  }
}

function rodarAnalise() {
  atualizarStatusSafeBrowsing("", "");
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    if (!tab || !tab.url) return;
    const listas = {
      TRUSTED_DOMAINS, TRUSTED_SUFFIXES, SUSPICIOUS_TLDS, URL_SHORTENERS,
      PHISHING_KEYWORDS, IMPERSONATED_BRANDS, EXCECOES_TYPOSQUATTING
    };
    const resultado = analisarURL(tab.url, listas);
    renderizar(resultado);
    verificarComSafeBrowsing(tab, resultado);
  });
}

document.addEventListener("DOMContentLoaded", rodarAnalise);
document.getElementById("rescan")?.addEventListener("click", rodarAnalise);
