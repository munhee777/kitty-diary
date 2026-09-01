document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'kitty_emotion_diary_entries';

  // 날짜 입력 필드에 접속 시간 기준 오늘 날짜 자동 세팅
  initDateField('emotion-date');

  function getEntries() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  // 1. 감정 작성 페이지 (emotion.html)
  const saveBtn = document.getElementById('save-emotion-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const date = document.getElementById('emotion-date').value || getTodayDateString();
      const emotion = document.getElementById('emotion-select').value;
      const title = document.getElementById('emotion-title').value.trim();
      const reason = document.getElementById('emotion-reason').value.trim();
      const comfort = document.getElementById('emotion-comfort').value.trim();

      if (!title || !reason) {
        alert('제목과 감정 이유를 모두 작성해주세요!');
        return;
      }

      const newEntry = {
        id: Date.now(),
        date,
        emotion,
        title,
        reason,
        comfort: comfort || '내 마음을 잘 보살펴준 하루 ✨'
      };

      const entries = getEntries();
      entries.unshift(newEntry);
      saveEntries(entries);

      alert('마음 속 감정이 소중하게 기록되었습니다! 💖💭');
      location.href = 'emotion-list.html';
    });
  }

  // 2. 감정 보관함 페이지 (emotion-list.html)
  const emotionCardsContainer = document.getElementById('emotion-cards-container');
  const modal = document.getElementById('emotion-detail-modal');
  const modalCloseBtn = document.getElementById('emotion-modal-close-btn');

  const detailDate = document.getElementById('detail-emotion-date');
  const detailBadge = document.getElementById('detail-emotion-badge');
  const detailTitle = document.getElementById('detail-emotion-title');
  const detailReason = document.getElementById('detail-emotion-reason');
  const detailComfort = document.getElementById('detail-emotion-comfort');
  const detailDeleteBtn = document.getElementById('detail-emotion-delete-btn');
  let currentDetailId = null;

  function renderEmotionList() {
    if (!emotionCardsContainer) return;

    const entries = getEntries();
    emotionCardsContainer.innerHTML = '';

    if (entries.length === 0) {
      emotionCardsContainer.innerHTML = '<div style="text-align:center; padding:25px; color:#b58d99; font-size:1.15rem;">아직 기록된 감정 일기가 없어요 ₍ᐢ.ˬ.ᐢ₎</div>';
      return;
    }

    entries.forEach(entry => {
      const card = document.createElement('article');
      card.className = 'entry-card-box emotion-entry-card';

      card.innerHTML = `
        <div class="emotion-card-header">
          <span>📅 ${entry.date}</span>
          <span class="emotion-badge">${entry.emotion}</span>
        </div>
        <div class="emotion-card-info">
          <h3 class="emotion-card-title">${entry.title}</h3>
          <p class="emotion-card-preview">${entry.reason}</p>
        </div>
      `;

      card.addEventListener('click', () => openEmotionDetail(entry));
      emotionCardsContainer.appendChild(card);
    });
  }

  function openEmotionDetail(entry) {
    currentDetailId = entry.id;
    detailDate.innerText = `📅 ${entry.date}`;
    detailBadge.innerText = entry.emotion;
    detailTitle.innerText = entry.title;
    detailReason.innerText = entry.reason;
    detailComfort.innerText = entry.comfort || '내 마음을 잘 토닥여준 하루 ✨';

    modal.style.display = 'flex';
  }

  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  if (detailDeleteBtn) {
    detailDeleteBtn.addEventListener('click', () => {
      if (currentDetailId && confirm('이 감정 일기를 삭제할까요?')) {
        const updated = getEntries().filter(item => item.id !== currentDetailId);
        saveEntries(updated);
        modal.style.display = 'none';
        renderEmotionList();
      }
    });
  }

  renderEmotionList();
});