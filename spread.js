/* ── 날짜 ── */
(function () {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  document.getElementById('headerDate').textContent =
    `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
})();

/* ── 상태 ── */
let pickedCount = 0;
let audioCtx;
let shuffledDeck = [];
let pickedCards = []; // {card, score, weather}

const SLOT_LABELS = ['✨ 총운 카드를 뽑아주세요', '☀️ 아침 카드를 뽑아주세요', '🕛 점심 카드를 뽑아주세요', '🌙 저녁 카드를 뽑아주세요'];
const REPORT_IDS = ['Total', 'Morning', 'Afternoon', 'Evening'];
const REPORT_LABELS = ['오늘의 총운', '아침 운세', '점심 운세', '저녁 운세'];
const REPORT_ICONS = ['✨', '☀️', '🕛', '🌙'];

/* ── 헬퍼 ── */
function getWeather(score) {
  if (score >= 90) return { icon: '☀️', cls: 'score-high' };
  if (score >= 70) return { icon: '🌤️', cls: 'score-high' };
  if (score >= 40) return { icon: '☁️', cls: 'score-mid' };
  return { icon: '🌧️', cls: 'score-low' };
}
function calcScore(card) {
  if (card.isDestiny) return card.baseScore;
  return Math.min(100, Math.max(0, card.baseScore + Math.floor(Math.random() * 7) - 3));
}
function getLucky() {
  const colors = [
    { name: '골드', code: '#FFD700' }, { name: '실버', code: '#C0C0C0' },
    { name: '네이비', code: '#001F5B' }, { name: '로얄블루', code: '#4169E1' },
    { name: '버건디', code: '#800020' }, { name: '에메랄드', code: '#50C878' },
    { name: '화이트', code: '#F0F0F0' }, { name: '딥퍼플', code: '#5D3FD3' },
    { name: '라벤더', code: '#B57BEE' }, { name: '코랄', code: '#FF7F50' }
  ];
  return { color: colors[Math.floor(Math.random() * colors.length)], number: Math.floor(Math.random() * 9) + 1 };
}

/* ── 도트 업데이트 ── */
function updateDots(n) {
  for (let i = 0; i < 4; i++) {
    const d = document.getElementById(`dot${i}`);
    d.className = 'dot' + (i < n ? ' done' : '') + (i === n && n < 4 ? ' active' : '');
  }
}

/* ── 오디오 ── */
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playSound(idx) {
  initAudio();
  const freqs = [392, 494, 587, 659];
  const f = freqs[idx] || 440;
  [f, f * 1.25].forEach((freq, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const t = audioCtx.currentTime + i * 0.06;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.4);
    g.gain.setValueAtTime(i === 0 ? 0.10 : 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t + 0.55);
  });
}

/* ── 셔플 ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── 스와이프 기능이 제거된 고정형 부채꼴 생성 ── */

function createFan() {
  const pivot = document.getElementById('fanPivot');
  pivot.innerHTML = '';
  shuffledDeck = shuffle(tarotData);
  const totalCards = 64;
  const arcSpan = 170; // 170도로 꽉 차게 변경
  const startAngle = -arcSpan / 2;
  const step = arcSpan / (totalCards - 1);

  for (let i = 0; i < totalCards; i++) {
    const card = document.createElement('div');
    card.className = 'fan-card';
    card.dataset.index = i;
    card.dataset.baseAngle = startAngle + step * i;
    const angle = parseFloat(card.dataset.baseAngle);
    card.style.transform = `rotate(${angle}deg)`;
    card.style.zIndex = i;
    card.addEventListener('click', function (e) {
      pickCard(this);
    });
    pivot.appendChild(card);
  }

}

/* ── 카드 뽑기 ── */
function pickCard(el) {
  if (pickedCount >= 4) return;
  const idx = parseInt(el.dataset.index);
  const card = shuffledDeck[idx];
  const score = calcScore(card);
  const w = getWeather(score);
  pickedCards.push({ card, score, w });

  playSound(pickedCount);

  // 슬롯에 카드 이미지 표시
  const slot = document.getElementById(`slot${pickedCount}`);
  slot.classList.remove('active-slot');
  slot.classList.add('filled');
  slot.innerHTML = `<img src="${card.img}" alt="${card.name}">`;

  // 팬에서 카드 숨기기
  el.classList.add('picked');

  // 리포트 생성
  document.getElementById(`report${REPORT_IDS[pickedCount]}`).innerHTML =
    buildCard(card, score, w, REPORT_LABELS[pickedCount], REPORT_ICONS[pickedCount]);

  pickedCount++;
  updateDots(pickedCount);

  if (pickedCount < 4) {
    // 다음 슬롯 활성화
    document.getElementById(`slot${pickedCount}`).classList.add('active-slot');
    document.getElementById('spreadInstruction').textContent = SLOT_LABELS[pickedCount];
  } else {
    // 모두 뽑음 → 결과 표시
    document.getElementById('spreadInstruction').textContent = '🎉 카드 선택 완료!';
    setTimeout(showResults, 800);
  }
}

/* ── 결과 표시 ── */
function showResults() {
  // 럭키 아이템
  const lucky = getLucky();
  document.getElementById('luckyArea').innerHTML = `
    <div class="lucky-card">
      <div class="lucky-title">✨ 오늘의 행운 아이템</div>
      <div class="lucky-row">
        <div class="lucky-item">
          <div class="lucky-item-label">행운의 숫자</div>
          <div class="lucky-number">${lucky.number}</div>
        </div>
        <div class="lucky-sep"></div>
        <div class="lucky-item">
          <div class="lucky-item-label">행운의 색상</div>
          <div class="lucky-color-circle" style="background:${lucky.color.code};"></div>
          <div class="lucky-color-name">${lucky.color.name}</div>
        </div>
      </div>
    </div>`;

  // 스프레드 숨기고 결과 표시
  document.getElementById('spreadPhase').classList.add('phase-done');
  const ra = document.getElementById('result-area');
  ra.style.display = 'block';
  document.getElementById('bottomActions').style.display = 'flex';
  document.getElementById('mainBtn').style.display = 'block';
  ra.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── 메인 버튼 (다시 뽑기) ── */
function handleMainAction() {
  resetAll();
}

/* ── 초기화 ── */
function resetAll() {
  pickedCount = 0;
  pickedCards = [];
  updateDots(0);

  document.getElementById('result-area').style.display = 'none';
  document.getElementById('bottomActions').style.display = 'none';
  document.getElementById('mainBtn').style.display = 'none';
  document.getElementById('luckyArea').innerHTML = '';
  document.getElementById('spreadInstruction').textContent = SLOT_LABELS[0];

  const sp = document.getElementById('spreadPhase');
  sp.classList.remove('phase-done');

  // 슬롯 리셋
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById(`slot${i}`);
    slot.classList.remove('filled', 'active-slot');
    slot.innerHTML = '<div class="slot-placeholder">?</div>';
    document.getElementById(`report${REPORT_IDS[i]}`).innerHTML = '';
  }
  document.getElementById('slot0').classList.add('active-slot');

  createFan();
}

function buildCard(card, score, w, label, icon) {
  return `
    <div class="report-header">
      <div class="report-title"><div class="title-chip">${icon}</div>${label}</div>
      <div class="score-wrap">
        <div class="score-weather">${w.icon}</div>
        <div class="score-pill ${w.cls}">${score}점</div>
      </div>
    </div>
    <div class="card-name-row">📜 ${card.name}</div>
    <div class="highlight-box">💬 ${card.total}</div>
    <div class="detail-list">
      <div class="detail-row"><div class="detail-icon">💼</div><div class="detail-text"><b>사업/직장운</b>${card.bus}</div></div>
      <div class="detail-row"><div class="detail-icon">❤️</div><div class="detail-text"><b>연애운</b>${card.lov}</div></div>
      <div class="detail-row"><div class="detail-icon">🍀</div><div class="detail-text"><b>건강운</b>${card.hea}</div></div>
    </div>`;
}

/* ── 저장 & 공유 ── */
function saveResult() {
  const scale = (window.devicePixelRatio || 1) * 2; // 고해상도 캡처
  html2canvas(document.getElementById('result-area'), {
    backgroundColor: '#fdfcff', 
    scale: scale > 3 ? scale : 3, // 최소 3배 이상 확대 캡처
    useCORS: true,
    scrollY: -window.scrollY // 캡처 시 스크롤 어긋남 방지
  }).then(c => {
    const a = document.createElement('a');
    a.download = '지니의_주역타로_운세.png';
    a.href = c.toDataURL('image/png'); 
    a.click();
  });
}
async function shareToFriends() {
  if (navigator.share) {
    try { await navigator.share({ title: '지니의 하루 주역 타로', text: '오늘의 운세를 확인해보세요! ✨', url: window.location.href }); }
    catch (e) { }
  } else { alert('이 브라우저는 공유를 지원하지 않습니다.'); }
}

window.onload = function () {
  resetAll();
};
