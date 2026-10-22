// Código principal do site: menu, números do início da página e quiz.

function createParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const bolinha = document.createElement('div');
    const tamanho = Math.random() * 3 + 1;
    bolinha.className = 'particle';
    bolinha.style.left = Math.random() * 100 + '%';
    bolinha.style.animationDuration = 8 + Math.random() * 15 + 's';
    bolinha.style.animationDelay = Math.random() * 10 + 's';
    bolinha.style.width = tamanho + 'px';
    bolinha.style.height = tamanho + 'px';
    container.appendChild(bolinha);
  }
}

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  function fecharMenu() {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', function () {
    const aberto = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', aberto);
  });

  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', fecharMenu);
  }

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(3,7,18,0.97)';
    } else {
      navbar.style.background = 'rgba(3,7,18,0.85)';
    }

    let atual = '';
    for (let i = 0; i < sections.length; i++) {
      if (window.scrollY >= sections[i].offsetTop - 120) {
        atual = sections[i].id;
      }
    }
    for (let i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === '#' + atual) {
        links[i].classList.add('active');
      } else {
        links[i].classList.remove('active');
      }
    }
  });
}

function mostrarAoRolar() {
  const itens = document.querySelectorAll('.animate-up');
  for (let i = 0; i < itens.length; i++) {
    const topo = itens[i].getBoundingClientRect().top;
    if (topo < window.innerHeight - 60) {
      itens[i].classList.add('visible');
    }
  }
}

function typewriter(elemento, texto, velocidade) {
  let i = 0;
  elemento.textContent = '';
  const timer = setInterval(function () {
    elemento.textContent += texto[i];
    i++;
    if (i >= texto.length) clearInterval(timer);
  }, velocidade);
}

function contar(elemento, valorFinal, formatar) {
  let atual = 0;
  const passo = valorFinal / 60;
  const timer = setInterval(function () {
    atual = atual + passo;
    if (atual >= valorFinal) {
      atual = valorFinal;
      clearInterval(timer);
    }
    elemento.textContent = formatar(Math.floor(atual));
  }, 30);
}

/*
  Números do início da página

  Esses números não são digitados por mim. Toda vez que alguém abre o site,
  ele consulta a API pública do Have I Been Pwned, que guarda a lista de
  vazamentos de dados conhecidos. Com a resposta eu faço duas contas:
    - vazamentos = quantos itens vieram na lista
    - contas expostas = soma do campo PwnCount de todos os vazamentos

  A lista é grande e a própria documentação pede para não consultar sem
  necessidade, então a resposta fica salva no navegador por 1 hora
  (localStorage). Se a internet cair, o site mostra o último valor salvo.
*/
const URL_VAZAMENTOS = 'https://haveibeenpwned.com/api/v3/breaches';
const URL_ULTIMO = 'https://haveibeenpwned.com/api/v3/latestBreach';
const UMA_HORA = 60 * 60 * 1000;

function formatarNumero(n) {
  if (n >= 1000000000) {
    return (n / 1000000000).toFixed(1).replace('.', ',') + ' bi';
  }
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1).replace('.', ',') + ' mi';
  }
  return n.toLocaleString('pt-BR');
}

function lerCache() {
  try {
    return JSON.parse(localStorage.getItem('dadosVazamentos'));
  } catch (erro) {
    return null;
  }
}

function salvarCache(dados) {
  try {
    localStorage.setItem('dadosVazamentos', JSON.stringify(dados));
  } catch (erro) {
  }
}

async function buscarDados() {
  const resposta1 = await fetch(URL_VAZAMENTOS);
  const lista = await resposta1.json();

  let totalContas = 0;
  for (let i = 0; i < lista.length; i++) {
    totalContas = totalContas + lista[i].PwnCount;
  }

  const resposta2 = await fetch(URL_ULTIMO);
  const ultimo = await resposta2.json();

  return {
    vazamentos: lista.length,
    contas: totalContas,
    ultimoNome: ultimo.Title,
    ultimaData: ultimo.AddedDate,
    atualizadoEm: Date.now()
  };
}

