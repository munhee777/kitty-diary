document.addEventListener('DOMContentLoaded', () => {
  // ─── 1. 카테고리 선택 모달 팝업 로직 ───
  const openModalBtn = document.getElementById('open-category-modal');
  const closeModalBtn = document.getElementById('close-category-modal');
  const categoryModal = document.getElementById('category-modal');

  if (openModalBtn && categoryModal) {
    openModalBtn.addEventListener('click', () => {
      categoryModal.style.display = 'flex';
    });
    closeModalBtn.addEventListener('click', () => {
      categoryModal.style.display = 'none';
    });
    categoryModal.addEventListener('click', (e) => {
      if (e.target === categoryModal) categoryModal.style.display = 'none';
    });
  }

  // ─── 2. 모든 카테고리 스토리지 키 정의 (총 6개) ───
  const STORAGE_SCHEDULE_KEY = 'kitty_diary_schedules';
  const ALL_STORAGE_KEYS = [
    'kitty_daily_diary_entries',   // 🌸 일상 일기
    'kitty_emotion_diary_entries', // 💭 감정 일기
    'kitty_korea_food_map',        // 🍰 맛집 지도
    'kitty_travel_diary_entries',  // ✈️ 여행 일기
    'kitty_cafe_diary_entries',    // ☕ 카페 기록
    'kitty_diary_schedules'        // 🗓️ 캘린더 일정
  ];

  // ─── 3. 홈 화면 카테고리별 글 개수 뱃지 업데이트 ───
  function updateCategoryCounts() {
    const dailyCount = (JSON.parse(localStorage.getItem('kitty_daily_diary_entries') || '[]')).length;
    const emotionCount = (JSON.parse(localStorage.getItem('kitty_emotion_diary_entries') || '[]')).length;
    const foodCount = (JSON.parse(localStorage.getItem('kitty_korea_food_map') || '[]')).length;
    const travelCount = (JSON.parse(localStorage.getItem('kitty_travel_diary_entries') || '[]')).length;
    const cafeCount = (JSON.parse(localStorage.getItem('kitty_cafe_diary_entries') || '[]')).length;

    const countDailyElem = document.getElementById('count-daily');
    const countEmotionElem = document.getElementById('count-emotion');
    const countFoodElem = document.getElementById('count-food');
    const countTravelElem = document.getElementById('count-travel');
    const countCafeElem = document.getElementById('count-cafe');

    if (countDailyElem) countDailyElem.innerText = `${dailyCount}개`;
    if (countEmotionElem) countEmotionElem.innerText = `${emotionCount}개`;
    if (countFoodElem) countFoodElem.innerText = `${foodCount}개`;
    if (countTravelElem) countTravelElem.innerText = `${travelCount}개`;
    if (countCafeElem) countCafeElem.innerText = `${cafeCount}개`;
  }

  // ─── 4. 동적 캘린더 & 날짜별 일정 메모 로직 ───
  let currentDate = new Date();
  let selectedDateStr = formatDateKey(currentDate);

  const calMonthTitle = document.getElementById('cal-month-title');
  const calDatesGrid = document.getElementById('cal-dates-grid');
  const prevMonthBtn = document.getElementById('prev-month-btn');
  const nextMonthBtn = document.getElementById('next-month-btn');

  const selectedDateLabel = document.getElementById('selected-date-label');
  const scheduleInput = document.getElementById('schedule-input');
  const scheduleAddBtn = document.getElementById('schedule-add-btn');
  const scheduleList = document.getElementById('schedule-list');

  const eventDetailModal = document.getElementById('event-detail-modal');
  const closeDetailModalBtn = document.getElementById('close-detail-modal-btn');
  const detailDateElem = document.getElementById('detail-date');
  const detailTextElem = document.getElementById('detail-text');
  const detailDeleteBtn = document.getElementById('detail-delete-btn');
  let currentDetailEvent = null;

  function formatDateKey(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getSchedules() {
    const data = localStorage.getItem(STORAGE_SCHEDULE_KEY);
    return data ? JSON.parse(data) : {};
  }

  function saveSchedules(schedules) {
    localStorage.setItem(STORAGE_SCHEDULE_KEY, JSON.stringify(schedules));
  }

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (calMonthTitle) calMonthTitle.innerText = `${year}년 ${month + 1}월 🗓️`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    if (!calDatesGrid) return;
    calDatesGrid.innerHTML = '';
    const allSchedules = getSchedules();
    const todayStr = formatDateKey(new Date());

    for (let i = 0; i < firstDayIndex; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'cal-date empty';
      calDatesGrid.appendChild(emptyDiv);
    }

    for (let day = 1; day <= lastDate; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = (dateStr === todayStr);
      const isSelected = (dateStr === selectedDateStr);

      const dateBox = document.createElement('div');
      dateBox.className = `cal-date ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
      dateBox.dataset.date = dateStr;

      const numSpan = document.createElement('span');
      numSpan.className = 'date-num';
      numSpan.innerText = day;
      dateBox.appendChild(numSpan);

      const dayEvents = allSchedules[dateStr] || [];
      if (dayEvents.length > 0) {
        dayEvents.slice(0, 2).forEach(evt => {
          const memoSpan = document.createElement('span');
          memoSpan.className = 'cal-memo';
          memoSpan.innerText = evt.text;
          memoSpan.title = evt.text;
          
          memoSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailModal(dateStr, evt);
          });

          dateBox.appendChild(memoSpan);
        });

        if (dayEvents.length > 2) {
          const moreSpan = document.createElement('span');
          moreSpan.className = 'cal-memo-more';
          moreSpan.innerText = `+${dayEvents.length - 2}`;
          dateBox.appendChild(moreSpan);
        }
      }

      dateBox.addEventListener('click', () => {
        selectedDateStr = dateStr;
        document.querySelectorAll('.cal-date').forEach(el => el.classList.remove('selected'));
        dateBox.classList.add('selected');
        renderSelectedDateSchedules();
      });

      calDatesGrid.appendChild(dateBox);
    }

    renderSelectedDateSchedules();
  }

  function renderSelectedDateSchedules() {
    if (!selectedDateLabel || !scheduleList) return;
    const parts = selectedDateStr.split('-');
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    selectedDateLabel.innerText = `🎀 ${m}월 ${d}일의 메모 목록`;

    const allSchedules = getSchedules();
    const dayEvents = allSchedules[selectedDateStr] || [];

    scheduleList.innerHTML = '';

    if (dayEvents.length === 0) {
      scheduleList.innerHTML = '<li class="empty-schedule-msg">등록된 일정이 없어요. 메모를 추가해보세요 ₍ᐢ.ˬ.ᐢ₎</li>';
      return;
    }

    dayEvents.forEach(evt => {
      const li = document.createElement('li');
      li.className = 'schedule-item';
      li.innerHTML = `
        <span class="schedule-item-content">
          <strong>${evt.text}</strong>
        </span>
        <div class="schedule-item-actions">
          <button class="view-detail-btn" title="상세보기">🔍</button>
          <button class="delete-btn" title="삭제">✕</button>
        </div>
      `;

      li.querySelector('.view-detail-btn').addEventListener('click', () => {
        openDetailModal(selectedDateStr, evt);
      });

      li.querySelector('.delete-btn').addEventListener('click', () => {
        deleteSchedule(selectedDateStr, evt.id);
      });

      scheduleList.appendChild(li);
    });
  }

  function addSchedule() {
    if (!scheduleInput) return;
    const text = scheduleInput.value.trim();
    if (!text) {
      alert('메모 내용을 입력해주세요!');
      return;
    }

    const allSchedules = getSchedules();
    if (!allSchedules[selectedDateStr]) {
      allSchedules[selectedDateStr] = [];
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    allSchedules[selectedDateStr].push({
      id: Date.now(),
      text: text,
      time: timeStr
    });

    saveSchedules(allSchedules);
    scheduleInput.value = '';
    renderCalendar();
  }

  function deleteSchedule(dateKey, id) {
    const allSchedules = getSchedules();
    if (allSchedules[dateKey]) {
      allSchedules[dateKey] = allSchedules[dateKey].filter(item => item.id !== id);
      if (allSchedules[dateKey].length === 0) {
        delete allSchedules[dateKey];
      }
      saveSchedules(allSchedules);
      renderCalendar();
    }
  }

  function openDetailModal(dateKey, evt) {
    if (!eventDetailModal) return;
    currentDetailEvent = { dateKey, id: evt.id };
    const parts = dateKey.split('-');
    if (detailDateElem) detailDateElem.innerText = `📅 ${parts[0]}년 ${parts[1]}월 ${parts[2]}일 일정`;
    if (detailTextElem) detailTextElem.innerText = evt.text;
    eventDetailModal.style.display = 'flex';
  }

  if (closeDetailModalBtn && eventDetailModal) {
    closeDetailModalBtn.addEventListener('click', () => {
      eventDetailModal.style.display = 'none';
    });
    eventDetailModal.addEventListener('click', (e) => {
      if (e.target === eventDetailModal) eventDetailModal.style.display = 'none';
    });
  }

  if (detailDeleteBtn) {
    detailDeleteBtn.addEventListener('click', () => {
      if (currentDetailEvent && confirm('이 일정을 삭제할까요?')) {
        deleteSchedule(currentDetailEvent.dateKey, currentDetailEvent.id);
        eventDetailModal.style.display = 'none';
      }
    });
  }

  if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  if (scheduleAddBtn) scheduleAddBtn.addEventListener('click', addSchedule);
  if (scheduleInput) scheduleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSchedule();
  });

  // ─── 5. 데이터 백업(내보내기) & 복원(불러오기) 로직 ───
  const exportBtn = document.getElementById('export-backup-btn');
  const importTriggerBtn = document.getElementById('import-trigger-btn');
  const importFileInput = document.getElementById('import-file-input');

  // 백업 다운로드
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const backupData = {};
      ALL_STORAGE_KEYS.forEach(key => {
        const item = localStorage.getItem(key);
        // 비어있더라도 일상, 감정, 맛집, 여행, 카페, 캘린더 항목이 빠짐없이 JSON에 포함되도록 설정
        if (item) {
          backupData[key] = JSON.parse(item);
        } else {
          backupData[key] = (key === 'kitty_diary_schedules') ? {} : [];
        }
      });

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
      a.href = url;
      a.download = `kitty_diary_backup_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);

      alert('🎀 일상, 감정, 맛집, 여행, 카페, 캘린더의 모든 일기가 백업 파일로 저장되었습니다!');
    });
  }

  // 백업 복원
  if (importTriggerBtn && importFileInput) {
    importTriggerBtn.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          
          if (!confirm('백업 파일을 불러오면 현재 기기의 데이터가 백업 내용으로 변경됩니다. 진행할까요?')) {
            importFileInput.value = '';
            return;
          }

          Object.keys(importedData).forEach(key => {
            localStorage.setItem(key, JSON.stringify(importedData[key]));
          });

          alert('🎉 성공적으로 데이터를 복원했습니다! 화면을 새로고침합니다.');
          location.reload();
        } catch (err) {
          alert('올바른 백업 파일(.json)이 아닙니다.');
        }
      };
      reader.readAsText(file);
    });
  }

  // 초기 실행
  renderCalendar();
  updateCategoryCounts();
});