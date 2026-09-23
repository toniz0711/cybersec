
function createParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 15) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
    p.style.opacity = Math.random() * 0.6;
    container.appendChild(p);
  }
}


function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(3,7,18,0.97)';
    } else {
      navbar.style.background = 'rgba(3,7,18,0.85)';
    }
  });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }


  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
}


function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}


function typewriter(el, text, speed = 60) {
  el.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(timer);
  }, speed);
}


function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 2000;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
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

function initQuiz() {
  const startBtn = document.getElementById('quiz-start-btn');
  const restartBtn = document.getElementById('quiz-restart-btn');

  if (startBtn) {
    startBtn.addEventListener('click', startQuiz);
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', restartQuiz);
  }
}

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  answered = false;

  document.querySelector('.quiz-intro').style.display = 'none';
  document.querySelector('.quiz-result').style.display = 'none';
  document.querySelector('.quiz-active').style.display = 'block';

  renderQuestion();
}

function restartQuiz() {
  startQuiz();
}

function renderQuestion() {
  answered = false;
  const q = quizQuestions[currentQuestion];
  const total = quizQuestions.length;


  document.querySelector('.quiz-progress-bar').style.width =
    ((currentQuestion / total) * 100) + '%';


  document.querySelector('.quiz-counter').innerHTML =
    `Pergunta <span>${currentQuestion + 1}</span> de <span>${total}</span>`;


  document.querySelector('.quiz-question-text').textContent = q.q;


  const optContainer = document.querySelector('.quiz-options');
  optContainer.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.classList.add('quiz-option');
    btn.innerHTML = `<span class="quiz-option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => selectAnswer(i, btn));
    optContainer.appendChild(btn);
  });


  const feedback = document.querySelector('.quiz-feedback');
  feedback.className = 'quiz-feedback';
  feedback.textContent = '';


  const nextBtn = document.getElementById('quiz-next-btn');
  nextBtn.style.display = 'none';
}

function selectAnswer(index, clickedBtn) {
  if (answered) return;
  answered = true;

  const q = quizQuestions[currentQuestion];
  const allBtns = document.querySelectorAll('.quiz-option');
  const feedback = document.querySelector('.quiz-feedback');


  allBtns.forEach(btn => btn.disabled = true);


  allBtns[q.answer].classList.add('correct');

  if (index === q.answer) {
    score++;
    feedback.className = 'quiz-feedback feedback-correct show';
    feedback.innerHTML = `<span>✓</span><span><strong>Correto!</strong> ${q.explanation}</span>`;
  } else {
    clickedBtn.classList.add('wrong');
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
  document.querySelector('.quiz-active').style.display = 'none';
  document.querySelector('.quiz-result').style.display = 'block';

  const total = quizQuestions.length;
  const pct = Math.round((score / total) * 100);
  const wrong = total - score;


  const circumference = 2 * Math.PI * 54;
  const ring = document.querySelector('.ring-fill');
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;

  setTimeout(() => {
    ring.style.strokeDashoffset = circumference - (pct / 100) * circumference;
  }, 100);


  const pctEl = document.querySelector('.result-score-pct');
  let count = 0;
  const counter = setInterval(() => {
    count++;
    pctEl.textContent = count + '%';
    if (count >= pct) clearInterval(counter);
  }, 20);


  document.querySelector('.num-correct').textContent = score;
  document.querySelector('.num-wrong').textContent = wrong;
  document.querySelector('.num-total').textContent = total;


  const titleEl = document.querySelector('.result-title');
  const msgEl = document.querySelector('.result-msg');
  const color = pct >= 80 ? 'var(--primary)' : pct >= 50 ? '#fbbf24' : 'var(--secondary)';

  ring.style.stroke = color;
  pctEl.style.color = color;

  if (pct === 100) {
    titleEl.textContent = '🛡️ Especialista em Segurança!';
    msgEl.textContent = 'Perfeito! Você domina os conceitos de segurança digital. Continue assim!';
  } else if (pct >= 80) {
    titleEl.textContent = '✅ Ótimo Resultado!';
    msgEl.textContent = 'Você tem um sólido conhecimento sobre segurança digital. Revise os tópicos que errou para ser ainda mais seguro online.';
  } else if (pct >= 50) {
    titleEl.textContent = '⚠️ Em Desenvolvimento';
    msgEl.textContent = 'Você conhece o básico, mas ainda há muito a aprender. Explore nosso conteúdo e refaça o quiz!';
  } else {
    titleEl.textContent = '🔓 Vulnerável!';
    msgEl.textContent = 'Suas práticas digitais precisam melhorar urgentemente. Leia nossas dicas e proteja-se!';
  }
}


window.nextQuestion = nextQuestion;


document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initNavbar();
  initScrollAnimations();
  initCounters();
  initQuiz();


  const tw = document.querySelector('.hero-typewriter');
  if (tw) {
    setTimeout(() => typewriter(tw, 'PROTEJA-SE NO MUNDO DIGITAL', 55), 500);
  }
});