async function carregarEstatisticas() {
  const elVazamentos = document.getElementById('stat-vazamentos');
  const elContas = document.getElementById('stat-contas');
  const elUltimo = document.getElementById('ultimo-vazamento');
  const elQuiz = document.getElementById('stat-quiz');

  if (elQuiz) contar(elQuiz, quizQuestions.length, formatarNumero);
  if (!elVazamentos) return;

  // usa o que está salvo e só busca de novo se tiver passado mais de 1 hora
  let dados = lerCache();
  const cacheNovo = dados && Date.now() - dados.atualizadoEm < UMA_HORA;

  if (!cacheNovo) {
    try {
      dados = await buscarDados();
      salvarCache(dados);
    } catch (erro) {
      console.log('Não deu para buscar os dados agora:', erro);
    }
  }

  if (!dados) {
    elVazamentos.textContent = 'indisponível';
    elContas.textContent = 'indisponível';
    return;
  }

  contar(elVazamentos, dados.vazamentos, formatarNumero);
  contar(elContas, dados.contas, formatarNumero);

  if (elUltimo && dados.ultimoNome) {
    const data = new Date(dados.ultimaData).toLocaleDateString('pt-BR');
    elUltimo.textContent = 'Último vazamento adicionado: ' + dados.ultimoNome + ' (' + data + '). ';
  }
}

const quizQuestions = [
  {
    q: "O que é phishing?",
    options: [
      "Um tipo de antivírus moderno",
      "Uma técnica de fraude para roubar dados pessoais via e-mails ou sites falsos",
      "Um protocolo de segurança de rede",
      "Um programa de backup de dados"
    ],
    answer: 1,
    explanation: "Phishing é um ataque onde criminosos se passam por empresas ou pessoas legítimas para enganar vítimas e roubar senhas, dados bancários e informações pessoais."
  },
  {
    q: "Qual das seguintes é uma senha considerada FORTE?",
    options: [
      "senha123",
      "joao1990",
      "Tr@7!xK#9mQ2",
      "abcdef"
    ],
    answer: 2,
    explanation: "Senhas fortes combinam letras maiúsculas e minúsculas, números e símbolos, com pelo menos 12 caracteres. Evite informações pessoais ou palavras do dicionário."
  },
  {
    q: "O que significa HTTPS na barra de endereços do navegador?",
    options: [
      "O site possui muitas imagens de alta qualidade",
      "O site está localizado em um servidor rápido",
      "A comunicação entre seu navegador e o site é criptografada",
      "O site foi verificado pelo Google"
    ],
    answer: 2,
    explanation: "O 'S' em HTTPS significa 'Secure' (Seguro). Indica que os dados trafegados entre você e o site estão criptografados via protocolo TLS/SSL."
  },
  {
    q: "O que é autenticação de dois fatores (2FA)?",
    options: [
      "Usar duas senhas diferentes para acessar um site",
      "Um método que exige dois tipos de verificação de identidade",
      "Ter duas contas de e-mail ativas",
      "Um antivírus com dupla proteção"
    ],
    answer: 1,
    explanation: "A autenticação 2FA adiciona uma segunda camada de segurança além da senha, como um código SMS, app autenticador ou biometria, dificultando muito o acesso não autorizado."
  },
  {
    q: "Você recebeu um e-mail urgente do 'seu banco' pedindo para clicar num link e atualizar seus dados. O que você deve fazer?",
    options: [
      "Clicar no link imediatamente para não perder acesso à conta",
      "Responder o e-mail pedindo confirmação",
      "Ignorar e acessar o site do banco digitando o endereço diretamente no navegador",
      "Encaminhar o e-mail para amigos alertando"
    ],
    answer: 2,
    explanation: "Nunca clique em links de e-mails não solicitados. Acesse sempre o site oficial digitando o endereço diretamente no navegador. Bancos legítimos nunca pedem senhas por e-mail."
  },
  {
    q: "O que é uma VPN (Virtual Private Network)?",
    options: [
      "Um tipo de vírus que rouba dados em redes públicas",
      "Um serviço que criptografa sua conexão e oculta seu IP",
      "Um navegador mais seguro para a internet",
      "Um gerenciador de senhas online"
    ],
    answer: 1,
    explanation: "Uma VPN cria um túnel criptografado para sua conexão, protegendo seus dados em redes Wi-Fi públicas e ocultando seu endereço IP real."
  },
  {
    q: "Qual é o risco de usar a mesma senha em vários sites?",
    options: [
      "Nenhum risco, é uma prática recomendada para não esquecer",
      "Apenas torna o login mais lento",
      "Se um site for comprometido, todas as suas outras contas ficam vulneráveis",
      "Pode fazer o computador travar"
    ],
    answer: 2,
    explanation: "Usar senhas únicas em cada serviço é essencial. Se um site sofrer vazamento de dados, criminosos tentarão a mesma senha em outros serviços - prática chamada 'credential stuffing'."
  },
  {
    q: "O que é ransomware?",
    options: [
      "Um software que protege arquivos com senha",
      "Um malware que criptografa seus arquivos e exige resgate para liberá-los",
      "Um programa que monitora o uso da internet",
      "Um tipo de spam publicitário"
    ],
    answer: 1,
    explanation: "Ransomware sequestra seus arquivos criptografando-os e exige pagamento (geralmente em criptomoedas) para a recuperação. Manter backups atualizados é a melhor proteção."
  },
  {
    q: "Qual das opções abaixo é uma prática SEGURA ao usar Wi-Fi público?",
    options: [
      "Acessar o internet banking normalmente",
      "Desativar o firewall para ter melhor conexão",
      "Usar uma VPN e evitar transações financeiras",
      "Compartilhar a senha com desconhecidos por ser gratuito"
    ],
    answer: 2,
    explanation: "Em redes Wi-Fi públicas, use sempre VPN, evite acessar contas bancárias ou informações sensíveis, e confirme que está na rede correta (não em um 'evil twin')."
  },
  {
    q: "O que é um gerenciador de senhas?",
    options: [
      "Um caderno físico para anotar senhas",
      "Um software que gera e armazena senhas de forma criptografada",
      "Uma função do navegador para lembrar apenas e-mails",
      "Um serviço pago do governo para recuperar senhas esquecidas"
    ],
    answer: 1,
    explanation: "Gerenciadores de senhas (como Bitwarden, 1Password, KeePass) armazenam suas senhas com criptografia forte, permitindo usar senhas únicas e complexas para cada serviço sem precisar memorizá-las."
  }
];

