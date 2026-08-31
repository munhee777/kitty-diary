document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'kitty_travel_diary_entries';
  
    // 기본 예시 데이터
    const defaultEntries = [
      {
        id: 1,
        date: '2026-08-15',
        location: '제주도 애월 바다',
        title: '에메랄드빛 바다와 함께한 힐링 여행 🏖️',
        content: '파도 소리를 들으며 해안 도로를 달렸다. 노을 질 때 하늘이 핑크빛으로 물들어서 평생 잊지 못할 풍경을 눈에 담았다. 다음에도 꼭 다시 오고 싶다!',
        photo: '' // 기본 텍스트 예시
      }
    ];
  
    function getEntries() {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEntries));
        return defaultEntries;
      }
      return JSON.parse(data);
    }
  
    function saveEntries(entries) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  
    // ─── 1. 여행 작성 페이지 (travel.html) 로직 ───
    const fileInput = document.getElementById('travel-photo-input');
    const uploadTrigger = document.getElementById('upload-trigger');
    const previewBox = document.getElementById('preview-box');
    const previewImg = document.getElementById('preview-img');
    const removeBtn = document.getElementById('remove-photo');
    let currentPhotoBase64 = '';
  
    if (uploadTrigger && fileInput) {
      uploadTrigger.addEventListener('click', () => fileInput.click());
  
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            currentPhotoBase64 = event.target.result;
            previewImg.src = currentPhotoBase64;
            previewBox.style.display = 'block';
            uploadTrigger.style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      });
  
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        currentPhotoBase64 = '';
        previewImg.src = '';
        previewBox.style.display = 'none';
        uploadTrigger.style.display = 'flex';
      });
    }
  
    const saveBtn = document.getElementById('save-travel-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const date = document.getElementById('travel-date').value;
        const location = document.getElementById('travel-location').value.trim();
        const title = document.getElementById('travel-title').value.trim();
        const content = document.getElementById('travel-content').value.trim();
  
        if (!title || !content) {
          alert('제목과 여행 내용을 모두 입력해주세요!');
          return;
        }
  
        const newEntry = {
          id: Date.now(),
          date: date || '2026-08-29',
          location: location || '어딘가로 떠난 여행',
          title,
          content,
          photo: currentPhotoBase64
        };
  
        const entries = getEntries();
        entries.unshift(newEntry);
        saveEntries(entries);
  
        alert('설레는 여행 일기가 저장되었습니다! ✈️💌');
        location.href = 'travel-list.html'; // 저장 후 보관함 페이지로 자동 이동
      });
    }
  
    // ─── 2. 여행 보관함 페이지 (travel-list.html) 렌더링 & 모달 ───
    const travelCardsContainer = document.getElementById('travel-cards-container');
    const modal = document.getElementById('travel-detail-modal');
    const modalCloseBtn = document.getElementById('travel-modal-close-btn');
  
    const detailDate = document.getElementById('detail-travel-date');
    const detailLoc = document.getElementById('detail-travel-loc');
    const detailTitle = document.getElementById('detail-travel-title');
    const detailImg = document.getElementById('detail-travel-img');
    const detailBody = document.getElementById('detail-travel-body');
    const detailDeleteBtn = document.getElementById('detail-travel-delete-btn');
    let currentDetailId = null;
  
    function renderTravelList() {
      if (!travelCardsContainer) return;
  
      const entries = getEntries();
      travelCardsContainer.innerHTML = '';
  
      if (entries.length === 0) {
        travelCardsContainer.innerHTML = '<div style="text-align:center; padding:25px; color:#b58d99; font-size:1.15rem;">아직 기록된 여행 일기가 없어요 ₍ᐢ.ˬ.ᐢ₎</div>';
        return;
      }
  
      entries.forEach(entry => {
        const card = document.createElement('article');
        card.className = 'entry-card-box travel-entry-card';
  
        let thumbHtml = '';
        if (entry.photo) {
          thumbHtml = `<img src="${entry.photo}" alt="여행 썸네일" class="travel-card-thumb">`;
        }
  
        card.innerHTML = `
          <div class="travel-card-header">
            <span>📅 ${entry.date}</span>
            <span class="travel-badge-loc">📍 ${entry.location}</span>
          </div>
          <div class="travel-card-main">
            ${thumbHtml}
            <div class="travel-card-info">
              <h3 class="travel-card-title">${entry.title}</h3>
              <p class="travel-card-preview">${entry.content}</p>
            </div>
          </div>
        `;
  
        // 카드 클릭 시 상세 모달 오픈
        card.addEventListener('click', () => {
          openTravelDetail(entry);
        });
  
        travelCardsContainer.appendChild(card);
      });
    }
  
    function openTravelDetail(entry) {
      currentDetailId = entry.id;
      detailDate.innerText = `📅 ${entry.date}`;
      detailLoc.innerText = `📍 ${entry.location}`;
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
        if (currentDetailId && confirm('이 여행 기록을 삭제할까요?')) {
          const updated = getEntries().filter(item => item.id !== currentDetailId);
          saveEntries(updated);
          modal.style.display = 'none';
          renderTravelList();
        }
      });
    }
  
    renderTravelList();
  });