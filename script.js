// =========================================
// PHẦN 1: TÀI KHOẢN & PHÂN QUYỀN
// =========================================
const initialValidCodes = ["VIP2026", "HTA001", "PVK999", "TESTWEB"];
let dbUsers = JSON.parse(localStorage.getItem('dbUsers')) || {}; 
let dbValidCodes = JSON.parse(localStorage.getItem('dbValidCodes')) || initialValidCodes;
let currentUser = null;
let currentMode = 'login';

// Danh sách Admin
const ADMIN_ACCOUNTS = ['hta', 'pvk', 'admin', 'vip'];

function switchTab(mode) {
  currentMode = mode;
  document.getElementById('auth-msg').textContent = '';
  if(mode === 'login') {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('admin-code-group').style.display = 'none';
    document.getElementById('btn-auth').textContent = 'Đăng Nhập';
  } else {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('admin-code-group').style.display = 'block';
    document.getElementById('btn-auth').textContent = 'Tạo Tài Khoản';
  }
}

function showMsg(text, isError = true) {
  const msgBox = document.getElementById('auth-msg');
  msgBox.textContent = text;
  msgBox.className = isError ? 'msg-error' : 'msg-success';
}

function handleAuth() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const c = document.getElementById('adminCode').value.trim();
  if(!u || !p) return showMsg("Vui lòng điền đủ Tên và Mật khẩu!");

  if (currentMode === 'register') {
    if(!c) return showMsg("Vui lòng nhập Mã!");
    if(dbUsers[u]) return showMsg("Tài khoản đã tồn tại!");
    if(!dbValidCodes.includes(c)) return showMsg("Mã không hợp lệ!");

    dbUsers[u] = p;
    dbValidCodes = dbValidCodes.filter(code => code !== c);
    localStorage.setItem('dbUsers', JSON.stringify(dbUsers));
    localStorage.setItem('dbValidCodes', JSON.stringify(dbValidCodes));
    showMsg("Đăng ký thành công!", false);
    setTimeout(() => loginSuccess(u), 1000);
  } else {
    if(!dbUsers[u] || dbUsers[u] !== p) return showMsg("Tài khoản hoặc mật khẩu sai!");
    loginSuccess(u);
  }
}

function loginSuccess(username) {
  currentUser = username;
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('dash-username').textContent = `👤 ${username}`;
  
  if (ADMIN_ACCOUNTS.includes(username.toLowerCase())) {
    document.getElementById('btn-add-test').style.display = 'inline-block';
  } else {
    document.getElementById('btn-add-test').style.display = 'none';
  }
  showDashboard();
}

