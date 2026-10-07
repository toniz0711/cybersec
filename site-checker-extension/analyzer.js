// Analisa uma URL usando regras simples de segurança.

function interpretarURL(texto) {
  try {
    return new URL(texto);
  } catch {
    return null;
  }
}

function ehEnderecoIP(hostname) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^\[?[0-9a-fA-F:]+\]?$/;
  return ipv4.test(hostname) || (hostname.includes(":") && ipv6.test(hostname));
}

const SUFIXOS_COMPOSTOS = [
  "com.br", "org.br", "net.br", "gov.br", "edu.br", "mil.br",
  "co.uk", "org.uk", "com.au", "com.ar", "com.pt"
];

// Retorna o domínio principal. Ex.: www.google.com -> google.com
function extrairDominioRaiz(hostname) {
  const partes = hostname.split(".");
  const ultimosDois = partes.slice(-2).join(".");
  const quantidade = SUFIXOS_COMPOSTOS.includes(ultimosDois) ? 3 : 2;

  if (partes.length <= quantidade) return hostname;
  return partes.slice(-quantidade).join(".");
}

function contarSubdominios(hostname) {
  const partes = hostname.split(".").length;
  const partesDaRaiz = extrairDominioRaiz(hostname).split(".").length;
  return Math.max(0, partes - partesDaRaiz);
}

function temCaracteresSuspeitos(hostname) {
  return hostname.includes("xn--") || /[^\x00-\x7F]/.test(hostname);
}

// Troca números por letras que podem parecer iguais.
function normalizarNome(texto) {
  return texto
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/8/g, "b")
    .replace(/rn/g, "m")
    .replace(/vv/g, "w");
}

// Conta quantas alterações são necessárias entre duas palavras.
// Usa duas linhas em vez de uma tabela grande, deixando o cálculo mais simples.
function distanciaEntrePalavras(a, b) {
  let linhaAnterior = [];
  let linhaAtual = [];

  for (let j = 0; j <= b.length; j++) linhaAnterior[j] = j;

  for (let i = 1; i <= a.length; i++) {
    linhaAtual[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      linhaAtual[j] = Math.min(
        linhaAnterior[j] + 1,
        linhaAtual[j - 1] + 1,
        linhaAnterior[j - 1] + custo
      );
    }

    linhaAnterior = linhaAtual;
    linhaAtual = [];
  }

  return linhaAnterior[b.length];
}

function ehDominioConfiavel(hostname, listas) {
  const raiz = extrairDominioRaiz(hostname);
  const dominios = listas.TRUSTED_DOMAINS || [];
  const sufixos = listas.TRUSTED_SUFFIXES || [];

  for (const dominio of dominios) {
    if (hostname === dominio || hostname.endsWith("." + dominio) || raiz === dominio) {
      return true;
    }
  }

  for (const sufixo of sufixos) {
    if (hostname.endsWith(sufixo)) return true;
  }

  return false;
}

function detectarTyposquatting(hostname, listas) {
  const marcas = listas.IMPERSONATED_BRANDS || [];
  const raiz = extrairDominioRaiz(hostname);

  if (!marcas.length || ehDominioConfiavel(hostname, listas)) return null;
  if ((listas.EXCECOES_TYPOSQUATTING || []).includes(raiz)) return null;

  const nomeDoSite = normalizarNome(raiz.split(".")[0]);

  for (const marca of marcas) {
    if (raiz === marca) continue;

    const nomeDaMarca = normalizarNome(marca.split(".")[0]);
    if (nomeDaMarca.length <= 4) continue;

    // Nomes maiores aceitam até duas diferenças; nomes menores, uma.
    const limite = nomeDaMarca.length <= 6 ? 1 : 2;

    if (distanciaEntrePalavras(nomeDoSite, nomeDaMarca) <= limite) {
      return marca;
    }
  }

  return null;
}

function pareceGeradoAleatoriamente(hostname) {
  const nome = extrairDominioRaiz(hostname).split(".")[0];
  if (nome.length < 10) return false;

  const vogais = (nome.match(/[aeiou]/gi) || []).length;
  const numeros = (nome.match(/[0-9]/g) || []).length;

  return vogais / nome.length < 0.2 || numeros / nome.length > 0.35;
}

