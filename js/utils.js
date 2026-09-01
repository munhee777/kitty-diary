// ─── 공통 유틸리티 함수 ───

// 1. 고화질 사진을 localStorage 용량에 맞게 자동 리사이징 & 압축 (50KB 이하로 최적화)
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
  
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
  
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          // JPEG 포맷으로 압축
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }
  
  // 2. 현재 접속 세션 기준 오늘 날짜를 YYYY-MM-DD 형태로 반환
  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // 3. 날짜 입력 필드에 오늘 날짜 자동 세팅 (URL 파라미터가 있다면 우선 적용)
  function initDateField(inputElementId) {
    const dateInput = document.getElementById(inputElementId);
    if (!dateInput) return;
  
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDate = urlParams.get('date');
  
    if (selectedDate) {
      dateInput.value = selectedDate;
    } else {
      dateInput.value = getTodayDateString();
    }
  }