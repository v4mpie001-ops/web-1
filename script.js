// =========================================
// PHẦN 1: TÀI KHOẢN (CÀI CỨNG ĐỂ BẠN BÈ VÀO)
// =========================================
const initialValidCodes = ["VIP2026", "HTA001", "PVK999", "CODE1"];
let defaultUsers = {
  "admin": "123", "hta": "123", "pvk": "123",
  "bantoi1": "123456", "bantoi2": "123456" 
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
    if(!c) return showMsg("Vui lòng nhập Mã xác nhận!"); if(dbUsers[u]) return showMsg("Tài khoản đã tồn tại!"); if(!dbValidCodes.includes(c)) return showMsg("Mã không hợp lệ!");
    dbUsers[u] = p; dbValidCodes = dbValidCodes.filter(code => code !== c);
    localStorage.setItem('dbUsers', JSON.stringify(dbUsers)); localStorage.setItem('dbValidCodes', JSON.stringify(dbValidCodes));
    showMsg("Đăng ký thành công!", false); setTimeout(() => loginSuccess(u), 1000);
  } else {
    if((defaultUsers[u] && defaultUsers[u] === p) || (dbUsers[u] && dbUsers[u] === p)) loginSuccess(u);
    else showMsg("Tài khoản hoặc mật khẩu không chính xác!");
  }
}

function loginSuccess(username) {
  currentUser = username;
  document.getElementById('auth-screen').style.display = 'none'; document.getElementById('dash-username').textContent = `👤 Xin chào, ${username}`;
  document.getElementById('btn-add-test').style.display = ADMIN_ACCOUNTS.includes(username.toLowerCase()) ? 'inline-block' : 'none';
  showDashboard();
}

function logout() {
  currentUser = null; document.getElementById('app-screen').style.display = 'none'; document.getElementById('dashboard-screen').style.display = 'none'; document.getElementById('auth-screen').style.display = 'flex';
}

// =========================================
// PHẦN 2: DATABASE MÔN HỌC & SẢNH CHỜ
// =========================================
let dbSubjects = JSON.parse(localStorage.getItem('dbSubjects')) || (typeof globalData !== 'undefined' ? globalData : {});

function saveSubjectsToStorage() { localStorage.setItem('dbSubjects', JSON.stringify(dbSubjects)); }

function showDashboard() {
  document.getElementById('app-screen').style.display = 'none'; document.getElementById('dashboard-screen').style.display = 'flex';
  document.getElementById('subject-grid').style.display = 'grid'; document.getElementById('test-selection').style.display = 'none';
  document.getElementById('dash-main-title').textContent = "Danh Mục Môn Học";
  
  if (ADMIN_ACCOUNTS.includes(currentUser.toLowerCase()) && !document.getElementById('btn-export-data')) {
      const btnExp = document.createElement('button');
      btnExp.id = 'btn-export-data';
      btnExp.innerHTML = '📤 Xuất Database (Cập nhật Web)';
      btnExp.style = 'background: #10b981; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; margin-left: 10px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);';
      btnExp.onclick = exportDataForGithub;
      document.getElementById('btn-add-test').parentNode.appendChild(btnExp);
  }

  const grid = document.getElementById('subject-grid'); grid.innerHTML = '';
  Object.keys(dbSubjects).forEach(subKey => {
    const sub = dbSubjects[subKey]; const card = document.createElement('div'); card.className = 'subject-card'; card.onclick = () => showTestList(subKey);
    card.innerHTML = `<div class="subject-icon">${sub.icon}</div><div class="subject-name">${sub.name}</div><div style="font-size: 0.9rem; color: #64748b; margin-top: 8px; font-weight: 500;">📚 ${sub.tests.length} Đề thi</div>`;
    grid.appendChild(card);
  });
}

