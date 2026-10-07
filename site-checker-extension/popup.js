const CIRCUNFERENCIA = 2 * Math.PI * 52;

function corPorNivel(nivel) {
  if (nivel === "seguro") return "#4caf50";
  if (nivel === "atencao") return "#ffb020";
  return "#ff5252";
}

function textoPorNivel(nivel) {
  if (nivel === "seguro") return "✓ Poucos sinais de risco";
  if (nivel === "atencao") return "⚠ Atenção necessária";
  return "✕ Sinais de risco encontrados";
}

function renderizar(resultado) {
  const pontuacao = resultado.pontuacao;
  const nivel = resultado.nivel;
  const hostname = resultado.hostname;
  const resultados = resultado.resultados;

  document.getElementById("url-display").textContent = hostname || "URL desconhecida";

  const ring = document.getElementById("ring-fill");
  const offset = CIRCUNFERENCIA - (pontuacao / 100) * CIRCUNFERENCIA;
  ring.style.strokeDasharray = CIRCUNFERENCIA;
  ring.style.strokeDashoffset = offset;
  ring.style.stroke = corPorNivel(nivel);

  document.getElementById("score-number").textContent = pontuacao;

  const badge = document.getElementById("badge");
  badge.textContent = textoPorNivel(nivel);
  badge.className = "badge " + nivel;

  const detalhes = document.getElementById("details");
  detalhes.innerHTML = "";

  resultados.forEach(function(itemResultado) {
    const item = document.createElement("div");
    item.className = "detail-item " + itemResultado.tipo;

    let prefixo = "ℹ ";
    if (itemResultado.tipo === "positivo") prefixo = "✓ ";
    if (itemResultado.tipo === "negativo") prefixo = "✕ ";

    item.textContent = prefixo + itemResultado.motivo;
    detalhes.appendChild(item);
  });
}

function atualizarStatusSafeBrowsing(texto, tipo) {
  const elemento = document.getElementById("sb-status");
  elemento.textContent = texto;
  elemento.className = "sb-status" + (tipo ? " " + tipo : "");
}

async function verificarComSafeBrowsing(tab, resultadoLocal) {
  if (!tab.url || !/^https?:/i.test(tab.url)) return;

  const configuracao = await obterConfiguracao("safeBrowsingApiKey");
  const apiKey = configuracao.safeBrowsingApiKey || CHAVE_API_PADRAO;
  if (!apiKey) return;

  atualizarStatusSafeBrowsing("Consultando o Google Safe Browsing...", "checando");
  const resultado = await verificarSafeBrowsing(tab.url, apiKey);

  if (!resultado.verificado) {
    atualizarStatusSafeBrowsing("Não foi possível consultar o Safe Browsing agora.", "erro");
    return;
  }

  if (resultado.malicioso) {
    atualizarStatusSafeBrowsing("Ameaça encontrada na base do Google Safe Browsing.", "malicioso");

    const resultadoAtualizado = Object.assign({}, resultadoLocal, {
      pontuacao: 0,
      nivel: "risco",
      resultados: [{
        pontos: -100,
        motivo: `O endereço aparece em uma lista de ameaças conhecidas (${resultado.tipos.join(", ")}).`,
        tipo: "negativo"
      }].concat(resultadoLocal.resultados)
    });

    renderizar(resultadoAtualizado);
    return;
  }

  atualizarStatusSafeBrowsing("Nenhuma ameaça conhecida foi encontrada.", "limpo");
}

async function rodarAnalise() {
  atualizarStatusSafeBrowsing("");

  const abas = await navegador.tabs.query({ active: true, currentWindow: true });
  const aba = abas[0];
  if (!aba || !aba.url) return;

  const listas = {
    TRUSTED_DOMAINS,
    TRUSTED_SUFFIXES,
    SUSPICIOUS_TLDS,
    URL_SHORTENERS,
    PHISHING_KEYWORDS,
    IMPERSONATED_BRANDS,
    EXCECOES_TYPOSQUATTING
  };

  const resultado = analisarURL(aba.url, listas);
  renderizar(resultado);
  await verificarComSafeBrowsing(aba, resultado);
}

document.addEventListener("DOMContentLoaded", rodarAnalise);

const botao = document.getElementById("rescan");
if (botao) {
  botao.addEventListener("click", rodarAnalise);
}
