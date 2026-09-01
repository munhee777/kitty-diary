document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'kitty_travel_diary_entries';

  // 오늘 날짜 자동 세팅
  initDateField('travel-date');

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

  const fileInput = document.getElementById('travel-photo-input');
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
        currentPhotoBase64 = await compressImage(file, 800, 0.7);
        previewImg.src = currentPhotoBase64;
        previewBox.style.display = 'block';
        uploadTrigger.style.display = 'none';
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

  const saveBtn = document.getElementById('save-travel-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const date = document.getElementById('travel-date').value || getTodayDateString();
      const spot = document.getElementById('travel-spot').value.trim();
      const title = document.getElementById('travel-title').value.trim();
      const memo = document.getElementById('travel-memo').value.trim();

      if (!spot || !title) {
        alert('여행지와 제목을 입력해주세요!');
        return;
      }

      const newEntry = {
        id: Date.now(),
        date,
        spot,
        title,
        memo,
        photo: currentPhotoBase64
      };

      const entries = getEntries();
      entries.unshift(newEntry);
      if (saveEntries(entries)) {
        alert('즐거운 여행 기록이 저장되었습니다! ✈️🌸');
        location.href = 'travel-list.html';
      }
    });
  }
});