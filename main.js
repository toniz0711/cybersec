const quizQuestions = [
  {
    question: 'O que é phishing?',
    options: [
      'Uma técnica de engenharia social que tenta obter dados ou senhas por meio de mensagens falsas.',
      'Um tipo de vírus que se instala em dispositivos móveis.',
      'Um método para acelerar a conexão de internet usando proxys.',
      'Um software que criptografa dados automaticamente no navegador.'
    ],
    correctIndex: 0,
    explanation: 'Phishing é um golpe que usa e-mails ou páginas falsas para roubar credenciais e informações pessoais.'
  },
  {
    question: 'Qual é a melhor prática para senhas?',
    options: [
      'Reutilizar a mesma senha em vários sites para memorizá-la.',
      'Usar senhas curtas e fáceis de lembrar, como datas de nascimento.',
      'Criar senhas longas, únicas e armazená-las em um gerenciador de senhas.',
      'Compartilhar a senha apenas com pessoas confiáveis.'
    ],
    correctIndex: 2,
    explanation: 'Senhas fortes e únicas reduzindo o risco em caso de vazamento. Gerenciadores de senhas ajudam a gerenciar essa complexidade.'
  },
  {
    question: 'O que a autenticação em dois fatores (2FA) oferece?',
    options: [
      'Permite usar a mesma senha em dois serviços distintos.',
      'Adiciona uma segunda camada de proteção além da senha.',
      'Substitui a senha por impressão digital em todos os acessos.',
      'Elimina a necessidade de atualizar o software.'
    ],
    correctIndex: 1,
    explanation: '2FA exige algo que você sabe (senha) e algo que você tem (código/smartphone), tornando o acesso mais seguro.'
  },
  {
    question: 'Qual é a forma mais segura de usar Wi-Fi público?',
    options: [
      'Sempre usar uma VPN para criptografar a conexão.',
      'Conectar apenas com o celular sem usar apps bancários.',
      'Apenas visitar sites sem “https”.',
      'Usar o hotspot de outra pessoa.'
    ],
    correctIndex: 0,
    explanation: 'VPN protege seus dados em redes abertas, evitando que invasores interceptem informações sensíveis.'
  },
  {
    question: 'O que é ransomware?',
    options: [
      'Um software que acelera backups na nuvem.',
      'Um malware que bloqueia acesso a arquivos e exige resgate.',
      'Uma ferramenta para proteger a rede sem fio.',
      'Um tipo de firewall avançado.'
    ],
    correctIndex: 1,
    explanation: 'Ransomware criptografa arquivos e pede pagamento para restaurar o acesso. Backups são a defesa mais confiável.'
  },
  {
    question: 'Quando um site é comprometido, a prática mais segura é:',
    options: [
      'Continuar usando a mesma senha, pois é só naquele site.',
      'Mudar a senha apenas se receber uma notificação oficial.',
      'Alterar a senha imediatamente e evitar reutilizá-la em outros serviços.',
      'Desinstalar o navegador.'
    ],
    correctIndex: 2,
    explanation: 'Após um vazamento, mudar a senha e não reutilizá-la evita que outros serviços também sejam expostos.'
  },
  {
    question: 'Qual é a principal vantagem de manter software atualizado?',
    options: [
      'Melhora apenas a aparência dos aplicativos.',
      'Corrige falhas de segurança que invasores podem explorar.',
      'Aumenta a velocidade da internet automaticamente.',
      'Reduz o consumo de bateria em todos os dispositivos.'
    ],
    correctIndex: 1,
    explanation: 'Atualizações frequentemente trazem correções de vulnerabilidades que seriam exploradas por atacantes.'
  },
  {
    question: 'Em caso de e-mail suspeito, a atitude mais segura é:',
    options: [
      'Clicar no link para verificar se é verdadeiro.',
      'Responder pedindo mais informações.',
      'Apagar e, se necessário, acessar o serviço direto no site oficial.',
      'Compartilhar o e-mail com amigos para saber a opinião deles.'
    ],
    correctIndex: 2,
    explanation: 'Não clique em links suspeitos. Acesse sempre o serviço por meios oficiais e independentes.'
  },
  {
    question: 'O que significa “zero trust”?',
    options: [
      'Confiar apenas em dispositivos de casa.',
      'Nunca confiar automaticamente e sempre verificar usuários e dispositivos.',
      'Remover senhas de todos os sistemas.',
      'Usar apenas redes sem fio seguras.'
    ],
    correctIndex: 1,
    explanation: 'Zero trust exige autenticação e verificação contínua, mesmo em redes internas, reduzindo riscos de acesso indevido.'
  },
  {
    question: 'Qual é a melhor ação após perceber uma conta comprometida?',
    options: [
      'Ignorar para evitar causar alarme.',
      'Alterar senha, ativar 2FA e revisar atividades recentes.',
      'Desinstalar o aplicativo associado.',
      'Reiniciar o computador e continuar usando normalmente.'
    ],
    correctIndex: 1,
    explanation: 'A reação correta inclui mudar credenciais, ativar proteção adicional e verificar acessos recentes para detectar danos.'
  }
];