function showTestList(subKey) {
  const sub = dbSubjects[subKey];
  document.getElementById('subject-grid').style.display = 'none'; document.getElementById('test-selection').style.display = 'block'; document.getElementById('dash-main-title').textContent = `Môn: ${sub.name}`;
  const list = document.getElementById('test-list'); list.innerHTML = '';
  if (sub.tests.length === 0) list.innerHTML = '<div style="text-align: center; padding: 20px; color: #94a3b8; font-style: italic;">Chưa có dữ liệu đề thi cho môn này.</div>';
  sub.tests.forEach((test, index) => {
    const item = document.createElement('div'); item.className = 'test-item';
    let adminBtns = ADMIN_ACCOUNTS.includes(currentUser.toLowerCase()) ? `<button style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; margin-right: 10px; font-weight: bold;" onclick="deleteTest('${subKey}', ${index})">🗑️ Xóa Đề</button>` : '';
    item.innerHTML = `<div><h3 style="font-size:1.15rem; margin-bottom:8px; color: #1e293b;">${test.name}</h3><div style="font-size:0.95rem; color:#64748b; font-weight: 500;">⏱ ${test.time} Phút &nbsp;|&nbsp; 📝 ${test.questions.length} Câu hỏi</div></div><div style="display: flex; align-items: center;">${adminBtns}<button class="btn-start-test" onclick="startExam('${subKey}', ${index})">Bắt Đầu Thi 🚀</button></div>`;
    list.appendChild(item);
  });
}

function backToSubjects() { showDashboard(); }
function deleteTest(subKey, index) { if (confirm("Cảnh báo: Bạn có chắc chắn muốn xóa đề thi này không?")) { dbSubjects[subKey].tests.splice(index, 1); saveSubjectsToStorage(); showTestList(subKey); } }

function exportDataForGithub() {
    let dataStr = JSON.stringify(dbSubjects, null, 2); 
    let codeToCopy = `const globalData = ${dataStr};`;
    navigator.clipboard.writeText(codeToCopy).then(() => {
        alert("✅ XUẤT DỮ LIỆU THÀNH CÔNG!\n\nHãy mở file 'database.js' trên Github, xóa trắng code cũ và DÁN đè đoạn code vừa copy vào!");
    }).catch(err => alert("Lỗi Copy: " + err));
}

// =========================================
// PHẦN 3: THI & TÍNH ĐIỂM 
// =========================================
let currentQuestions = []; let currentTestTotalTime = 0; let timerInterval = null; let timeRemaining = 0; let currentQIndex = 0; let userAnswers = {}; let isSubmitted = false;

function restoreImages(str) {
    if (!str) return "";
    return str.replace(/__IMG__(.*?)__IMGEND__/g, '<img src="$1" style="max-width: 100%; height: auto; vertical-align: middle; margin: 4px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">');
}

function startExam(subKey, testIndex) {
  const testData = dbSubjects[subKey].tests[testIndex]; currentQuestions = testData.questions; currentTestTotalTime = testData.time * 60; timeRemaining = currentTestTotalTime;
  document.getElementById('dashboard-screen').style.display = 'none'; document.getElementById('app-screen').style.display = 'flex'; document.getElementById('exam-header-title').textContent = testData.name;
  currentQIndex = 0; userAnswers = {}; isSubmitted = false; 
  document.getElementById('submit-btn').disabled = false; document.getElementById('submit-btn').innerHTML = "📥 Nộp Bài & Chấm Điểm"; 
  document.getElementById('score-display').style.display = 'none';
  renderSidebar(); renderQuestion(); startTimer();
}

function startTimer() {
  clearInterval(timerInterval); updateTimerUI();
  timerInterval = setInterval(() => { timeRemaining--; updateTimerUI(); if (timeRemaining <= 0) { clearInterval(timerInterval); alert("Đã hết thời gian làm bài!"); submitTest(); } }, 1000);
}

