const data = window.EUMENIDES_QUIZ;
const quiz = document.querySelector('#quiz');
const questionsRoot = document.querySelector('#questions');
const partsById = Object.fromEntries(data.parts.map(p => [p.id, p]));

function option(value, label) {
  const node = document.createElement('option');
  node.value = value;
  node.textContent = label;
  return node;
}

function renderQuiz() {
  document.querySelector('#phase-list').replaceChildren(...data.parts.map(p => {
    const li = document.createElement('li');
    li.textContent = `${p.label} (${p.range})`;
    return li;
  }));

  data.questions.forEach((q, index) => {
    const card = document.createElement('section');
    card.className = 'question';
    card.dataset.id = q.id;
    card.innerHTML = `<div class="q-number">Sentence ${index + 1}</div><blockquote>“${q.quote}”</blockquote>`;
    const answers = document.createElement('div');
    answers.className = 'answers';

    const speakerLabel = document.createElement('label');
    speakerLabel.textContent = 'Speaker';
    const speaker = document.createElement('select');
    speaker.name = `speaker-${q.id}`;
    speaker.setAttribute('aria-label', `Speaker for sentence ${index + 1}`);
    speaker.append(option('', 'Choose a speaker…'));
    data.speakers.forEach(s => speaker.append(option(s, s)));
    speakerLabel.append(speaker);

    const partLabel = document.createElement('label');
    partLabel.textContent = 'Part of the play';
    const part = document.createElement('select');
    part.name = `part-${q.id}`;
    part.setAttribute('aria-label', `Part of the play for sentence ${index + 1}`);
    part.append(option('', 'Choose a dramatic phase…'));
    data.parts.forEach(p => part.append(option(p.id, p.label)));
    partLabel.append(part);

    answers.append(speakerLabel, partLabel);
    card.append(answers);
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.innerHTML = `<strong>${q.speaker}</strong> · ${partsById[q.part].label}<br><small>Smyth, <i>Eumenides</i> ${q.citation}</small>`;
    card.append(feedback);
    questionsRoot.append(card);
  });
}

function updateProgress() {
  const answered = data.questions.filter(q =>
    quiz.elements[`speaker-${q.id}`].value && quiz.elements[`part-${q.id}`].value
  ).length;
  document.querySelector('#answered').textContent = answered;
  document.querySelector('#progress').style.width = `${answered / data.questions.length * 100}%`;
}

document.querySelector('#start').addEventListener('click', () => {
  quiz.hidden = false;
  document.querySelector('#intro').scrollIntoView({behavior: 'smooth'});
  quiz.querySelector('select').focus({preventScroll: true});
});

quiz.addEventListener('change', updateProgress);
quiz.addEventListener('submit', event => {
  event.preventDefault();
  let score = 0;
  data.questions.forEach(q => {
    const speakerOK = quiz.elements[`speaker-${q.id}`].value === q.speaker;
    const partOK = quiz.elements[`part-${q.id}`].value === q.part;
    score += Number(speakerOK) + Number(partOK);
    const card = document.querySelector(`.question[data-id="${q.id}"]`);
    card.classList.add('graded', speakerOK && partOK ? 'correct' : speakerOK || partOK ? 'partial' : 'incorrect');
  });
  document.querySelector('#score').textContent = score;
  document.querySelector('#score-note').textContent = score >= 36 ? 'Excellent command of the play.' : score >= 28 ? 'Strong work—review the marked dramatic phases.' : 'Review the speakers and the seven-part outline, then try again.';
  const results = document.querySelector('#results');
  results.hidden = false;
  results.scrollIntoView({behavior: 'smooth'});
});

document.querySelector('#retry').addEventListener('click', () => {
  quiz.reset();
  document.querySelectorAll('.question').forEach(card => card.classList.remove('graded', 'correct', 'partial', 'incorrect'));
  document.querySelector('#results').hidden = true;
  updateProgress();
  quiz.scrollIntoView({behavior: 'smooth'});
});

renderQuiz();
