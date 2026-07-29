// =========================================
// PHẦN 1: TÀI KHOẢN (CÀI CỨNG ĐỂ BẠN BÈ VÀO)
// =========================================
const initialValidCodes = ["VIP2026", "HTA001", "PVK999", "CODE1"];
let defaultUsers = {
  "admin": "123", "hta": "123", "pvk": "123",
  "bantoi1": "123456", "bantoi2": "123456" // Đưa nick này cho bạn
};

let dbUsers = JSON.parse(localStorage.getItem('dbUsers')) || defaultUsers; 
let dbValidCodes = JSON.parse(localStorage.getItem('dbValidCodes')) || initialValidCodes;
let currentUser = null;
let currentMode = 'login';
const ADMIN_ACCOUNTS = ['hta', 'pvk', 'admin'];

function switchTab(mode) {
  currentMode = mode; document.getElementById('auth-msg').textContent = '';
  if(mode === 'login') {
    document.getElementById('tab-login').classList.add('active'); document.getElementById('tab-register').classList.remove('active');
    document.getElementById('admin-code-group').style.display = 'none'; document.getElementById('btn-auth').textContent = 'Đăng Nhập';
  } else {
    document.getElementById('tab-register').classList.add('active'); document.getElementById('tab-login').classList.remove('active');
    document.getElementById('admin-code-group').style.display = 'block'; document.getElementById('btn-auth').textContent = 'Tạo Tài Khoản';
  }
}
function showMsg(text, isError = true) {
  const msgBox = document.getElementById('auth-msg'); msgBox.textContent = text; msgBox.className = isError ? 'msg-error' : 'msg-success';
}
function handleAuth() {
  const u = document.getElementById('username').value.trim(); const p = document.getElementById('password').value.trim();
  const c = document.getElementById('adminCode').value.trim();
  if(!u || !p) return showMsg("Vui lòng điền đủ Tên và Mật khẩu!");
  if (currentMode === 'register') {
    if(!c) return showMsg("Vui lòng nhập Mã!"); if(dbUsers[u]) return showMsg("Tài khoản đã tồn tại!"); if(!dbValidCodes.includes(c)) return showMsg("Mã không hợp lệ!");
    dbUsers[u] = p; dbValidCodes = dbValidCodes.filter(code => code !== c);
    localStorage.setItem('dbUsers', JSON.stringify(dbUsers)); localStorage.setItem('dbValidCodes', JSON.stringify(dbValidCodes));
    showMsg("Đăng ký thành công!", false); setTimeout(() => loginSuccess(u), 1000);
  } else {
    if((defaultUsers[u] && defaultUsers[u] === p) || (dbUsers[u] && dbUsers[u] === p)) loginSuccess(u);
    else showMsg("Tài khoản hoặc mật khẩu sai!");
  }
}
function loginSuccess(username) {
  currentUser = username;
  document.getElementById('auth-screen').style.display = 'none'; document.getElementById('dash-username').textContent = `👤 ${username}`;
  document.getElementById('btn-add-test').style.display = ADMIN_ACCOUNTS.includes(username.toLowerCase()) ? 'inline-block' : 'none';
  showDashboard();
}
function logout() {
  currentUser = null; document.getElementById('app-screen').style.display = 'none'; document.getElementById('dashboard-screen').style.display = 'none'; document.getElementById('auth-screen').style.display = 'flex';
}

// =========================================
// PHẦN 2: DATABASE MÔN HỌC & SẢNH CHỜ
// =========================================
// TỰ ĐỘNG ĐỌC TỪ FILE database.js (Không lưu tĩnh nữa)
let dbSubjects = JSON.parse(localStorage.getItem('dbSubjects')) || (typeof globalData !== 'undefined' ? globalData : {});

function saveSubjectsToStorage() { localStorage.setItem('dbSubjects', JSON.stringify(dbSubjects)); }