function updateTimerUI() {
  const min = Math.floor(timeRemaining / 60); const sec = timeRemaining % 60; document.getElementById('countdown-timer').textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function exitExam() { if (!isSubmitted && !confirm("Bài thi chưa được nộp. Bạn có chắc chắn muốn thoát (Mọi dữ liệu sẽ bị mất)?")) return; clearInterval(timerInterval); showDashboard(); }

function renderQuestion() {
  const q = currentQuestions[currentQIndex]; const container = document.getElementById('answers-container'); container.innerHTML = '';
  
  document.getElementById('q-type-badge').innerHTML = q.type === 'mcq' ? "📌 Trắc Nghiệm Đơn" : q.type === 'tf' ? "📌 Trắc Nghiệm Đúng/Sai" : "📌 Trả Lời Ngắn";
  document.getElementById('q-title').innerHTML = restoreImages(q.text).replace(/\n/g, '<br>');
  
  const imgBox = document.getElementById('q-image-box');
  if (imgBox) imgBox.style.display = 'none'; 

  if (q.type === 'mcq') {
    const optsDiv = document.createElement('div'); optsDiv.className = 'options-container';
    Object.keys(q.options).forEach(key => {
      const opt = document.createElement('div'); opt.className = 'option';
      if (!isSubmitted) opt.onclick = () => { userAnswers[currentQIndex] = key; renderQuestion(); renderSidebar(); };
      if (userAnswers[currentQIndex] === key) opt.classList.add('selected');
      if (isSubmitted) { if (key === q.correct) opt.classList.add('correct'); else if (userAnswers[currentQIndex] === key) opt.classList.add('wrong'); }
      opt.innerHTML = `<div class="opt-label">${key}</div><div style="flex: 1; padding-top: 2px;">${restoreImages(q.options[key])}</div>`; 
      optsDiv.appendChild(opt);
    }); container.appendChild(optsDiv);
  } else if (q.type === 'tf') {
    if (!userAnswers[currentQIndex]) userAnswers[currentQIndex] = {};
    const table = document.createElement('table'); table.className = 'tf-table'; table.innerHTML = `<thead><tr><th>Mệnh Đề</th><th style="width:160px; text-align:center;">Lựa chọn</th></tr></thead><tbody></tbody>`;
    Object.keys(q.items).forEach(subKey => {
      const row = document.createElement('tr'); const userVal = userAnswers[currentQIndex][subKey];
      let btnGroup = `<div class="tf-btn-group" style="justify-content: center;">
                        <button class="tf-btn ${userVal === 'Đ' ? 'selected-D' : ''}" onclick="selectTF('${subKey}', 'Đ')">Đúng</button>
                        <button class="tf-btn ${userVal === 'S' ? 'selected-S' : ''}" onclick="selectTF('${subKey}', 'S')">Sai</button>
                      </div>`;
      if (isSubmitted) {
        btnGroup = `<div style="text-align:center; font-weight:bold; color: ${q.correct[subKey] === userVal ? 'var(--correct)' : 'var(--wrong)'}">
                      ${userVal ? `Chọn: ${userVal} <br>` : ''}Đáp án: ${q.correct[subKey]}
                    </div>`;
      }
      row.innerHTML = `<td><b>${subKey})</b> ${restoreImages(q.items[subKey])}</td><td align="center">${btnGroup}</td>`;
      table.querySelector('tbody').appendChild(row);
    });
    container.appendChild(table);
  } else if (q.type === 'sa') { 
    let val = userAnswers[currentQIndex] || '';
    let inputHtml = `<div class="short-answer-box">
                       <input type="text" class="short-answer-input" value="${val}" ${isSubmitted ? 'readonly' : ''} oninput="userAnswers[currentQIndex]=this.value; renderSidebar();" placeholder="Nhập câu trả lời của bạn vào đây...">
                     </div>`;
    if(isSubmitted) {
       inputHtml += `<div style="margin-top:15px; color:var(--correct); font-weight:bold; font-size: 1.1rem;">✅ Đáp án chính xác: ${q.correct}</div>`;
    }
    container.innerHTML = inputHtml;
  }

  document.getElementById('btn-prev').innerHTML = '⬅ Câu Trước';
  document.getElementById('btn-next').innerHTML = 'Câu Sau ➡';
  document.getElementById('btn-prev').style.display = currentQIndex === 0 ? 'none' : 'inline-block';
  document.getElementById('btn-next').style.display = currentQIndex === currentQuestions.length - 1 ? 'none' : 'inline-block';
}

function selectTF(subKey, val) {
    if(isSubmitted) return;
    userAnswers[currentQIndex][subKey] = val;
    renderQuestion();
    renderSidebar();
}

function changeQuestion(step) {
    currentQIndex += step;
    renderQuestion();
    renderSidebar();
}

function renderSidebar() {
  const grid = document.getElementById('q-grid'); grid.innerHTML = '';
  let sidebarHeader = document.querySelector('.sidebar h3');
  if(sidebarHeader) sidebarHeader.innerHTML = 'BẢNG ĐIỀU KHIỂN';

  let hasRenderedPart1 = false; let hasRenderedPart2 = false;

  currentQuestions.forEach((q, index) => {
    let isSA = (q.type === 'sa');
    
    if (!isSA && !hasRenderedPart1) {
        const h = document.createElement('div');
        h.innerHTML = '<div style="grid-column: 1 / -1; margin-top: 15px; margin-bottom: 5px; font-size: 0.9rem; color: #4f46e5; font-weight: 800; text-align: center; border-bottom: 2px dashed #c7d2fe; padding-bottom: 8px;">I. PHẦN TRẮC NGHIỆM</div>';
        h.style.gridColumn = '1 / -1'; grid.appendChild(h); hasRenderedPart1 = true;
    }
    if (isSA && !hasRenderedPart2) {
        const h = document.createElement('div');
        h.innerHTML = '<div style="grid-column: 1 / -1; margin-top: 15px; margin-bottom: 5px; font-size: 0.9rem; color: #e11d48; font-weight: 800; text-align: center; border-bottom: 2px dashed #fecdd3; padding-bottom: 8px;">II. PHẦN TỰ LUẬN</div>';
        h.style.gridColumn = '1 / -1'; grid.appendChild(h); hasRenderedPart2 = true;
    }

    const btn = document.createElement('div'); btn.className = 'q-btn'; btn.textContent = index + 1;
    btn.onclick = () => { currentQIndex = index; renderSidebar(); renderQuestion(); };
    if (index === currentQIndex) btn.classList.add('active');
    else { let ans = userAnswers[index]; if (ans && (typeof ans !== 'object' || Object.keys(ans).length > 0)) btn.classList.add('answered'); }
    grid.appendChild(btn);
  });
}

function submitTest() {
    if(!isSubmitted && !confirm("Xác nhận nộp bài? Bạn sẽ không thể sửa lại đáp án sau khi nộp.")) return;
    clearInterval(timerInterval);
    isSubmitted = true;
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('submit-btn').innerHTML = "🔒 Đã Nộp Bài";

    let score = 0;
    let maxScore = 0; 

    currentQuestions.forEach((q, i) => {
        let isCorrect = false;
        
        if(q.type === 'mcq') {
            maxScore += 0.25; 
            if(userAnswers[i] === q.correct) { score += 0.25; isCorrect = true; } 
            
        } else if(q.type === 'tf') {
            maxScore += 1.0; 
            let correctCount = 0;
            if(userAnswers[i]) {
               Object.keys(q.items).forEach(k => {
                   if(userAnswers[i][k] === q.correct[k]) correctCount++;
               });
            }
            if(correctCount === 1) score += 0.1;
            else if(correctCount === 2) score += 0.25;
            else if(correctCount === 3) score += 0.5;
            else if(correctCount === 4) { score += 1.0; isCorrect = true; }
            
        } else if(q.type === 'sa') {
            maxScore += 0.25; 
            let ans = (userAnswers[i] || '').toString().trim().toLowerCase();
            let cor = q.correct.toString().trim().toLowerCase();
            if(ans === cor) { score += 0.25; isCorrect = true; } 
        }

        let btn = document.getElementById('q-grid').children[i];
        if (q.type === 'sa' && i !== 0) {
            const allBtns = document.querySelectorAll('.q-btn');
            btn = Array.from(allBtns).find(b => b.textContent == (i + 1));
        }
        
        if (btn) {
            btn.classList.remove('active', 'answered');
            if(isCorrect) {
               btn.classList.add('review-correct');
            } else {
               btn.classList.add('review-wrong');
            }
        }
    });

    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.style.display = 'block';
    const timeTaken = currentTestTotalTime - timeRemaining;
    scoreDisplay.innerHTML = `
        <div class="score-title" style="color:#10b981; font-size:1.5rem;">🎉 BẢNG ĐIỂM CHI TIẾT</div>
        <div class="score-stats" style="background:#f8fafc; border:1px solid #cbd5e1;">
            <span style="color:#0f172a;">🎯 Tổng điểm: <b>${score.toFixed(2)}</b> / ${maxScore.toFixed(2)}</span> 
            <span style="color:#0f172a;">⏱ Thời gian hoàn thành: <b>${Math.floor(timeTaken/60)} phút ${timeTaken%60} giây</b></span>
        </div>`;
    renderQuestion(); 
}

// =========================================
// PHẦN 4: UPLOAD FILE WORD (BỘ PARSER CẤP CAO)
// =========================================
function openUploadModal() { document.getElementById('upload-modal').style.display = 'flex'; }
function closeUploadModal() { document.getElementById('upload-modal').style.display = 'none'; }

function readWordAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const options = { convertImage: mammoth.images.imgElement(image => image.read("base64").then(imgBuf => ({ src: "data:" + image.contentType + ";base64," + imgBuf }))) };
            mammoth.convertToHtml({ arrayBuffer: e.target.result }, options)
                   .then(res => resolve(res.value)).catch(err => reject(err));
        };
        reader.readAsArrayBuffer(file);
    });
}