function logout() {
  currentUser = null;
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

// =========================================
// PHẦN 2: DATABASE MÔN HỌC
// =========================================
let defaultSubjects = {
  "toan": { name: "Toán", icon: "📐", tests: [] },
  "ly": { name: "Vật Lý", icon: "⚡", tests: [] },
  "tin": { name: "Tin Học", icon: "💻", tests: [] }
};
let dbSubjects = JSON.parse(localStorage.getItem('dbSubjects')) || defaultSubjects;
function saveSubjectsToStorage() { localStorage.setItem('dbSubjects', JSON.stringify(dbSubjects)); }

// =========================================
// PHẦN 3: SẢNH CHỜ & QUẢN LÝ ĐỀ (ADMIN)
// =========================================
function showDashboard() {
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'flex';
  document.getElementById('subject-grid').style.display = 'grid';
  document.getElementById('test-selection').style.display = 'none';
  document.getElementById('dash-main-title').textContent = "Chọn môn học";

  const grid = document.getElementById('subject-grid');
  grid.innerHTML = '';
  Object.keys(dbSubjects).forEach(subKey => {
    const sub = dbSubjects[subKey];
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.onclick = () => showTestList(subKey);
    card.innerHTML = `<div class="subject-icon">${sub.icon}</div><div class="subject-name">${sub.name}</div><div style="font-size: 0.85rem; color: #64748b; margin-top: 8px;">${sub.tests.length} đề thi</div>`;
    grid.appendChild(card);
  });
}

function showTestList(subKey) {
  const sub = dbSubjects[subKey];
  document.getElementById('subject-grid').style.display = 'none';
  document.getElementById('test-selection').style.display = 'block';
  document.getElementById('dash-main-title').textContent = `Môn: ${sub.name}`;

  const list = document.getElementById('test-list');
  list.innerHTML = '';
  if (sub.tests.length === 0) list.innerHTML = '<i>Chưa có đề thi nào trong mục này.</i>';
  
  sub.tests.forEach((test, index) => {
    const item = document.createElement('div');
    item.className = 'test-item';
    
    // Tích hợp nút Sửa / Xóa cho Admin
    let adminButtons = '';
    if (ADMIN_ACCOUNTS.includes(currentUser.toLowerCase())) {
        adminButtons = `
          <button style="background: #eab308; color: black; border: none; padding: 8px 12px; border-radius: 6px; font-weight:bold; cursor: pointer; margin-right: 8px;" onclick="editTest('${subKey}', ${index})">✏️ Sửa</button>
          <button style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-weight:bold; cursor: pointer; margin-right: 8px;" onclick="deleteTest('${subKey}', ${index})">🗑️ Xóa</button>
        `;
    }

    item.innerHTML = `
      <div>
        <h3 style="font-size:1.1rem; margin-bottom:5px;">${test.name}</h3>
        <div style="font-size:0.9rem; color:#64748b;">⏱ ${test.time} phút | 📝 ${test.questions.length} câu</div>
      </div>
      <div style="display: flex; align-items: center;">
        ${adminButtons}
        <button class="btn-start-test" onclick="startExam('${subKey}', ${index})">Làm Bài</button>
      </div>
    `;
    list.appendChild(item);
  });
}

function backToSubjects() {
  document.getElementById('subject-grid').style.display = 'grid';
  document.getElementById('test-selection').style.display = 'none';
  document.getElementById('dash-main-title').textContent = "Chọn môn học";
}

// Chức năng Edit Đề (Admin)
function editTest(subKey, testIndex) {
    const test = dbSubjects[subKey].tests[testIndex];
    const newName = prompt("Nhập tên mới cho đề thi:", test.name);
    if (!newName) return;
    const newTime = prompt("Nhập thời gian làm bài mới (phút):", test.time);
    if (!newTime || isNaN(newTime)) return;
    
    test.name = newName;
    test.time = parseInt(newTime);
    saveSubjectsToStorage();
    showTestList(subKey);
}

// Chức năng Xóa Đề (Admin)
function deleteTest(subKey, testIndex) {
    const testName = dbSubjects[subKey].tests[testIndex].name;
    if (confirm(`⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN đề:\n"${testName}" không?`)) {
        dbSubjects[subKey].tests.splice(testIndex, 1);
        saveSubjectsToStorage();
        showTestList(subKey);
    }
}

// =========================================
// PHẦN 4: THI & TÍNH ĐIỂM
// =========================================
let currentQuestions = [];
let currentTestTotalTime = 0;
let timerInterval = null;
let timeRemaining = 0;
let currentQIndex = 0; 
let userAnswers = {}; 
let isSubmitted = false;

function startExam(subKey, testIndex) {
  const testData = dbSubjects[subKey].tests[testIndex];
  currentQuestions = testData.questions;
  currentTestTotalTime = testData.time * 60;
  timeRemaining = currentTestTotalTime;
  
  document.getElementById('dashboard-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'flex';
  document.getElementById('exam-header-title').textContent = testData.name;
  
  currentQIndex = 0; userAnswers = {}; isSubmitted = false;
  document.getElementById('submit-btn').disabled = false;
  document.getElementById('submit-btn').textContent = "Nộp bài";
  document.getElementById('score-display').style.display = 'none';
  
  renderSidebar(); renderQuestion(); startTimer();
}

function startTimer() {
  clearInterval(timerInterval); updateTimerUI();
  timerInterval = setInterval(() => {
    timeRemaining--; updateTimerUI();
    if (timeRemaining <= 0) { clearInterval(timerInterval); alert("Hết giờ làm bài!"); submitTest(); }
  }, 1000);
}

function updateTimerUI() {
  const min = Math.floor(timeRemaining / 60); const sec = timeRemaining % 60;
  document.getElementById('countdown-timer').textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function exitExam() {
  if (!isSubmitted && !confirm("Bạn chưa nộp bài, thoát ra sẽ mất bài làm?")) return;
  clearInterval(timerInterval); showDashboard();
}

function renderSidebar() {
  const grid = document.getElementById('q-grid'); 
  grid.innerHTML = '';
  
  currentQuestions.forEach((q, index) => {
    const btn = document.createElement('div'); 
    btn.className = 'q-btn'; 
    btn.textContent = index + 1;
    btn.onclick = () => { currentQIndex = index; renderSidebar(); renderQuestion(); };
    
    // Fix mảng xanh nhiều câu: Reset class, chỉ gán đúng điều kiện
    btn.className = 'q-btn'; 
    if (index === currentQIndex) {
        btn.classList.add('active');
    } else {
        // Kiểm tra câu đã làm chưa cực kỳ khắt khe
        let ans = userAnswers[index];
        let isAns = false;
        if (ans !== undefined && ans !== null && ans !== '') {
            if (typeof ans === 'object') {
                if (Object.keys(ans).length > 0) isAns = true; // Câu T/F phải có tích chọn
            } else {
                isAns = true; // Câu MCQ hoặc Trả lời ngắn
            }
        }
        if (isAns) btn.classList.add('answered');
    }
    
    grid.appendChild(btn);
  });
}

function renderQuestion() {
  const q = currentQuestions[currentQIndex];
  const container = document.getElementById('answers-container'); container.innerHTML = '';
  
  const badge = document.getElementById('q-type-badge');
  if (q.type === 'mcq') badge.textContent = "Dạng: Trắc nghiệm 1 Lựa chọn";
  else if (q.type === 'tf') badge.textContent = "Dạng: Trắc nghiệm Đúng / Sai";
  else if (q.type === 'sa') badge.textContent = "Dạng: Trả lời ngắn";

  // Thêm Replace để Đề bài tự động xuống dòng chuẩn xác
  document.getElementById('q-title').innerHTML = q.text.replace(/\n/g, '<br>');
  document.getElementById('q-image-box').style.display = q.image ? 'block' : 'none';

  if (q.type === 'mcq') {
    const optsDiv = document.createElement('div'); optsDiv.className = 'options-container';
    Object.keys(q.options).forEach(key => {
      const opt = document.createElement('div'); opt.className = 'option';
      if (!isSubmitted) opt.onclick = () => { userAnswers[currentQIndex] = key; renderQuestion(); renderSidebar(); };
      if (userAnswers[currentQIndex] === key) opt.classList.add('selected');
      if (isSubmitted) {
        if (key === q.correct) opt.classList.add('correct');
        else if (userAnswers[currentQIndex] === key) opt.classList.add('wrong');
      }
      opt.innerHTML = `<div class="opt-label">${key}</div><div>${q.options[key]}</div>`;
      optsDiv.appendChild(opt);
    });
    container.appendChild(optsDiv);
  } else if (q.type === 'tf') {
    if (!userAnswers[currentQIndex]) userAnswers[currentQIndex] = {};
    const table = document.createElement('table'); table.className = 'tf-table';
    table.innerHTML = `<thead><tr><th>Ý Mệnh Đề</th><th style="width:140px; text-align:center;">Lựa chọn</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');
    Object.keys(q.items).forEach(subKey => {
      const row = document.createElement('tr');
      const userVal = userAnswers[currentQIndex][subKey];
      let btnGroup = `<div class="tf-btn-group"><button class="tf-btn ${userVal === 'Đ' ? 'selected-D' : ''}" onclick="selectTF('${subKey}', 'Đ')">Đúng</button><button class="tf-btn ${userVal === 'S' ? 'selected-S' : ''}" onclick="selectTF('${subKey}', 'S')">Sai</button></div>`;
      if (isSubmitted) btnGroup = `<b>ĐÁP ÁN: ${q.correct[subKey]}</b> (Chọn: ${userVal || 'Trống'})`;
      row.innerHTML = `<td><b>${subKey})</b> ${q.items[subKey]}</td><td style="text-align:center;">${btnGroup}</td>`;
      tbody.appendChild(row);
    });
    container.appendChild(table);
  } else if (q.type === 'sa') {
    const saDiv = document.createElement('div'); saDiv.className = 'short-answer-box';
    const userVal = userAnswers[currentQIndex] || '';
    if (!isSubmitted) saDiv.innerHTML = `<input type="text" class="short-answer-input" placeholder="Nhập kết quả..." value="${userVal}" oninput="saveSA(this.value)">`;
    else saDiv.innerHTML = `<div style="font-size: 1.1rem; margin-bottom: 8px;">Bạn đã nhập: <b>${userVal || 'Bỏ trống'}</b></div><div style="font-size: 1.1rem; color: #16a34a;">Đáp án chuẩn: <b>${q.correct}</b></div>`;
    container.appendChild(saDiv);
  }

  document.getElementById('btn-prev').disabled = currentQIndex === 0;
  document.getElementById('btn-next').disabled = currentQIndex === currentQuestions.length - 1;
}

function selectTF(subKey, val) { if(isSubmitted) return; if(!userAnswers[currentQIndex]) userAnswers[currentQIndex]={}; userAnswers[currentQIndex][subKey] = val; renderQuestion(); renderSidebar(); }
function saveSA(val) { if(isSubmitted) return; userAnswers[currentQIndex] = val.trim(); renderSidebar(); }
function changeQuestion(step) { currentQIndex += step; renderSidebar(); renderQuestion(); }

function submitTest() {
  if (isSubmitted) return; isSubmitted = true; clearInterval(timerInterval);
  document.getElementById('submit-btn').disabled = true; document.getElementById('submit-btn').textContent = "Đã nộp";

  let mcqCount = 0, tfCount = 0, saCount = 0;
  let mcqCorrect = 0, tfScoreTotal = 0, saCorrect = 0;

  currentQuestions.forEach((q, idx) => {
    const uAns = userAnswers[idx];
    if (q.type === 'mcq') {
      mcqCount++;
      if (uAns === q.correct) mcqCorrect++;
    }
    if (q.type === 'sa') {
      saCount++;
      if (uAns && uAns.toLowerCase() === q.correct.toLowerCase()) saCorrect++;
    }
    if (q.type === 'tf') {
      tfCount++;
      if (uAns) {
        let subCorrectCount = 0;
        Object.keys(q.correct).forEach(k => { if (uAns[k] === q.correct[k]) subCorrectCount++; });
        if (subCorrectCount === 1) tfScoreTotal += 0.1;
        else if (subCorrectCount === 2) tfScoreTotal += 0.25;
        else if (subCorrectCount === 3) tfScoreTotal += 0.5;
        else if (subCorrectCount === 4) tfScoreTotal += 1.0;
      }
    }
  });

  let totalMaxScore = (mcqCount * 0.25) + (tfCount * 1.0) + (saCount * 0.75);
  let userScoreRaw = (mcqCorrect * 0.25) + tfScoreTotal + (saCorrect * 0.75);
  let finalScore = totalMaxScore > 0 ? ((userScoreRaw / totalMaxScore) * 10).toFixed(2) : "0.00";

  let timeUsed = currentTestTotalTime - timeRemaining;
  let min = Math.floor(timeUsed / 60); let sec = timeUsed % 60;

  let statsHtml = `<div>Tổng điểm: <span>${finalScore} / 10 Điểm</span></div>`;
  if (mcqCount > 0) statsHtml += `<div>Trắc nghiệm: <span>${mcqCorrect}/${mcqCount} câu</span></div>`;
  if (tfCount > 0) statsHtml += `<div>Đúng/Sai: <span>${tfScoreTotal.toFixed(2)}/${tfCount} điểm</span></div>`;
  if (saCount > 0) statsHtml += `<div>Trả lời ngắn: <span>${saCorrect}/${saCount} câu</span></div>`;
  statsHtml += `<div>Thời gian: <span>${min}m ${sec}s</span></div>`;

  const scoreDiv = document.getElementById('score-display');
  scoreDiv.style.display = 'block';
  scoreDiv.innerHTML = `<div class="score-title">🎉 KẾT QUẢ BÀI THI 🎉</div><div class="score-stats">${statsHtml}</div>`;

  currentQIndex = 0; renderSidebar(); renderQuestion();
}

// =========================================
// PHẦN 5: ĐỌC FILE WORD (HTML PARSER SIÊU CẤP)
// =========================================
function openUploadModal() { document.getElementById('upload-modal').style.display = 'flex'; }
function closeUploadModal() { document.getElementById('upload-modal').style.display = 'none'; }

function processWordFile() {
  const fileInput = document.getElementById('import-file');
  const subjectKey = document.getElementById('import-subject').value;
  const title = document.getElementById('import-title').value.trim();
  const time = parseInt(document.getElementById('import-time').value) || 45;

  if (!title) return alert("Vui lòng nhập tên đề thi!");
  if (!fileInput.files.length) return alert("Vui lòng chọn File Word (.docx)!");

  const reader = new FileReader();
  reader.onload = function(e) {
    // SỬ DỤNG CONVERT TO HTML ĐỂ CHỐNG WORD ẨN BULLET/NUMBERING
    mammoth.convertToHtml({ arrayBuffer: e.target.result })
      .then(function(result) {
        const parsedQuestions = parseHtmlToQuestions(result.value);
        if (parsedQuestions.length === 0) return alert("Không quét được câu hỏi! Vui lòng kiểm tra lại định dạng file Word.");
        
        dbSubjects[subjectKey].tests.push({ id: "test_" + Date.now(), name: title, time: time, questions: parsedQuestions });
        saveSubjectsToStorage();
        alert(`🎉 Thành công! Nạp ${parsedQuestions.length} câu vào môn ${dbSubjects[subjectKey].name}.`);
        closeUploadModal(); showDashboard();
      }).catch(err => alert("Lỗi đọc file Word: " + err.message));
  };
  reader.readAsArrayBuffer(fileInput.files[0]);
}

function parseHtmlToQuestions(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  let lines = [];
  
  // Trích xuất text từ HTML ảo, phát hiện các thẻ Li (List) bị ẩn chữ
  tempDiv.childNodes.forEach(node => {
    if (node.nodeName === 'P' || /^H[1-6]$/.test(node.nodeName)) {
       const txt = node.textContent.trim();
       if(txt) lines.push(txt);
    } else if (node.nodeName === 'OL' || node.nodeName === 'UL') {
       node.querySelectorAll('li').forEach(li => {
          const txt = li.textContent.trim();
          if(txt) lines.push("[LI] " + txt);
       });
    } else if (node.nodeName === 'TABLE') {
       const txt = node.textContent.trim();
       if(txt) lines.push(txt);
    }
  });

  let questions = []; 
  let currentQ = null;
  let currentSectionType = 'mcq'; // Mặc định là Trắc nghiệm 1 đáp án

  lines.forEach(line => {
    let textUpper = line.toUpperCase();
    
    // Tự động nhảy dạng câu hỏi khi đọc tiêu đề
    if (textUpper.includes("PHẦN I ") || textUpper.includes("PHẦN 1") || textUpper.includes("NHIỀU PHƯƠNG ÁN")) {
        currentSectionType = 'mcq';
    } else if (textUpper.includes("PHẦN II ") || textUpper.includes("PHẦN 2") || textUpper.includes("ĐÚNG SAI")) {
        currentSectionType = 'tf';
    } else if (textUpper.includes("PHẦN III ") || textUpper.includes("PHẦN 3") || textUpper.includes("TRẢ LỜI NGẮN")) {
        currentSectionType = 'sa';
    }

    // Gặp câu hỏi mới
    if (/^Câu\s+\d+[\.\:\-]?/i.test(line)) {
      if (currentQ) questions.push(currentQ);
      currentQ = { text: line, type: currentSectionType, options: {}, items: {}, correct: '' };
    } 
    else if (currentQ) {
      // 1. Nếu đáp án gõ tay bình thường (A. B. C. D.)
      if (/^[A-D][\.\:\)]\s/i.test(line) || /^[A-D][\.\:\)]$/.test(line)) {
        currentQ.type = 'mcq';
        const key = line.charAt(0).toUpperCase();
        currentQ.options[key] = line.replace(/^[A-D][\.\:\)]\s*/i, '').trim() || " ";
      }
      // 2. Nếu đáp án Đúng/Sai gõ tay (a) b) c) d))
      else if (/^[a-d][\)\.]\s/i.test(line) || /^[a-d][\)\.]$/.test(line)) {
        currentQ.type = 'tf';
        const key = line.charAt(0).toLowerCase();
        currentQ.items[key] = line.replace(/^[a-d][\)\.]\s*/i, '').trim() || " ";
      }
      // 3. Nếu xài List Tự Động (Bị ẩn mất A B C D)
      else if (line.startsWith("[LI] ")) {
        let val = line.replace("[LI] ", "").trim();
        
        // Cứu vãn nếu người dùng vẫn gõ A B C D trong list
        if (/^[A-D][\.\:\)]/i.test(val)) {
            currentQ.type = 'mcq';
            const key = val.charAt(0).toUpperCase();
            currentQ.options[key] = val.replace(/^[A-D][\.\:\)]\s*/i, '').trim() || " ";
        } 
        else if (/^[a-d][\)\.]/i.test(val)) {
            currentQ.type = 'tf';
            const key = val.charAt(0).toLowerCase();
            currentQ.items[key] = val.replace(/^[a-d][\)\.]\s*/i, '').trim() || " ";
        }
        // Tự động gán bù A, B, C, D hoặc a, b, c, d
        else {
            if (currentQ.type === 'mcq') {
                const opts = Object.keys(currentQ.options);
                if (opts.length < 4) {
                    const nextKey = String.fromCharCode(65 + opts.length); // Tự sinh A, B, C, D
                    currentQ.options[nextKey] = val;
                } else {
                    currentQ.text += '\n- ' + val; 
                }
            } else if (currentQ.type === 'tf') {
                const items = Object.keys(currentQ.items);
                if (items.length < 4) {
                    const nextKey = String.fromCharCode(97 + items.length); // Tự sinh a, b, c, d
                    currentQ.items[nextKey] = val;
                } else {
                    currentQ.text += '\n- ' + val;
                }
            } else {
                currentQ.text += '\n- ' + val;
            }
        }
      }
      // 4. Bắt dòng Đáp Án
      else if (/^Đáp\s*án\s*[\:\.]?/i.test(line)) {
        const ansValue = line.replace(/^Đáp\s*án\s*[\:\.]?/i, '').trim();
        if (currentQ.type === 'tf') {
          currentQ.correct = {};
          ansValue.split(',').forEach(part => {
            const [k, v] = part.split('-').map(s => s.trim());
            if (k && v) currentQ.correct[k.toLowerCase()] = v.toUpperCase();
          });
        } else if (currentSectionType === 'sa') {
          currentQ.type = 'sa'; 
          currentQ.correct = ansValue;
        } else {
          currentQ.correct = ansValue.toUpperCase();
        }
      } 
      // 5. Nếu là chữ bình thường, nhét vào thân đề bài
      else {
        currentQ.text += '\n' + line.replace("[LI] ", "");
      }
    }
  });
  
  if (currentQ) questions.push(currentQ);
  return questions;
}