function showDashboard() {
  document.getElementById('app-screen').style.display = 'none'; document.getElementById('dashboard-screen').style.display = 'flex';
  document.getElementById('subject-grid').style.display = 'grid'; document.getElementById('test-selection').style.display = 'none';
  document.getElementById('dash-main-title').textContent = "Chọn môn học";
  
  // Tự động tạo nút Xuất Code nếu là Admin
  if (ADMIN_ACCOUNTS.includes(currentUser.toLowerCase()) && !document.getElementById('btn-export-data')) {
      const btnExp = document.createElement('button');
      btnExp.id = 'btn-export-data';
      btnExp.innerHTML = '📤 Lấy Code Cập Nhật Web';
      btnExp.style = 'background: #8b5cf6; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; margin-left: 10px; font-weight: bold;';
      btnExp.onclick = exportDataForGithub;
      document.getElementById('btn-add-test').parentNode.appendChild(btnExp);
  }

  const grid = document.getElementById('subject-grid'); grid.innerHTML = '';
  Object.keys(dbSubjects).forEach(subKey => {
    const sub = dbSubjects[subKey]; const card = document.createElement('div'); card.className = 'subject-card'; card.onclick = () => showTestList(subKey);
    card.innerHTML = `<div class="subject-icon">${sub.icon}</div><div class="subject-name">${sub.name}</div><div style="font-size: 0.85rem; color: #64748b; margin-top: 8px;">${sub.tests.length} đề thi</div>`;
    grid.appendChild(card);
  });
}

function showTestList(subKey) {
  const sub = dbSubjects[subKey];
  document.getElementById('subject-grid').style.display = 'none'; document.getElementById('test-selection').style.display = 'block'; document.getElementById('dash-main-title').textContent = `Môn: ${sub.name}`;
  const list = document.getElementById('test-list'); list.innerHTML = '';
  if (sub.tests.length === 0) list.innerHTML = '<i>Chưa có đề thi nào trong mục này.</i>';
  sub.tests.forEach((test, index) => {
    const item = document.createElement('div'); item.className = 'test-item';
    let adminBtns = ADMIN_ACCOUNTS.includes(currentUser.toLowerCase()) ? `<button style="background: #ef4444; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; margin-right: 8px;" onclick="deleteTest('${subKey}', ${index})">🗑️ Xóa</button>` : '';
    item.innerHTML = `<div><h3 style="font-size:1.1rem; margin-bottom:5px;">${test.name}</h3><div style="font-size:0.9rem; color:#64748b;">⏱ ${test.time} phút | 📝 ${test.questions.length} câu</div></div><div style="display: flex;">${adminBtns}<button class="btn-start-test" onclick="startExam('${subKey}', ${index})">Làm Bài</button></div>`;
    list.appendChild(item);
  });
}
function backToSubjects() { showDashboard(); }
function deleteTest(subKey, index) { if (confirm("Xóa đề này?")) { dbSubjects[subKey].tests.splice(index, 1); saveSubjectsToStorage(); showTestList(subKey); } }

// TÍNH NĂNG XUẤT CODE CHO GITHUB CHUẨN DATABASE.JS
function exportDataForGithub() {
    let dataStr = JSON.stringify(dbSubjects, null, 2); 
    let codeToCopy = `const globalData = ${dataStr};`;
    navigator.clipboard.writeText(codeToCopy).then(() => {
        alert("✅ ĐÃ COPY DỮ LIỆU ĐỀ THI!\n\nÔng hãy mở file 'database.js' lên, bôi đen xóa hết code cũ đi và DÁN đè code mới này vào là xong!");
    }).catch(err => alert("Lỗi Copy: " + err));
}