async function processWordFile() {
  const fileMCQ = document.getElementById('import-file-mcq').files[0];
  const fileSA = document.getElementById('import-file-sa').files[0];
  const subjectKey = document.getElementById('import-subject').value;
  const title = document.getElementById('import-title').value.trim(); 
  const time = parseInt(document.getElementById('import-time').value) || 45;
  
  if (!title) return alert("Vui lòng nhập tên đề thi!"); 
  if (!fileMCQ && !fileSA) return alert("Vui lòng chọn ít nhất 1 File Word (Trắc nghiệm hoặc Tự luận)!");

  try {
      let finalQuestions = [];

      if (fileMCQ) {
          let htmlMCQ = await readWordAsync(fileMCQ);
          finalQuestions = finalQuestions.concat(parseHtmlToQuestions(htmlMCQ, 'mcq_tf'));
      }
      if (fileSA) {
          let htmlSA = await readWordAsync(fileSA);
          finalQuestions = finalQuestions.concat(parseHtmlToQuestions(htmlSA, 'sa'));
      }

      if (finalQuestions.length === 0) return alert("Hệ thống không nhận diện được câu hỏi nào. Hãy đảm bảo file Word đúng định dạng (Câu 1, Câu 2...).");
      
      dbSubjects[subjectKey].tests.push({ id: "test_" + Date.now(), name: title, time: time, questions: finalQuestions });
      saveSubjectsToStorage(); 
      alert(`✅ Nạp thành công tổng cộng ${finalQuestions.length} câu hỏi!`); 
      closeUploadModal(); showDashboard();
  } catch(error) {
      alert("❌ Đã xảy ra lỗi khi đọc file: " + error);
  }
}