/*
  Quiz

  Cada pergunta do vetor quizQuestions tem: q (o texto), options (as
  alternativas), answer (a posição da certa, começando do 0) e explanation
  (o que aparece depois de responder). As alternativas são embaralhadas a
  cada pergunta, por isso o código guarda a posição original de cada uma
  para saber qual é a correta.
*/
let currentQuestion = 0;
let score = 0;
let answered = false;
let ordem = [];

function embaralhar(lista) {
  return lista.sort(function () {
    return Math.random() - 0.5;
  });
}

function initQuiz() {
  const meta = document.getElementById('quiz-meta-perguntas');
  if (meta) meta.textContent = quizQuestions.length + ' perguntas';

  const botaoIniciar = document.getElementById('quiz-start-btn');
  if (!botaoIniciar) return;

  botaoIniciar.addEventListener('click', startQuiz);
  document.getElementById('quiz-restart-btn').addEventListener('click', startQuiz);
  document.getElementById('quiz-next-btn').addEventListener('click', nextQuestion);
}

function startQuiz() {
  currentQuestion = 0;
  score = 0;

  document.querySelector('.quiz-intro').style.display = 'none';
  document.querySelector('.quiz-result').style.display = 'none';
  document.querySelector('.quiz-active').style.display = 'block';

  renderQuestion();
}

function renderQuestion() {
  const q = quizQuestions[currentQuestion];
  const total = quizQuestions.length;
  const letras = ['A', 'B', 'C', 'D'];
  const container = document.querySelector('.quiz-options');
  const feedback = document.querySelector('.quiz-feedback');

  answered = false;

  ordem = [];
  for (let i = 0; i < q.options.length; i++) {
    ordem.push(i);
  }
  ordem = embaralhar(ordem);

  document.querySelector('.quiz-progress-bar').style.width = (currentQuestion / total) * 100 + '%';
  document.querySelector('.quiz-counter').innerHTML =
    'Pergunta <span>' + (currentQuestion + 1) + '</span> de <span>' + total + '</span>';
  document.querySelector('.quiz-question-text').textContent = q.q;

  container.innerHTML = '';
  for (let pos = 0; pos < ordem.length; pos++) {
    criarOpcao(container, q, ordem[pos], letras[pos]);
  }

  feedback.className = 'quiz-feedback';
  feedback.textContent = '';
  document.getElementById('quiz-next-btn').style.display = 'none';
}