// =========================================
// PHẦN 3: THI & TÍNH ĐIỂM
// =========================================
let currentQuestions = []; let currentTestTotalTime = 0; let timerInterval = null; let timeRemaining = 0; let currentQIndex = 0; let userAnswers = {}; let isSubmitted = false;
function startExam(subKey, testIndex) {
  const testData = dbSubjects[subKey].tests[testIndex]; currentQuestions = testData.questions; currentTestTotalTime = testData.time * 60; timeRemaining = currentTestTotalTime;
  document.getElementById('dashboard-screen').style.display = 'none'; document.getElementById('app-screen').style.display = 'flex'; document.getElementById('exam-header-title').textContent = testData.name;
  currentQIndex = 0; userAnswers = {}; isSubmitted = false; document.getElementById('submit-btn').disabled = false; document.getElementById('submit-btn').textContent = "Nộp bài"; document.getElementById('score-display').style.display = 'none';
  renderSidebar(); renderQuestion(); startTimer();
}
function startTimer() {
  clearInterval(timerInterval); updateTimerUI();
  timerInterval = setInterval(() => { timeRemaining--; updateTimerUI(); if (timeRemaining <= 0) { clearInterval(timerInterval); alert("Hết giờ!"); submitTest(); } }, 1000);
}
function updateTimerUI() {
  const min = Math.floor(timeRemaining / 60); const sec = timeRemaining % 60; document.getElementById('countdown-timer').textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
function exitExam() { if (!isSubmitted && !confirm("Chưa nộp bài, thoát sẽ mất bài?")) return; clearInterval(timerInterval); showDashboard(); }

function renderSidebar() {
  const grid = document.getElementById('q-grid'); grid.innerHTML = '';
  currentQuestions.forEach((q, index) => {
    const btn = document.createElement('div'); btn.className = 'q-btn'; btn.textContent = index + 1;
    btn.onclick = () => { currentQIndex = index; renderSidebar(); renderQuestion(); };
    if (index === currentQIndex) btn.classList.add('active');
    else { let ans = userAnswers[index]; if (ans && (typeof ans !== 'object' || Object.keys(ans).length > 0)) btn.classList.add('answered'); }
    grid.appendChild(btn);
  });
}

function renderQuestion() {
  const q = currentQuestions[currentQIndex]; const container = document.getElementById('answers-container'); container.innerHTML = '';
  document.getElementById('q-type-badge').textContent = q.type === 'mcq' ? "Dạng: 1 Lựa chọn" : q.type === 'tf' ? "Dạng: Đúng/Sai" : "Dạng: Trả lời ngắn";
  document.getElementById('q-title').innerHTML = q.text.replace(/\n/g, '<br>');
  const imgBox = document.getElementById('q-image-box');
  if (q.image) { imgBox.style.display = 'block'; imgBox.innerHTML = `<img src="${q.image}" style="max-width: 100%; max-height: 400px; border-radius: 8px;">`; } else { imgBox.style.display = 'none'; }

  if (q.type === 'mcq') {
    const optsDiv = document.createElement('div'); optsDiv.className = 'options-container';
    Object.keys(q.options).forEach(key => {
      const opt = document.createElement('div'); opt.className = 'option';
      if (!isSubmitted) opt.onclick = () => { userAnswers[currentQIndex] = key; renderQuestion(); renderSidebar(); };
      if (userAnswers[currentQIndex] === key) opt.classList.add('selected');
      if (isSubmitted) { if (key === q.correct) opt.classList.add('correct'); else if (userAnswers[currentQIndex] === key) opt.classList.add('wrong'); }
      opt.innerHTML = `<div class="opt-label">${key}</div><div>${q.options[key]}</div>`; optsDiv.appendChild(opt);
    }); container.appendChild(optsDiv);
  } else if (q.type === 'tf') {
    if (!userAnswers[currentQIndex]) userAnswers[currentQIndex] = {};
    const table = document.createElement('table'); table.className = 'tf-table'; table.innerHTML = `<thead><tr><th>Ý Mệnh Đề</th><th style="width:140px; text-align:center;">Lựa chọn</th></tr></thead><tbody></tbody>`;
    Object.keys(q.items).forEach(subKey => {
      const row = document.createElement('tr'); const userVal = userAnswers[currentQIndex][subKey];
      let btnGroup = `<div class="tf-btn-group"><button class="tf-btn ${userVal === 'Đ' ? 'selected-D' : ''}" onclick="selectTF('${subKey}', 'Đ')">Đúng</button><button class="tf-btn ${userVal === 'S' ? 'selected-S' : ''}" onclick="selectTF('${subKey}', 'S')">Sai</button></div>`;
      if (isSubmitted) btnGroup = `<b>ĐÁP ÁN: ${q.correct[subKey]}</b>`;
      row.innerHTML = `<td><b>${subKey})</b> ${q.items[subKey]}</td><td style="text-align:center;">${btnGroup}</td>`; table.querySelector('tbody').appendChild(row);
    }); container.appendChild(table);
  } else if (q.type === 'sa') {
    const saDiv = document.createElement('div'); saDiv.className = 'short-answer-box';
    if (!isSubmitted) saDiv.innerHTML = `<input type="text" class="short-answer-input" placeholder="Nhập kết quả..." value="${userAnswers[currentQIndex] || ''}" oninput="saveSA(this.value)">`;
    else saDiv.innerHTML = `<div>Bạn đã nhập: <b>${userAnswers[currentQIndex] || 'Trống'}</b></div><div style="color: #16a34a; margin-top:5px;">Đáp án chuẩn: <b>${q.correct}</b></div>`; container.appendChild(saDiv);
  }
  document.getElementById('btn-prev').disabled = currentQIndex === 0; document.getElementById('btn-next').disabled = currentQIndex === currentQuestions.length - 1;
}

function selectTF(k, v) { if(isSubmitted) return; if(!userAnswers[currentQIndex]) userAnswers[currentQIndex]={}; userAnswers[currentQIndex][k] = v; renderQuestion(); renderSidebar(); }
function saveSA(v) { if(isSubmitted) return; userAnswers[currentQIndex] = v.trim(); renderSidebar(); }
function changeQuestion(s) { currentQIndex += s; renderSidebar(); renderQuestion(); }

function submitTest() {
  if (isSubmitted) return; isSubmitted = true; clearInterval(timerInterval); document.getElementById('submit-btn').disabled = true; document.getElementById('submit-btn').textContent = "Đã nộp";
  let scoreRaw = 0, totalMax = 0;
  currentQuestions.forEach((q, idx) => {
    let uAns = userAnswers[idx];
    if (q.type === 'mcq') { totalMax += 0.25; if (uAns === q.correct) scoreRaw += 0.25; }
    if (q.type === 'sa') { totalMax += 0.75; if (uAns && uAns.toLowerCase() === (q.correct||'').toLowerCase()) scoreRaw += 0.75; }
    if (q.type === 'tf') {
      totalMax += 1.0;
      if (uAns && q.correct) {
        let c = 0; Object.keys(q.correct).forEach(k => { if(uAns[k] === q.correct[k]) c++; });
        if(c===1) scoreRaw+=0.1; else if(c===2) scoreRaw+=0.25; else if(c===3) scoreRaw+=0.5; else if(c===4) scoreRaw+=1.0;
      }
    }
  });
  let finalScore = totalMax > 0 ? ((scoreRaw / totalMax) * 10).toFixed(2) : "0.00";
  const scoreDiv = document.getElementById('score-display'); scoreDiv.style.display = 'block'; scoreDiv.innerHTML = `<div class="score-title">🎉 KẾT QUẢ: ${finalScore} / 10 Điểm 🎉</div>`;
  currentQIndex = 0; renderSidebar(); renderQuestion();
}

// =========================================
// PHẦN 4: ĐỌC FILE WORD (FIX LỖI BULLETS/NUMBERING)
// =========================================
function openUploadModal() { document.getElementById('upload-modal').style.display = 'flex'; }
function closeUploadModal() { document.getElementById('upload-modal').style.display = 'none'; }

function processWordFile() {
  const fileInput = document.getElementById('import-file'); const subjectKey = document.getElementById('import-subject').value;
  const title = document.getElementById('import-title').value.trim(); const time = parseInt(document.getElementById('import-time').value) || 45;
  if (!title) return alert("Vui lòng nhập tên đề thi!"); if (!fileInput.files.length) return alert("Vui lòng chọn File Word!");

  const reader = new FileReader();
  reader.onload = function(e) {
    const options = {
        convertImage: mammoth.images.imgElement(function(image) { return image.read("base64").then(function(imgBuf) { return { src: "data:" + image.contentType + ";base64," + imgBuf }; }); })
    };

    mammoth.convertToHtml({ arrayBuffer: e.target.result }, options).then(function(result) {
        let rawHtml = result.value;
        // BÓC TÁCH DANH SÁCH ẨN (CHỐNG DÍNH CHỮ CỦA WORD)
        rawHtml = rawHtml.replace(/<li>/gi, "<br>[LI] ");
        rawHtml = rawHtml.replace(/<\/li>/gi, "<br>");
        rawHtml = rawHtml.replace(/<\/p>/gi, "<br><br>");
        rawHtml = rawHtml.replace(/([A-D])\s+[\.\:\)]/gi, "$1.");
        
        const parsedQuestions = parseHtmlToQuestions(rawHtml);
        if (parsedQuestions.length === 0) return alert("Không quét được! Hãy kiểm tra lại file Word.");
        
        dbSubjects[subjectKey].tests.push({ id: "test_" + Date.now(), name: title, time: time, questions: parsedQuestions });
        saveSubjectsToStorage(); alert(`Nạp thành công ${parsedQuestions.length} câu!`); closeUploadModal(); showDashboard();
      }).catch(err => alert("Lỗi: " + err.message));
  }; reader.readAsArrayBuffer(fileInput.files[0]);
}