const state = {
  currentQuestionIndex: 0,
  correctAnswers: 0,
  completed: false
};

const elements = {
  startBtn: document.getElementById('quiz-start-btn'),
  nextBtn: document.getElementById('quiz-next-btn'),
  restartBtn: document.getElementById('quiz-restart-btn'),
  quizIntro: document.querySelector('.quiz-intro'),
  quizActive: document.querySelector('.quiz-active'),
  quizResult: document.querySelector('.quiz-result'),
  questionText: document.querySelector('.quiz-question-text'),
  optionsContainer: document.querySelector('.quiz-options'),
  feedback: document.querySelector('.quiz-feedback'),
  counter: document.querySelector('.quiz-counter'),
  resultPct: document.querySelector('.result-score-pct'),
  resultTitle: document.querySelector('.result-title'),
  resultMsg: document.querySelector('.result-msg'),
  resultCorrect: document.querySelector('.num-correct'),
  resultWrong: document.querySelector('.num-wrong'),
  resultTotal: document.querySelector('.num-total'),
  ringFill: document.querySelector('.ring-fill')
};

function initQuiz() {
  if (!elements.startBtn) return;

  elements.startBtn.addEventListener('click', startQuiz);
  elements.restartBtn.addEventListener('click', restartQuiz);
  setInitialProgress();
  initStatCounters();
}

function setInitialProgress() {
  const total = quizQuestions.length;
  elements.counter.innerHTML = `Pergunta <span>1</span> de <span>${total}</span>`;
}

function calculateMedian(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const length = sorted.length;
  if (length === 0) return 0;
  const middle = Math.floor(length / 2);

  if (length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function initStatCounters() {
  const counters = Array.from(document.querySelectorAll('.stat-number[data-counter]'));
  if (!counters.length) return;

  const values = counters.map((el) => {
    const raw = Number(el.dataset.counter);
    return Number.isFinite(raw) ? raw : 0;
  });

  const medianValue = calculateMedian(values.map((value) => Math.abs(value)));

  counters.forEach((counter) => {
    const target = Number(counter.dataset.counter) || 0;
    const suffix = counter.dataset.suffix || '';
    const ratio = target > 0 ? target / Math.max(medianValue, 1) : 1;
    const duration = Math.min(2600, 900 + Math.round(Math.log10(ratio + 1) * 1200));
    const steps = Math.max(20, Math.round(duration / 20));
    const increment = Math.max(1, Math.round(target / steps));
    let current = 0;

    const interval = Math.max(10, Math.round(duration / Math.max(1, Math.ceil(target / increment))));

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = `${current}${suffix}`;
    }, interval);
  });
}

function startQuiz() {
  state.currentQuestionIndex = 0;
  state.correctAnswers = 0;
  state.completed = false;
  elements.quizIntro.style.display = 'none';
  elements.quizResult.style.display = 'none';
  elements.quizActive.style.display = 'block';
  elements.nextBtn.style.display = 'none';
  updateProgress();
  showQuestion();
}