function analisarURL(urlString, listas) {
  const resultados = [];
  const url = interpretarURL(urlString);

  if (!url) {
    return {
      pontuacao: 0,
      nivel: "desconhecido",
      resultados: [{
        pontos: 0,
        motivo: "Não foi possível interpretar esta URL.",
        tipo: "info"
      }]
    };
  }

  const hostname = url.hostname.toLowerCase();
  let pontuacao = 50;

  const protocolosInternos = ["chrome:", "edge:", "brave:", "about:", "chrome-extension:", "file:"];
  const protocolosPerigosos = ["javascript:", "data:", "vbscript:"];

  if (protocolosInternos.includes(url.protocol)) {
    return {
      pontuacao: 100,
      nivel: "seguro",
      hostname,
      resultados: [{
        pontos: 0,
        motivo: "Esta é uma página interna do navegador ou um arquivo local.",
        tipo: "info"
      }]
    };
  }

  if (protocolosPerigosos.includes(url.protocol)) {
    return {
      pontuacao: 0,
      nivel: "risco",
      hostname: hostname || "(sem domínio)",
      resultados: [{
        pontos: -100,
        motivo: "O link usa um protocolo que pode executar código ou carregar conteúdo de forma insegura.",
        tipo: "negativo"
      }]
    };
  }

  // HTTPS
  if (url.protocol === "https:") {
    pontuacao += 15;
    resultados.push({ pontos: 15, motivo: "A conexão usa HTTPS.", tipo: "positivo" });
  } else {
    pontuacao -= 30;
    resultados.push({ pontos: -30, motivo: "O site não usa HTTPS.", tipo: "negativo" });
  }

  // Domínio conhecido
  if (ehDominioConfiavel(hostname, listas)) {
    pontuacao += 30;
    resultados.push({
      pontos: 30,
      motivo: "O domínio está na lista de domínios conhecidos do projeto.",
      tipo: "positivo"
    });
  }

  // IP no lugar do domínio
  if (ehEnderecoIP(hostname)) {
    pontuacao -= 25;
    resultados.push({
      pontos: -25,
      motivo: "O site usa um endereço IP no lugar de um nome de domínio.",
      tipo: "negativo"
    });
  }

  // Muitos subdomínios
  const subdominios = contarSubdominios(hostname);
  if (subdominios >= 3) {
    pontuacao -= 15;
    resultados.push({
      pontos: -15,
      motivo: `O endereço possui muitos subdomínios (${subdominios}).`,
      tipo: "negativo"
    });
  }

  // Caracteres que podem ser usados para imitar outros endereços
  if (temCaracteresSuspeitos(hostname)) {
    pontuacao -= 25;
    resultados.push({
      pontos: -25,
      motivo: "O domínio possui caracteres que podem ser usados para imitar outros endereços.",
      tipo: "negativo"
    });
  }

  // Extensão do domínio
  const tld = hostname.split(".").pop();
  if ((listas.SUSPICIOUS_TLDS || []).includes(tld)) {
    pontuacao -= 15;
    resultados.push({
      pontos: -15,
      motivo: `A extensão .${tld} está na lista de extensões que merecem atenção.`,
      tipo: "negativo"
    });
  }

  // Encurtador
  if ((listas.URL_SHORTENERS || []).includes(hostname)) {
    pontuacao -= 10;
    resultados.push({
      pontos: -10,
      motivo: "O endereço usa um encurtador de links, escondendo o destino final.",
      tipo: "negativo"
    });
  }

  // Palavras comuns em golpes junto com hífen
  const temPalavraDePhishing = (listas.PHISHING_KEYWORDS || []).some(function(palavra) {
    return hostname.includes(palavra);
  });

  if (hostname.includes("-") && temPalavraDePhishing) {
    pontuacao -= 25;
    resultados.push({
      pontos: -25,
      motivo: "O domínio combina hífen com palavras comuns em golpes, como login, verify ou secure.",
      tipo: "negativo"
    });
  }

  // Porta diferente das portas mais comuns
  if (url.port && url.port !== "80" && url.port !== "443") {
    pontuacao -= 5;
    resultados.push({
      pontos: -5,
      motivo: `O site usa uma porta diferente das portas mais comuns (${url.port}).`,
      tipo: "info"
    });
  }

  // Possível imitação de marca
  const marcaImitada = detectarTyposquatting(hostname, listas);
  if (marcaImitada) {
    pontuacao -= 35;
    resultados.push({
      pontos: -35,
      motivo: `O domínio é parecido com ${marcaImitada}, mas não é o domínio oficial listado no projeto.`,
      tipo: "negativo"
    });
  }

  // Exemplo: exemplo.com@outro.com
  if (url.username) {
    pontuacao -= 30;
    resultados.push({
      pontos: -30,
      motivo: "A URL possui um nome de usuário antes do domínio real, o que pode esconder o destino do link.",
      tipo: "negativo"
    });
  }

  // Nome de domínio com aparência incomum
  if (pareceGeradoAleatoriamente(hostname)) {
    pontuacao -= 15;
    resultados.push({
      pontos: -15,
      motivo: "O nome do domínio tem uma aparência incomum, com poucos caracteres que formam palavras ou muitos números.",
      tipo: "negativo"
    });
  }

  pontuacao = Math.max(0, Math.min(100, pontuacao));

  let nivel = "risco";
  if (pontuacao >= 75) {
    nivel = "seguro";
  } else if (pontuacao >= 45) {
    nivel = "atencao";
  }

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
          client: { clientId: "site-seguro-extensao", clientVersion: "1.3.0" },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: urlString }]
          }
        })
      }
    );

    if (!resposta.ok) return { verificado: false, erro: true };

    const dados = await resposta.json();
    const ameacas = dados.matches || [];

    return {
      verificado: true,
      malicioso: ameacas.length > 0,
      tipos: ameacas.map(function(item) { return item.threatType; })
    };
  } catch {
    return { verificado: false, erro: true };
  }
}

if (typeof module !== "undefined") {
  module.exports = { analisarURL, verificarSafeBrowsing };
}
