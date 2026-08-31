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

    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      currentPhotoBase64 = '';
      previewImg.src = '';
      previewBox.style.display = 'none';
      uploadTrigger.style.display = 'flex';
    });
  }

  // 2. 지역별 데이터 저장 및 지도 카운트
  const STORAGE_KEY = 'kitty_korea_food_map';

  const defaultData = [
    { id: 1, region: 'seoul', name: '런던베이글뮤지엄', address: '안국점' },
    { id: 2, region: 'seoul', name: '키티 팬케이크', address: '강남역' },
    { id: 3, region: 'gyeonggi', name: '춘천닭갈비', address: '의왕역' },
    { id: 4, region: 'gyeongsang', name: '해운대 가야밀면', address: '해운대구' },
    { id: 5, region: 'jeju', name: '숙성도', address: '애월' }
  ];

  function getData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
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

  // ─── 지하철역/랜드마크/상세위치 스마트 검색어 생성 함수 ───
  function generateSmartSearchQuery(name, address) {
    if (!address) return encodeURIComponent(name);

    const cleanName = name.trim();
    const cleanAddr = address.trim();

    // 1. 식당명에 이미 해당 지점/위치가 완전히 포함된 경우
    if (cleanName.includes(cleanAddr)) {
      return encodeURIComponent(cleanName);
    }

    // 2. 상세위치가 '의왕역', '강남역', '홍대입구', '삼청동', '안국점'처럼 1~2단어의 짧은 표현인 경우
    // -> 그대로 식당명 뒤에 붙여줌 (예: '춘천닭갈비 의왕역')
    const addrTokens = cleanAddr.split(' ').filter(token => token.length > 0);
    
    if (addrTokens.length <= 2) {
      return encodeURIComponent(`${cleanName} ${cleanAddr}`);
    }

    // 3. '서울 종로구 북촌로4길 20 1층'처럼 긴 도로명/지번 주소인 경우
    // -> '구/동/역/길' 등의 핵심 키워드 1~2개만 추출해 깔끔하게 조합
    // 예: '서울 종로구 북촌로 4길' -> '종로구' 또는 '북촌'
    let coreLocation = addrTokens[1] || addrTokens[0];
    
    // 주소 안에 '역'이나 '동'이 들어간 단어가 있으면 우선 추출
    const stationOrDong = addrTokens.find(t => t.endsWith('역') || t.endsWith('동') || t.endsWith('구'));
    if (stationOrDong) {
      coreLocation = stationOrDong;
    }

    return encodeURIComponent(`${cleanName} ${coreLocation}`);
  }

  window.showRegionDetails = function(regionKey) {
    const data = getData();
    const filtered = data.filter(item => item.region === regionKey);
    const detailBox = document.getElementById('region-detail-box');
    const titleElem = document.getElementById('selected-region-title');
    const listElem = document.getElementById('region-restaurant-list');

    titleElem.innerText = `📍 ${regionNames[regionKey]} 맛집 목록 (${filtered.length}곳)`;
    listElem.innerHTML = '';

    if (filtered.length === 0) {
      listElem.innerHTML = '<li style="text-align:center; color:#b58d99; padding:10px;">아직 등록된 맛집이 없어요 ₍ᐢ.ˬ.ᐢ₎</li>';
    } else {
      filtered.forEach(item => {
        // 지하철역/랜드마크 대응 검색어 생성
        const queryTerm = generateSmartSearchQuery(item.name, item.address);
        const naverMapUrl = `https://map.naver.com/p/search/${queryTerm}`;

        const li = document.createElement('li');
        li.className = 'res-item';
        li.innerHTML = `
          <div class="res-info">
            <div class="res-name">✨ ${item.name}</div>
            <div class="res-addr">${item.address || '위치 미입력'}</div>
          </div>
          <a href="${naverMapUrl}" target="_blank" class="naver-map-btn">
            🗺️ 네이버지도
          </a>
        `;
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
      document.getElementById('food-review').value = '';
      fileInput.value = '';
      previewImg.src = '';
      previewBox.style.display = 'none';
      uploadTrigger.style.display = 'flex';

      alert(`[${name}]이(가) 전국 맛집 지도(${regionNames[region]})에 등록되었습니다! 🗺️✨`);
      window.showRegionDetails(region);
    });
  }

  updateMapCounts();
});