function showQuestion() {
  const current = quizQuestions[state.currentQuestionIndex];
  elements.questionText.textContent = current.question;
  elements.optionsContainer.innerHTML = '';
  elements.feedback.className = 'quiz-feedback';
  elements.feedback.textContent = '';
  elements.nextBtn.style.display = 'none';

  current.options.forEach((optionText, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz-option';
    button.innerHTML = `
      <span class="quiz-option-letter">${String.fromCharCode(65 + index)}</span>
      <span>${optionText}</span>
    `;
    button.addEventListener('click', () => selectOption(index, button));
    elements.optionsContainer.appendChild(button);
  });
}

function selectOption(selectedIndex, button) {
  const current = quizQuestions[state.currentQuestionIndex];
  const correctIndex = current.correctIndex;
  const allOptions = elements.optionsContainer.querySelectorAll('.quiz-option');

  allOptions.forEach((option, index) => {
    option.disabled = true;
    if (index === correctIndex) {
      option.classList.add('correct');
    }
    if (index === selectedIndex && index !== correctIndex) {
      option.classList.add('wrong');
    }
  });

  if (selectedIndex === correctIndex) {
    state.correctAnswers += 1;
    elements.feedback.classList.add('quiz-feedback', 'feedback-correct', 'show');
    elements.feedback.textContent = 'Resposta correta! ' + current.explanation;
  } else {
    elements.feedback.classList.add('quiz-feedback', 'feedback-wrong', 'show');
    elements.feedback.textContent = 'Resposta incorreta. ' + current.explanation;
  }

  if (state.currentQuestionIndex < quizQuestions.length - 1) {
    elements.nextBtn.style.display = 'inline-flex';
  } else {
    elements.nextBtn.textContent = 'Finalizar Quiz';
    elements.nextBtn.style.display = 'inline-flex';
  }
}

function nextQuestion() {
  if (state.currentQuestionIndex < quizQuestions.length - 1) {
    state.currentQuestionIndex += 1;
    updateProgress();
    showQuestion();
  } else {
    finishQuiz();
  }
}

function updateProgress() {
  const total = quizQuestions.length;
  const current = state.currentQuestionIndex + 1;

  elements.counter.innerHTML = `Pergunta <span>${current}</span> de <span>${total}</span>`;
}

function finishQuiz() {
  state.completed = true;
  const total = quizQuestions.length;
  const score = state.correctAnswers;
  const percent = Math.round((score / total) * 100);
  const message = getResultMessage(percent);
  const ringOffset = 339.292 - (339.292 * percent) / 100;

  elements.quizActive.style.display = 'none';
  elements.quizResult.style.display = 'block';
  elements.resultPct.textContent = `${percent}%`;
  elements.resultTitle.textContent = message.title;
  elements.resultMsg.textContent = message.description;
  elements.resultCorrect.textContent = score;
  elements.resultWrong.textContent = total - score;
  elements.resultTotal.textContent = total;
  elements.ringFill.style.strokeDasharray = '339.292';
  elements.ringFill.style.strokeDashoffset = ringOffset;
}

function getResultMessage(percent) {
  if (percent >= 90) {
    return {
      title: 'Excelente!',
      description: 'Você domina bem os fundamentos de segurança digital. Continue reforçando boas práticas.'
    };
  }
  if (percent >= 70) {
    return {
      title: 'Bom trabalho',
      description: 'Você tem uma boa base, mas ainda há algumas áreas para melhorar.'
    };
  }
  if (percent >= 50) {
    return {
      title: 'Atenção necessária',
      description: 'Você entende vários conceitos, mas precisa reforçar práticas essenciais.'
    };
  }
  return {
    title: 'Vamos melhorar',
    description: 'Reveja as dicas e tente novamente para fortalecer sua proteção digital.'
  };
}

function restartQuiz() {
  elements.quizIntro.style.display = 'block';
  elements.quizResult.style.display = 'none';
  elements.quizActive.style.display = 'none';
  elements.nextBtn.textContent = 'Próxima →';
  state.currentQuestionIndex = 0;
  state.correctAnswers = 0;
  state.completed = false;
  setInitialProgress();
}

window.nextQuestion = nextQuestion;

document.addEventListener('DOMContentLoaded', initQuiz);
