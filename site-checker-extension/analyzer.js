function extrairHostname(urlString) {
  try {
    const url = new URL(urlString);
    return url;
  } catch (e) {
    return null;
  }
}

function ehEnderecoIP(hostname) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^\[?[0-9a-fA-F:]+\]?$/;
  return ipv4.test(hostname) || (hostname.includes(":") && ipv6.test(hostname));
}

function contarSubdominios(hostname) {
  const partes = hostname.split(".");
  return Math.max(0, partes.length - 2);
}

function temCaracteresSuspeitos(hostname) {
  // Detecta punycode (ataques de homógrafos) ou caracteres não-ASCII
  return hostname.includes("xn--") || /[^\x00-\x7F]/.test(hostname);
}

function extrairDominioRaiz(hostname) {
  const partes = hostname.split(".");
  if (partes.length <= 2) return hostname;
  return partes.slice(-2).join(".");
}

// Normaliza substituições comuns usadas para imitar marcas (google, paypal, etc.)
function normalizarHomografos(str) {
  return str
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/8/g, "b")
    .replace(/rn/g, "m")
    .replace(/vv/g, "w");
}

// Distância de Levenshtein simples, usada para achar domínios "quase iguais" a marcas conhecidas
function distanciaLevenshtein(a, b) {
  const linhas = a.length + 1;
  const colunas = b.length + 1;
  const custo = Array.from({ length: linhas }, () => new Array(colunas).fill(0));
  for (let i = 0; i < linhas; i++) custo[i][0] = i;
  for (let j = 0; j < colunas; j++) custo[0][j] = j;
  for (let i = 1; i < linhas; i++) {
    for (let j = 1; j < colunas; j++) {
      const substituicao = a[i - 1] === b[j - 1] ? 0 : 1;
      custo[i][j] = Math.min(
        custo[i - 1][j] + 1,       // remoção
        custo[i][j - 1] + 1,       // inserção
        custo[i - 1][j - 1] + substituicao // substituição
      );
    }
  }
  return custo[a.length][b.length];
}

// Verifica se o domínio é uma imitação (typosquatting) de uma marca conhecida
function detectarTyposquatting(hostname, listas) {
  const marcas = listas.IMPERSONATED_BRANDS || [];
  if (!marcas.length) return null;
  const raiz = extrairDominioRaiz(hostname);
  if (ehDominioConfiavel(hostname, listas)) return null;

  const raizNormalizada = normalizarHomografos(raiz);
  for (const marca of marcas) {
    if (raiz === marca) continue; // é o próprio domínio oficial
    const nomeMarca = marca.split(".")[0];
    if (nomeMarca.length <= 4) continue; // nomes muito curtos geram falsos positivos
    const limite = nomeMarca.length <= 6 ? 1 : 2;
    const distancia = distanciaLevenshtein(raizNormalizada, marca);
    if (distancia <= limite) return marca;
  }
  return null;
}

// comum em infraestrutura de malware e botnets
function pareceGeradoAleatoriamente(hostname) {
  const raiz = extrairDominioRaiz(hostname);
  const label = raiz.split(".")[0];
  if (label.length < 10) return false;
  const vogais = (label.match(/[aeiou]/gi) || []).length;
  const digitos = (label.match(/[0-9]/g) || []).length;
  const proporcaoVogais = vogais / label.length;
  const proporcaoDigitos = digitos / label.length;
  return proporcaoVogais < 0.2 || proporcaoDigitos > 0.35;
}

function ehDominioConfiavel(hostname, listas) {
  const raiz = extrairDominioRaiz(hostname);
  if (listas.TRUSTED_DOMAINS.some(d => hostname === d || hostname.endsWith("." + d) || raiz === d)) {
    return true;
  }
  if (listas.TRUSTED_SUFFIXES.some(suf => hostname.endsWith(suf))) {
    return true;
  }
  return false;
}

