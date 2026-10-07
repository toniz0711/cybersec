// partículas do hero
function createParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    const tamanho = Math.random() * 3 + 1;
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = 8 + Math.random() * 15 + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.width = p.style.height = tamanho + 'px';
    container.appendChild(p);
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

  hamburger.addEventListener('click', () => {
    const aberto = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', aberto);
  });
  links.forEach(l => l.addEventListener('click', fecharMenu));

  window.addEventListener('scroll', () => {
    navbar.style.background = window.scrollY > 50
      ? 'rgba(3,7,18,0.97)'
      : 'rgba(3,7,18,0.85)';

    // marca no menu a seção que está na tela
    let atual = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) atual = sec.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + atual);
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
}

function typewriter(el, texto, velocidade = 60) {
  let i = 0;
  el.textContent = '';
  const timer = setInterval(() => {
    el.textContent += texto[i++];
    if (i >= texto.length) clearInterval(timer);
  }, velocidade);
}

function animateCounter(el, alvo, sufixo = '') {
  const duracao = 2000;
  let inicio = null;

  function passo(agora) {
    if (!inicio) inicio = agora;
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const suave = 1 - Math.pow(1 - progresso, 3);
    el.textContent = Math.floor(suave * alvo) + sufixo;
    if (progresso < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.counter, 10), el.dataset.suffix || '');
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
}

// ---------- quiz ----------

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
    explanation: "Usar senhas únicas em cada serviço é essencial. Se um site sofrer vazamento de dados, criminosos tentarão a mesma senha em outros serviços — prática chamada 'credential stuffing'."
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

let currentQuestion = 0;
let score = 0;
let answered = false;
let ordem = []; // índices das opções embaralhadas da pergunta atual

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initQuiz() {
  document.getElementById('quiz-start-btn').addEventListener('click', startQuiz);
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
  ordem = embaralhar(q.options.map((_, i) => i));

  document.querySelector('.quiz-progress-bar').style.width = (currentQuestion / total) * 100 + '%';
  document.querySelector('.quiz-counter').innerHTML =
    `Pergunta <span>${currentQuestion + 1}</span> de <span>${total}</span>`;
  document.querySelector('.quiz-question-text').textContent = q.q;

  container.innerHTML = '';
  ordem.forEach((indiceOriginal, pos) => {
    const btn = document.createElement('button');
    const letra = document.createElement('span');
    const texto = document.createElement('span');

    btn.className = 'quiz-option';
    letra.className = 'quiz-option-letter';
    letra.textContent = letras[pos];
    texto.textContent = q.options[indiceOriginal];
    btn.append(letra, texto);

    btn.addEventListener('click', () => selectAnswer(indiceOriginal, btn));
    container.appendChild(btn);
  });

  feedback.className = 'quiz-feedback';
  feedback.textContent = '';
  document.getElementById('quiz-next-btn').style.display = 'none';
}

function selectAnswer(escolhida, btnClicado) {
  if (answered) return;
  answered = true;

  const q = quizQuestions[currentQuestion];
  const botoes = document.querySelectorAll('.quiz-option');
  const feedback = document.querySelector('.quiz-feedback');
  const acertou = escolhida === q.answer;

  botoes.forEach(b => (b.disabled = true));
  botoes[ordem.indexOf(q.answer)].classList.add('correct');

  if (acertou) {
    score++;
    feedback.className = 'quiz-feedback feedback-correct show';
    feedback.innerHTML = `<span>✓</span><span><strong>Correto!</strong> ${q.explanation}</span>`;
  } else {
    btnClicado.classList.add('wrong');
    feedback.className = 'quiz-feedback feedback-wrong show';
    feedback.innerHTML = `<span>✗</span><span><strong>Incorreto.</strong> ${q.explanation}</span>`;
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
  const cor = pct >= 80 ? 'var(--primary)' : pct >= 50 ? '#fbbf24' : 'var(--secondary)';

  document.querySelector('.quiz-active').style.display = 'none';
  document.querySelector('.quiz-result').style.display = 'block';
  document.querySelector('.quiz-progress-bar').style.width = '100%';

  ring.style.strokeDasharray = circunferencia;
  ring.style.strokeDashoffset = circunferencia;
  ring.style.stroke = cor;
  pctEl.style.color = cor;
  setTimeout(() => {
    ring.style.strokeDashoffset = circunferencia - (pct / 100) * circunferencia;
  }, 100);

  // contagem da porcentagem (começa em 0 para não mostrar 1% quando errou tudo)
  let n = 0;
  pctEl.textContent = '0%';
  if (pct > 0) {
    const contador = setInterval(() => {
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

document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initNavbar();
  initScrollAnimations();
  initCounters();
  initQuiz();

  const titulo = document.querySelector('.hero-typewriter');
  if (titulo) {
    const texto = titulo.textContent;
    setTimeout(() => typewriter(titulo, texto, 55), 500);
  }
});