function criarOpcao(container, q, indiceOriginal, letra) {
  const botao = document.createElement('button');
  const spanLetra = document.createElement('span');
  const spanTexto = document.createElement('span');

  botao.className = 'quiz-option';
  spanLetra.className = 'quiz-option-letter';
  spanLetra.textContent = letra;
  spanTexto.textContent = q.options[indiceOriginal];

  botao.appendChild(spanLetra);
  botao.appendChild(spanTexto);
  botao.addEventListener('click', function () {
    selectAnswer(indiceOriginal, botao);
  });
  container.appendChild(botao);
}

function selectAnswer(escolhida, botaoClicado) {
  if (answered) return;
  answered = true;

  const q = quizQuestions[currentQuestion];
  const botoes = document.querySelectorAll('.quiz-option');
  const feedback = document.querySelector('.quiz-feedback');

  for (let i = 0; i < botoes.length; i++) {
    botoes[i].disabled = true;
  }
  botoes[ordem.indexOf(q.answer)].classList.add('correct');

  if (escolhida === q.answer) {
    score++;
    feedback.className = 'quiz-feedback feedback-correct show';
    feedback.innerHTML = '<span>✓</span><span><strong>Correto!</strong> ' + q.explanation + '</span>';
  } else {
    botaoClicado.classList.add('wrong');
    feedback.className = 'quiz-feedback feedback-wrong show';
    feedback.innerHTML = '<span>✗</span><span><strong>Incorreto.</strong> ' + q.explanation + '</span>';
  }

  document.getElementById('quiz-next-btn').style.display = 'flex';
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion >= quizQuestions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  const total = quizQuestions.length;
  const pct = Math.round((score / total) * 100);
  const ring = document.querySelector('.ring-fill');
  const pctEl = document.querySelector('.result-score-pct');
  const titulo = document.querySelector('.result-title');
  const msg = document.querySelector('.result-msg');
  const circunferencia = 2 * Math.PI * 54;

  let cor = 'var(--secondary)';
  if (pct >= 80) {
    cor = 'var(--primary)';
  } else if (pct >= 50) {
    cor = '#fbbf24';
  }

  document.querySelector('.quiz-active').style.display = 'none';
  document.querySelector('.quiz-result').style.display = 'block';
  document.querySelector('.quiz-progress-bar').style.width = '100%';

  ring.style.strokeDasharray = circunferencia;
  ring.style.strokeDashoffset = circunferencia;
  ring.style.stroke = cor;
  pctEl.style.color = cor;
  setTimeout(function () {
    ring.style.strokeDashoffset = circunferencia - (pct / 100) * circunferencia;
  }, 100);

  let n = 0;
  pctEl.textContent = '0%';
  if (pct > 0) {
    const contador = setInterval(function () {
      n++;
      pctEl.textContent = n + '%';
      if (n >= pct) clearInterval(contador);
    }, 20);
  }

  document.querySelector('.num-correct').textContent = score;
  document.querySelector('.num-wrong').textContent = total - score;
  document.querySelector('.num-total').textContent = total;

  if (pct === 100) {
    titulo.textContent = '🛡️ Especialista em Segurança!';
    msg.textContent = 'Perfeito! Você domina os conceitos de segurança digital. Continue assim!';
  } else if (pct >= 80) {
    titulo.textContent = '✅ Ótimo Resultado!';
    msg.textContent = 'Você tem um bom conhecimento sobre segurança digital. Revise os tópicos que errou para ficar ainda mais seguro online.';
  } else if (pct >= 50) {
    titulo.textContent = '⚠️ Em Desenvolvimento';
    msg.textContent = 'Você conhece o básico, mas ainda há o que aprender. Explore o conteúdo do site e refaça o quiz!';
  } else {
    titulo.textContent = '🔓 Vulnerável!';
    msg.textContent = 'Suas práticas digitais precisam melhorar. Leia as dicas e proteja-se!';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  createParticles();
  initNavbar();
  initQuiz();
  carregarEstatisticas();

  mostrarAoRolar();
  window.addEventListener('scroll', mostrarAoRolar);

  const titulo = document.querySelector('.hero-typewriter');
  if (titulo) {
    const texto = titulo.textContent;
    setTimeout(function () {
      typewriter(titulo, texto, 55);
    }, 500);
  }
});
