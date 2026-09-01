document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'kitty_daily_diary_entries';

  // 날짜 입력 필드에 접속 시간 기준 오늘 날짜 자동 세팅 (다른 날 클릭 시 해당 날짜 유지)
  initDateField('daily-date');

  function getEntries() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveEntries(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return true;
    } catch (e) {
      alert('저장 공간이 부족합니다. 사진 용량을 확인해주세요!');
      return false;
    }
  }

  // 1. 일상 작성 페이지 로직 (daily.html)
  const fileInput = document.getElementById('daily-photo-input');
  const uploadTrigger = document.getElementById('upload-trigger');
  const previewBox = document.getElementById('preview-box');
  const previewImg = document.getElementById('preview-img');
  const removeBtn = document.getElementById('remove-photo');
  let currentPhotoBase64 = '';

  if (uploadTrigger && fileInput) {
    uploadTrigger.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // 사진 자동 압축
          currentPhotoBase64 = await compressImage(file, 800, 0.7);
          previewImg.src = currentPhotoBase64;
          previewBox.style.display = 'block';
          uploadTrigger.style.display = 'none';
        } catch (err) {
          alert('이미지를 불러오는데 실패했습니다.');
        }
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        currentPhotoBase64 = '';
        previewImg.src = '';
        previewBox.style.display = 'none';
        uploadTrigger.style.display = 'flex';
      });
    }
  }

  const saveBtn = document.getElementById('save-daily-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const date = document.getElementById('daily-date').value || getTodayDateString();
      const mood = document.getElementById('daily-mood').value;
      const title = document.getElementById('daily-title').value.trim();
      const content = document.getElementById('daily-content').value.trim();

      if (!title || !content) {
        alert('제목과 일기 내용을 모두 입력해주세요!');
        return;
      }

      const newEntry = {
        id: Date.now(),
        date,
        mood,
        title,
        content,
        photo: currentPhotoBase64
      };

      const entries = getEntries();
      entries.unshift(newEntry);
      
      if (saveEntries(entries)) {
        alert('소중한 일상 일기가 저장되었습니다! 🎀💌');
        location.href = 'daily-list.html';
      }
    });
  }

  // 2. 일상 보관함 페이지 (daily-list.html)
  const dailyCardsContainer = document.getElementById('daily-cards-container');
  const modal = document.getElementById('daily-detail-modal');
  const modalCloseBtn = document.getElementById('daily-modal-close-btn');

  const detailDate = document.getElementById('detail-daily-date');
  const detailMood = document.getElementById('detail-daily-mood');
  const detailTitle = document.getElementById('detail-daily-title');
  const detailImg = document.getElementById('detail-daily-img');
  const detailBody = document.getElementById('detail-daily-body');
  const detailDeleteBtn = document.getElementById('detail-daily-delete-btn');
  let currentDetailId = null;

  function renderDailyList() {
    if (!dailyCardsContainer) return;

    const entries = getEntries();
    dailyCardsContainer.innerHTML = '';

    if (entries.length === 0) {
      dailyCardsContainer.innerHTML = '<div style="text-align:center; padding:25px; color:#b58d99; font-size:1.15rem;">아직 기록된 일상 일기가 없어요 ₍ᐢ.ˬ.ᐢ₎</div>';
      return;
    }

    entries.forEach(entry => {
      const card = document.createElement('article');
      card.className = 'entry-card-box daily-entry-card';

      let thumbHtml = '';
      if (entry.photo) {
        thumbHtml = `<img src="${entry.photo}" alt="일상 사진" class="daily-card-thumb">`;
      }

      card.innerHTML = `
        <div class="daily-card-header">
          <span>📅 ${entry.date}</span>
          <span class="daily-badge-mood">${entry.mood}</span>
        </div>
        <div class="daily-card-main">
          ${thumbHtml}
          <div class="daily-card-info">
            <h3 class="daily-card-title">${entry.title}</h3>
            <p class="daily-card-preview">${entry.content}</p>
          </div>
        </div>
      `;

      card.addEventListener('click', () => openDailyDetail(entry));
      dailyCardsContainer.appendChild(card);
    });
  }

  function openDailyDetail(entry) {
    currentDetailId = entry.id;
    detailDate.innerText = `📅 ${entry.date}`;
    detailMood.innerText = entry.mood;
    detailTitle.innerText = entry.title;
    detailBody.innerText = entry.content;

    if (entry.photo) {
      detailImg.src = entry.photo;
      detailImg.style.display = 'block';
    } else {
      detailImg.style.display = 'none';
      detailImg.src = '';
    }

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
      if (currentDetailId && confirm('이 일기를 삭제할까요?')) {
        const updated = getEntries().filter(item => item.id !== currentDetailId);
        saveEntries(updated);
        modal.style.display = 'none';
        renderDailyList();
      }
    });
  }

  renderDailyList();
});