function parseHtmlToQuestions(html, forcedMode) {
    let processedHtml = html
        .replace(/<p[^>]*>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<li[^>]*>/gi, "\n[LI] ")
        .replace(/<\/li>/gi, "\n");

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedHtml;

    tempDiv.querySelectorAll('img').forEach(img => {
        let placeholder = document.createTextNode(`__IMG__${img.src}__IMGEND__`);
        img.parentNode.replaceChild(placeholder, img);
    });

    let rawText = tempDiv.textContent || tempDiv.innerText || "";
    
    rawText = rawText.replace(/(^|\s+)([A-D])[\.\:\)]\s+/gi, "\n$2. ");

    let lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');

    let questions = [];
    let currentQ = null;
    let currentSectionType = forcedMode === 'sa' ? 'sa' : 'mcq';

    lines.forEach(line => {
        let textUpper = line.toUpperCase();

        if (forcedMode !== 'sa') {
            if (textUpper.includes("PHẦN II") || textUpper.includes("PHẦN 2") || textUpper.includes("ĐÚNG SAI")) {
                currentSectionType = 'tf'; return;
            } else if (textUpper.includes("PHẦN I") || textUpper.includes("PHẦN 1") || textUpper.includes("NHIỀU PHƯƠNG ÁN")) {
                currentSectionType = 'mcq'; return;
            }
        }

        if (/^Câu\s+\d+[\.\:\-]?/i.test(line)) {
            if (currentQ) questions.push(currentQ);
            currentQ = { text: line, type: currentSectionType, options: {}, items: {}, correct: '' };
        }
        else if (currentQ) {
            if (/^Đáp\s*án/i.test(line)) {
                let ansValue = line.replace(/^Đáp\s*án\s*[\:\.]?/i, '').trim();
                if (currentQ.type === 'tf') {
                    currentQ.correct = {};
                    ansValue.split(',').forEach(part => {
                        let [k, v] = part.split('-').map(s => s.trim());
                        if(k && v) currentQ.correct[k.toLowerCase()] = v.toUpperCase();
                    });
                } else {
                    currentQ.correct = ansValue.toUpperCase();
                }
            }
            else {
                let cleanLine = line.replace(/^\[LI\]\s*/i, "").trim();
                let isOption = false;

                if (currentQ.type === 'mcq') {
                    let match = cleanLine.match(/^([A-D])[\.\:\)\-]\s*(.*)/i);
                    if (match) {
                        currentQ.options[match[1].toUpperCase()] = match[2] || " ";
                        isOption = true;
                    }
                    else if (line.startsWith("[LI] ") && Object.keys(currentQ.options).length < 4) {
                        let nextKey = String.fromCharCode(65 + Object.keys(currentQ.options).length);
                        currentQ.options[nextKey] = cleanLine;
                        isOption = true;
                    }
                }
                else if (currentQ.type === 'tf') {
                    let match = cleanLine.match(/^([a-d])[\.\:\)\-]\s*(.*)/i);
                    if (match) {
                        currentQ.items[match[1].toLowerCase()] = match[2] || " ";
                        isOption = true;
                    }
                    else if (line.startsWith("[LI] ") && Object.keys(currentQ.items).length < 4) {
                        let nextKey = String.fromCharCode(97 + Object.keys(currentQ.items).length);
                        currentQ.items[nextKey] = cleanLine;
                        isOption = true;
                    }
                }

                if (!isOption) {
                    currentQ.text += "\n" + cleanLine;
                }
            }
        }
    });

    if (currentQ) questions.push(currentQ);
    return questions;
}

