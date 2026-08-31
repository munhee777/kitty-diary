document.addEventListener('DOMContentLoaded', () => {
  // 1. 사진 업로드 로직
  const fileInput = document.getElementById('food-photo-input');
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

  // 2. 지역별 데이터 저장 및 지도 카운트
  const STORAGE_KEY = 'kitty_korea_food_map';

  function getData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return []; // 기본 예시 데이터 없이 빈 배열 반환
    }
    return JSON.parse(saved);
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function updateMapCounts() {
    const data = getData();
    const regions = ['seoul', 'gyeonggi', 'gangwon', 'chungcheong', 'gyeongsang', 'jeolla', 'jeju'];
    regions.forEach(reg => {
      const count = data.filter(item => item.region === reg).length;
      const countElem = document.getElementById(`count-${reg}`);
      if (countElem) countElem.innerText = count;
    });
  }

  const regionNames = {
    seoul: '서울',
    gyeonggi: '경기 / 인천',
    gangwon: '강원',
    chungcheong: '충청 / 대전',
    gyeongsang: '경상 / 부산 / 대구',
    jeolla: '전라 / 광주',
    jeju: '제주'
  };

  // 지하철역/랜드마크 대응 스마트 검색어 생성
  function generateSmartSearchQuery(name, address) {
    if (!address) return encodeURIComponent(name);

    const cleanName = name.trim();
    const cleanAddr = address.trim();

    if (cleanName.includes(cleanAddr)) {
      return encodeURIComponent(cleanName);
    }

    const addrTokens = cleanAddr.split(' ').filter(token => token.length > 0);
    if (addrTokens.length <= 2) {
      return encodeURIComponent(`${cleanName} ${cleanAddr}`);
    }

    let coreLocation = addrTokens[1] || addrTokens[0];
    const stationOrDong = addrTokens.find(t => t.endsWith('역') || t.endsWith('동') || t.endsWith('구'));
    if (stationOrDong) {
      coreLocation = stationOrDong;
    }

    return encodeURIComponent(`${cleanName} ${coreLocation}`);
  }

  // 지역 상세 목록 렌더링
  window.showRegionDetails = function(regionKey) {
    const data = getData();
    const filtered = data.filter(item => item.region === regionKey);
    const detailBox = document.getElementById('region-detail-box');
    const titleElem = document.getElementById('selected-region-title');
    const listElem = document.getElementById('region-restaurant-list');

    titleElem.innerText = `📍 ${regionNames[regionKey]} 맛집 목록 (${filtered.length}곳)`;
    listElem.innerHTML = '';

    if (filtered.length === 0) {
      listElem.innerHTML = '<li style="text-align:center; color:#b58d99; padding:15px; font-size:1.05rem;">아직 등록된 맛집이 없어요 ₍ᐢ.ˬ.ᐢ₎</li>';
    } else {
      filtered.forEach(item => {
        const queryTerm = generateSmartSearchQuery(item.name, item.address);
        const naverMapUrl = `https://map.naver.com/p/search/${queryTerm}`;

        const li = document.createElement('li');
        li.className = 'res-item';
        li.innerHTML = `
          <div class="res-info">
            <div class="res-name">✨ ${item.name}</div>
            <div class="res-addr">${item.address || '위치 미입력'}</div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <a href="${naverMapUrl}" target="_blank" class="naver-map-btn">
              🗺️ 네이버지도
            </a>
            <button class="delete-btn" style="background:none; border:none; color:#a86b7c; cursor:pointer; font-size:1.1rem; padding:2px;" title="삭제">✕</button>
          </div>
        `;

        // 삭제 이벤트
        li.querySelector('.delete-btn').addEventListener('click', () => {
          if (confirm(`[${item.name}] 맛집을 삭제할까요?`)) {
            const allData = getData().filter(d => d.id !== item.id);
            saveData(allData);
            updateMapCounts();
            showRegionDetails(regionKey);
          }
        });

        listElem.appendChild(li);
      });
    }

    detailBox.style.display = 'block';
    detailBox.scrollIntoView({ behavior: 'smooth' });
  };

  window.closeRegionDetails = function() {
    document.getElementById('region-detail-box').style.display = 'none';
  };

  // 3. 맛집 저장
  const saveBtn = document.getElementById('save-entry-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const region = document.getElementById('food-region').value;
      const name = document.getElementById('food-name').value.trim();
      const address = document.getElementById('food-address').value.trim();

      if (!name) {
        alert('식당 이름을 입력해주세요!');
        return;
      }

      const newEntry = {
        id: Date.now(),
        region,
        name,
        address
      };

      const data = getData();
      data.unshift(newEntry);
      saveData(data);
      updateMapCounts();

      document.getElementById('food-name').value = '';
      document.getElementById('food-address').value = '';
      if (document.getElementById('food-review')) {
        document.getElementById('food-review').value = '';
      }
      if (fileInput) fileInput.value = '';
      if (previewImg) previewImg.src = '';
      if (previewBox) previewBox.style.display = 'none';
      if (uploadTrigger) uploadTrigger.style.display = 'flex';

      alert(`[${name}]이(가) 전국 맛집 지도(${regionNames[region]})에 등록되었습니다! 🗺️✨`);
      location.href = 'food-list.html';
    });
  }

  updateMapCounts();
});