function parseHtmlToQuestions(html) {
  const tempDiv = document.createElement('div'); tempDiv.innerHTML = html; let lines = [];
  
  tempDiv.childNodes.forEach(node => {
    if (node.nodeName === 'IMG') { lines.push("[IMG] " + node.src); } 
    else if (node.querySelectorAll) {
        node.querySelectorAll('img').forEach(img => lines.push("[IMG] " + img.src));
        let text = node.innerHTML.replace(/<br\s*\/?>/gi, " ||| ");
        let tempP = document.createElement('div'); tempP.innerHTML = text;
        tempP.textContent.split("|||").forEach(t => { let cleanTxt = t.trim(); if(cleanTxt) lines.push(cleanTxt); });
    } else if (node.textContent.trim()) { lines.push(node.textContent.trim()); }
  });

  let questions = []; let currentQ = null; let currentSectionType = 'mcq';

  lines.forEach(line => {
    let textUpper = line.toUpperCase();
    if (textUpper.includes("PHẦN III") || textUpper.includes("TRẢ LỜI NGẮN")) currentSectionType = 'sa';
    else if (textUpper.includes("PHẦN II") || textUpper.includes("ĐÚNG SAI")) currentSectionType = 'tf';
    else if (textUpper.includes("PHẦN I ") || textUpper.includes("NHIỀU PHƯƠNG ÁN")) currentSectionType = 'mcq';

    if (/^Câu\s+\d+[\.\:\-]?/i.test(line)) {
      if (currentQ) questions.push(currentQ);
      currentQ = { text: line, type: currentSectionType, options: {}, items: {}, correct: '', image: null };
    } 
    else if (currentQ) {
      if (line.startsWith("[IMG] ")) { currentQ.image = line.replace("[IMG] ", ""); }
      
      // XỬ LÝ LỖI BULLETS LIST TỪ WORD ĐỂ TẠO TRẮC NGHIỆM / ĐÚNG SAI
      else if (line.startsWith("[LI] ")) {
        let val = line.replace("[LI] ", "").trim();
        if (/^[A-D][\.\:\)]/i.test(val)) {
            currentQ.type = 'mcq'; currentQ.options[val.charAt(0).toUpperCase()] = val.replace(/^[A-D][\.\:\)]\s*/i, '').trim();
        } else if (/^[a-d][\)\.]/i.test(val)) {
            currentQ.type = 'tf'; currentQ.items[val.charAt(0).toLowerCase()] = val.replace(/^[a-d][\)\.]\s*/i, '').trim();
        } else {
            // Tự động gán A,B,C,D nếu Word ăn bớt chữ
            if (currentSectionType === 'mcq') {
                currentQ.type = 'mcq'; const opts = Object.keys(currentQ.options);
                if (opts.length < 4) currentQ.options[String.fromCharCode(65 + opts.length)] = val;
                else currentQ.text += '\n- ' + val;
            } else if (currentSectionType === 'tf') {
                currentQ.type = 'tf'; const items = Object.keys(currentQ.items);
                if (items.length < 4) currentQ.items[String.fromCharCode(97 + items.length)] = val;
                else currentQ.text += '\n- ' + val;
            } else { currentQ.text += '\n- ' + val; }
        }
      }
      else if (/^[A-D][\.\:\)]/i.test(line)) {
        currentQ.type = 'mcq'; currentQ.options[line.charAt(0).toUpperCase()] = line.replace(/^[A-D][\.\:\)]\s*/i, '').trim() || "(Trống)";
      }
      else if (/^[a-d][\)\.]/i.test(line)) {
        currentQ.type = 'tf'; currentQ.items[line.charAt(0).toLowerCase()] = line.replace(/^[a-d][\)\.]\s*/i, '').trim() || "(Trống)";
      }
      else if (/^Đáp\s*án/i.test(line)) {
        const ansValue = line.replace(/^Đáp\s*án\s*[\:\.]?/i, '').trim();
        if (currentQ.type === 'tf') {
          currentQ.correct = {};
          ansValue.split(',').forEach(part => { const [k, v] = part.split('-').map(s => s.trim()); if(k && v) currentQ.correct[k.toLowerCase()] = v.toUpperCase(); });
        } else if (currentSectionType === 'sa') { currentQ.correct = ansValue;
        } else { currentQ.correct = ansValue.toUpperCase(); }
      } 
      else { currentQ.text += '\n' + line; }
    }
  });
  if (currentQ) questions.push(currentQ); return questions;
}