// =========================================
// PHẦN 5: QUẢN LÝ GIAO DIỆN & HÌNH NỀN (THEME)
// =========================================
function showThemeModal() {
    let modal = document.getElementById('theme-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'theme-modal';
        modal.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999; display:flex; justify-content:center; align-items:center;">
                <div style="background:#ffffff; padding:25px; border-radius:12px; width:450px; max-width:90%; box-shadow:0 20px 40px rgba(0,0,0,0.3);">
                    <h2 style="margin-top:0; color:#1e293b; text-align:center; font-size:1.5rem;">🎨 Chọn Hình Nền (Theme)</h2>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:20px;">
                        <button onclick="setTheme('linear-gradient(to right, #f8fafc, #e2e8f0)')" style="height:70px; background:linear-gradient(to right, #f8fafc, #e2e8f0); border:2px solid #cbd5e1; border-radius:8px; cursor:pointer; font-weight:bold; color:#334155;">Mặc định</button>
                        <button onclick="setTheme('linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)')" style="height:70px; background:linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border:none; border-radius:8px; cursor:pointer; font-weight:bold; color:#1e293b; box-shadow:0 4px 6px rgba(0,0,0,0.1);">Băng Giá ❄</button>
                        <button onclick="setTheme('linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)')" style="height:70px; background:linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%); border:none; border-radius:8px; cursor:pointer; font-weight:bold; color:white; text-shadow:1px 1px 2px rgba(0,0,0,0.5); box-shadow:0 4px 6px rgba(0,0,0,0.1);">Mộng Mơ ✨</button>
                        <button onclick="setTheme('linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)')" style="height:70px; background:linear-gradient(to right, #ffecd2 0%, #fcb69f 100%); border:none; border-radius:8px; cursor:pointer; font-weight:bold; color:#7c2d12; box-shadow:0 4px 6px rgba(0,0,0,0.1);">Hoàng Hôn 🌇</button>
                    </div>
                    
                    <div style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top:15px;">
                        <label style="font-size: 0.95rem; color: #475569; font-weight: bold;">Hoặc dùng ảnh nền tự do (Copy link ảnh trên mạng dán vào đây):</label>
                        <input type="text" id="custom-bg-url" placeholder="VD: https://imgur.com/anh-cua-toi.jpg" style="width:100%; padding:10px; margin-top:8px; box-sizing:border-box; border:2px solid #cbd5e1; border-radius:6px; font-size:1rem;">
                        <button onclick="setCustomTheme()" style="margin-top:12px; width:100%; background:#4f46e5; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:1rem; transition: background 0.2s;">✨ Áp Dụng Ảnh Này</button>
                    </div>
                    
                    <button onclick="closeThemeModal()" style="margin-top:15px; width:100%; background:#ef4444; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:1rem;">❌ Đóng Lại</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
}

function closeThemeModal() {
    const modal = document.getElementById('theme-modal');
    if (modal) modal.style.display = 'none';
}

function setTheme(bgValue) {
    document.body.style.background = bgValue;
    localStorage.setItem('savedTheme', bgValue);
}

function setCustomTheme() {
    const url = document.getElementById('custom-bg-url').value.trim();
    if(url) {
        const bgValue = `url('${url}') center/cover no-repeat fixed`;
        setTheme(bgValue);
    }
}

window.addEventListener('DOMContentLoaded', (event) => {
    const savedTheme = localStorage.getItem('savedTheme');
    if (savedTheme) document.body.style.background = savedTheme;
    
    document.querySelectorAll('button, a').forEach(el => {
        const text = el.innerText.toLowerCase();
        if(text.includes('đổi hình nền') || text.includes('theme') || text.includes('giao diện')) {
            el.onclick = (e) => {
                e.preventDefault();
                showThemeModal();
            };
        }
    });
});