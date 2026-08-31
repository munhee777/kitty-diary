document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'kitty_cafe_diary_entries';
  
    // 기본 예시 데이터
    const defaultEntries = [];
  
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
  
    // ─── 1. 카페 작성 페이지 (cafe.html) ───
    const fileInput = document.getElementById('cafe-photo-input');
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
  
    const saveBtn = document.getElementById('save-cafe-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const date = document.getElementById('cafe-date').value;
        const mood = document.getElementById('cafe-mood').value;
        const name = document.getElementById('cafe-name').value.trim();
        const menu = document.getElementById('cafe-menu').value.trim();
        const address = document.getElementById('cafe-address').value.trim();
        const review = document.getElementById('cafe-review').value.trim();
  
        if (!name) {
          alert('카페 이름을 입력해주세요!');
          return;
        }
  
        const newEntry = {
          id: Date.now(),
          date: date || '2026-08-31',
          mood,
          name,
          menu,
          address,
          review,
          photo: currentPhotoBase64
        };
  
        const entries = getEntries();
        entries.unshift(newEntry);
        saveEntries(entries);
  
        alert(`[${name}] 카페 기록이 저장되었습니다! ☕💌`);
        location.href = 'cafe-list.html'; // 저장 후 보관함 페이지로 이동
      });
    }
  
    // ─── 2. 카페 보관함 페이지 (cafe-list.html) ───
    const cafeCardsContainer = document.getElementById('cafe-cards-container');
    const modal = document.getElementById('cafe-detail-modal');
    const modalCloseBtn = document.getElementById('cafe-modal-close-btn');
  
    const detailDate = document.getElementById('detail-cafe-date');
    const detailMood = document.getElementById('detail-cafe-mood');
    const detailTitle = document.getElementById('detail-cafe-title');
    const detailImg = document.getElementById('detail-cafe-img');
    const detailBody = document.getElementById('detail-cafe-body');
    const detailAddr = document.getElementById('detail-cafe-addr');
    const detailMapLink = document.getElementById('detail-cafe-map-link');
    const detailDeleteBtn = document.getElementById('detail-cafe-delete-btn');
    let currentDetailId = null;
  
    function renderCafeList() {
      if (!cafeCardsContainer) return;
  
      const entries = getEntries();
      cafeCardsContainer.innerHTML = '';
  
      if (entries.length === 0) {
        cafeCardsContainer.innerHTML = '<div style="text-align:center; padding:25px; color:#b58d99; font-size:1.15rem;">아직 기록된 카페 일기가 없어요 ₍ᐢ.ˬ.ᐢ₎</div>';
        return;
      }
  
      entries.forEach(entry => {
        const card = document.createElement('article');
        card.className = 'entry-card-box cafe-entry-card';
  
        let thumbHtml = '';
        if (entry.photo) {
          thumbHtml = `<img src="${entry.photo}" alt="카페 사진" class="cafe-card-thumb">`;
        }
  
        const fullTitle = entry.menu ? `${entry.name} - ${entry.menu}` : entry.name;
        const searchQuery = encodeURIComponent(entry.address ? `${entry.name} ${entry.address}` : entry.name);
        const naverMapUrl = `https://map.naver.com/p/search/${searchQuery}`;
  
        card.innerHTML = `
          <div class="cafe-card-header">
            <span>📅 ${entry.date}</span>
            <span class="cafe-badge-mood">${entry.mood}</span>
          </div>
          <div class="cafe-card-main">
            ${thumbHtml}
            <div class="cafe-card-info">
              <h3 class="cafe-card-title">${fullTitle}</h3>
              <p class="cafe-card-preview">${entry.review || '작성된 리뷰가 없습니다.'}</p>
            </div>
          </div>
          <div class="cafe-card-bottom">
            <span class="cafe-addr-text">📍 ${entry.address || '주소 미입력'}</span>
            <a href="${naverMapUrl}" target="_blank" class="naver-map-btn" onclick="event.stopPropagation();">
              🗺️ 네이버지도
            </a>
          </div>
        `;
  
        // 카드 클릭 시 상세 모달 오픈
        card.addEventListener('click', () => {
          openCafeDetail(entry, naverMapUrl);
        });
  
        cafeCardsContainer.appendChild(card);
      });
    }
  
    function openCafeDetail(entry, naverMapUrl) {
      currentDetailId = entry.id;
      detailDate.innerText = `📅 ${entry.date}`;
      detailMood.innerText = entry.mood;
      detailTitle.innerText = entry.menu ? `${entry.name} - ${entry.menu}` : entry.name;
      detailBody.innerText = entry.review || '작성된 리뷰가 없습니다.';
      detailAddr.innerText = entry.address || '주소 정보 없음 (카페명으로 검색)';
      detailMapLink.href = naverMapUrl;
  
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
        if (currentDetailId && confirm('이 카페 기록을 삭제할까요?')) {
          const updated = getEntries().filter(item => item.id !== currentDetailId);
          saveEntries(updated);
          modal.style.display = 'none';
          renderCafeList();
        }
      });
    }
  
    renderCafeList();
  });