function analisarURL(urlString, listas) {
  const resultados = [];
  const url = extrairHostname(urlString);

  if (!url) {
    return {
      pontuacao: 0,
      nivel: "desconhecido",
      resultados: [{ pontos: 0, motivo: "Não foi possível interpretar esta URL.", tipo: "info" }]
    };
  }

  const hostname = url.hostname.toLowerCase();
  let pontuacao = 50; // ponto de partida neutro

  // Páginas internas do navegador
  if (["chrome:", "edge:", "about:", "chrome-extension:"].includes(url.protocol)) {
    return {
      pontuacao: 100,
      nivel: "seguro",
      hostname,
      resultados: [{ pontos: 0, motivo: "Esta é uma página interna do navegador.", tipo: "info" }]
    };
  }

  // Esquemas de URL perigosos (execução de código / conteúdo embutido)
  if (["javascript:", "data:", "vbscript:"].includes(url.protocol)) {
    return {
      pontuacao: 0,
      nivel: "risco",
      hostname: hostname || "(sem domínio)",
      resultados: [{ pontos: -100, motivo: "Este link usa um esquema de URL perigoso (execução de código ou conteúdo embutido), comum em ataques de injeção.", tipo: "negativo" }]
    };
  }

  // 1. HTTPS
  if (url.protocol === "https:") {
    pontuacao += 15;
    resultados.push({ pontos: 15, motivo: "Conexão criptografada via HTTPS.", tipo: "positivo" });
  } else {
    pontuacao -= 30;
    resultados.push({ pontos: -30, motivo: "Site NÃO usa HTTPS — dados podem ser interceptados.", tipo: "negativo" });
  }

  // 2. Domínio confiável conhecido
  if (ehDominioConfiavel(hostname, listas)) {
    pontuacao += 30;
    resultados.push({ pontos: 30, motivo: "Domínio reconhecido como fonte confiável (ex: institucional, enciclopédico ou grande organização).", tipo: "positivo" });
  }

  // 3. Endereço IP no lugar de domínio
  if (ehEnderecoIP(hostname)) {
    pontuacao -= 25;
    resultados.push({ pontos: -25, motivo: "O site usa um endereço IP em vez de um nome de domínio — comum em golpes.", tipo: "negativo" });
  }

  // 4. Excesso de subdomínios
  const numSubdominios = contarSubdominios(hostname);
  if (numSubdominios >= 3) {
    pontuacao -= 15;
    resultados.push({ pontos: -15, motivo: `Muitos subdomínios (${numSubdominios}) — técnica usada para disfarçar o domínio real.`, tipo: "negativo" });
  }

  // 5. Caracteres suspeitos / punycode (ataques de homógrafo)
  if (temCaracteresSuspeitos(hostname)) {
    pontuacao -= 25;
    resultados.push({ pontos: -25, motivo: "O domínio contém caracteres codificados (punycode) que podem imitar letras de marcas conhecidas.", tipo: "negativo" });
  }

  // 6. TLD suspeito
  const tld = hostname.split(".").pop();
  if (listas.SUSPICIOUS_TLDS.includes(tld)) {
    pontuacao -= 15;
    resultados.push({ pontos: -15, motivo: `A extensão ".${tld}" é frequentemente associada a spam ou phishing.`, tipo: "negativo" });
  }

  // 7. Encurtador de link
  if (listas.URL_SHORTENERS.some(s => hostname === s)) {
    pontuacao -= 10;
    resultados.push({ pontos: -10, motivo: "Este é um encurtador de link — o destino real está oculto.", tipo: "negativo" });
  }

  // 8. Palavras de phishing combinadas com hífens no domínio
  const temHifenComPalavraSuspeita = hostname.includes("-") &&
    listas.PHISHING_KEYWORDS.some(k => hostname.includes(k));
  if (temHifenComPalavraSuspeita) {
    pontuacao -= 20;
    resultados.push({ pontos: -20, motivo: "O domínio combina hífens com palavras como 'login', 'verify' ou 'secure' — padrão comum em phishing.", tipo: "negativo" });
  }

  // 9. Porta não padrão
  if (url.port && !["80", "443", ""].includes(url.port)) {
    pontuacao -= 5;
    resultados.push({ pontos: -5, motivo: `O site usa uma porta não padrão (${url.port}).`, tipo: "info" });
  }

  // 10. Typosquatting / imitação de marca conhecida (ex: paypal.com, google.com)
  const marcaImitada = detectarTyposquatting(hostname, listas);
  if (marcaImitada) {
    pontuacao -= 35;
    resultados.push({ pontos: -35, motivo: `O domínio é muito parecido com "${marcaImitada}", mas não é o domínio oficial — forte indício de phishing por imitação de marca.`, tipo: "negativo" });
  }

  // 11. Usuário/credencial embutido na URL (disfarça o domínio real, ex: banco.com@golpe.com)
  if (url.username) {
    pontuacao -= 20;
    resultados.push({ pontos: -20, motivo: "A URL contém um nome de usuário embutido antes do domínio real — técnica usada para disfarçar para onde o link realmente leva.", tipo: "negativo" });
  }

  // 12. Domínio com aparência gerada automaticamente (possível DGA / infraestrutura de malware)
  if (pareceGeradoAleatoriamente(hostname)) {
    pontuacao -= 15;
    resultados.push({ pontos: -15, motivo: "O nome do domínio tem aparência aleatória (poucas vogais ou muitos números) — padrão comum em domínios gerados automaticamente por malware.", tipo: "negativo" });
  }

  pontuacao = Math.max(0, Math.min(100, pontuacao));

  let nivel;
  if (pontuacao >= 75) nivel = "seguro";
  else if (pontuacao >= 45) nivel = "atencao";
  else nivel = "risco";

  return { pontuacao, nivel, hostname, resultados };
}

async function verificarSafeBrowsing(urlString, apiKey) {
  if (!apiKey) return { verificado: false };
  try {
    const resposta = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "site-seguro-extensao", clientVersion: "1.1.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: urlString }]
          }
        })
      }
    );

    if (!resposta.ok) {
      return { verificado: false, erro: true };
    }

    const dados = await resposta.json();
    const ameacas = dados.matches || [];
    return {
      verificado: true,
      malicioso: ameacas.length > 0,
      tipos: ameacas.map(a => a.threatType)
    };
  } catch (e) {
    return { verificado: false, erro: true };
  }
}

if (typeof module !== "undefined") {
  module.exports = { analisarURL, verificarSafeBrowsing };
}
