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
let dbSubjects = JSON.parse(localStorage.getItem('dbSubjects')) || (typeof globalData !== 'undefined' ? globalData : {});

function saveSubjectsToStorage() { localStorage.setItem('dbSubjects', JSON.stringify(dbSubjects)); }

function showDashboard() {
  document.getElementById('app-screen').style.display = 'none'; document.getElementById('dashboard-screen').style.display = 'flex';
  document.getElementById('subject-grid').style.display = 'grid'; document.getElementById('test-selection').style.display = 'none';
  document.getElementById('dash-main-title').textContent = "Chọn môn học";
  
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

function renderQuestion() {
  const q = currentQuestions[currentQIndex]; const container = document.getElementById('answers-container'); container.innerHTML = '';
  document.getElementById('q-type-badge').textContent = q.type === 'mcq' ? "Dạng 1: Trắc nghiệm 4 đáp án" : q.type === 'tf' ? "Dạng 2: Đúng/Sai" : "Dạng 3: Trả lời ngắn";
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
    const table = document.createElement('table'); table.className = 'tf-table'; table.innerHTML = `<thead><tr><th>Ý Mệnh Đề</th><th style="width:160px; text-align:center;">Lựa chọn</th></tr></thead><tbody></tbody>`;
    Object.keys(q.items).forEach(subKey => {
      const row = document.createElement('tr'); const userVal = userAnswers[currentQIndex][subKey];
      let btnGroup = `<div class="tf-btn-group" style="justify-content: center;">
                        <button class="tf-btn ${userVal === 'Đ' ? 'selected-D' : ''}" onclick="selectTF('${subKey}', 'Đ')">Đúng</button>
                        <button class="tf-btn ${userVal === 'S' ? 'selected-S' : ''}" onclick="selectTF('${subKey}', 'S')">Sai</button>
                      </div>`;
      if (isSubmitted) {
        btnGroup = `<div style="text-align:center; font-weight:bold; color: ${q.correct[subKey] === userVal ? 'var(--correct)' : 'var(--wrong)'}">
                      ${userVal ? `Bạn chọn: ${userVal} <br>` : ''}Đáp án: ${q.correct[subKey]}
                    </div>`;
      }
      row.innerHTML = `<td><b>${subKey})</b> ${q.items[subKey]}</td><td align="center">${btnGroup}</td>`;
      table.querySelector('tbody').appendChild(row);
    });
    container.appendChild(table);
  } else if (q.type === 'sa') { // Trả lời ngắn
    let val = userAnswers[currentQIndex] || '';
    let inputHtml = `<div class="short-answer-box">
                       <input type="text" class="short-answer-input" value="${val}" ${isSubmitted ? 'readonly' : ''} oninput="userAnswers[currentQIndex]=this.value; renderSidebar();" placeholder="Nhập đáp án...">
                     </div>`;
    if(isSubmitted) {
       inputHtml += `<div style="margin-top:15px; color:var(--correct); font-weight:bold;">✅ Đáp án đúng: ${q.correct}</div>`;
    }
    container.innerHTML = inputHtml;
  }

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

// Render Sidebar chia phần chuẩn mực
function renderSidebar() {
  const grid = document.getElementById('q-grid'); grid.innerHTML = '';
  let hasRenderedPart1 = false; let hasRenderedPart2 = false;

  currentQuestions.forEach((q, index) => {
    let isSA = (q.type === 'sa');
    
    // In tiêu đề phân cách
    if (!isSA && !hasRenderedPart1) {
        const h = document.createElement('div');
        h.innerHTML = '<div style="grid-column: 1 / -1; margin-top: 10px; font-size: 0.8rem; color: #8b5cf6; font-weight: bold; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 5px;">PHẦN TRẮC NGHIỆM</div>';
        h.style.gridColumn = '1 / -1'; grid.appendChild(h); hasRenderedPart1 = true;
    }
    if (isSA && !hasRenderedPart2) {
        const h = document.createElement('div');
        h.innerHTML = '<div style="grid-column: 1 / -1; margin-top: 10px; font-size: 0.8rem; color: #ef4444; font-weight: bold; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 5px;">PHẦN TỰ LUẬN</div>';
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
    if(!isSubmitted && !confirm("Bạn có chắc chắn muốn nộp bài?")) return;
    clearInterval(timerInterval);
    isSubmitted = true;
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('submit-btn').textContent = "Đã nộp bài";

    let score = 0;
    // Chấm điểm theo chuẩn
    currentQuestions.forEach((q, i) => {
        let isCorrect = false;
        if(q.type === 'mcq') {
            if(userAnswers[i] === q.correct) { score += 0.25; isCorrect = true; } 
        } else if(q.type === 'tf') {
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
            let ans = (userAnswers[i] || '').toString().trim().toLowerCase();
            let cor = q.correct.toString().trim().toLowerCase();
            if(ans === cor) { score += 0.25; isCorrect = true; } // Tuỳ chỉnh điểm câu tự luận ở đây
        }

        // Cập nhật sidebar màu sắc
        let btn = document.getElementById('q-grid').children[i];
        if (q.type === 'sa' && i !== 0) {
            // Tính bù chỉ số cho các thẻ tiêu đề (nếu phần tử bị xô lệch)
            // Lấy trực tiếp button theo nội dung số câu
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
    scoreDisplay.innerHTML = `<div class="score-title">KẾT QUẢ BÀI THI</div>
                              <div class="score-stats">
                                <span>🎯 Điểm: ${score.toFixed(2)}</span> 
                                <span>⏱ Thời gian làm: ${Math.floor(timeTaken/60)} phút ${timeTaken%60} giây</span>
                              </div>`;
    renderQuestion(); // Render lại để hiện đáp án chi tiết
}

// =========================================
// PHẦN 4: UPLOAD FILE WORD (MAMMOTH.JS)
// =========================================
function openUploadModal() { document.getElementById('upload-modal').style.display = 'flex'; }
function closeUploadModal() { document.getElementById('upload-modal').style.display = 'none'; }

// Hàm đọc file Word thành HTML (Trả về Promise để dùng Async/Await)
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

function cleanWordHTML(rawHtml) {
    let clean = rawHtml.replace(/<li>/gi, "<br>[LI] ").replace(/<\/li>/gi, "<br>").replace(/<\/p>/gi, "<br><br>").replace(/([A-D])\s+[\.\:\)]/gi, "$1.");
    return clean;
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

      // 1. Quét file Trắc Nghiệm / Đúng Sai (Ép chế độ mcq_tf)
      if (fileMCQ) {
          let htmlMCQ = await readWordAsync(fileMCQ);
          finalQuestions = finalQuestions.concat(parseHtmlToQuestions(cleanWordHTML(htmlMCQ), 'mcq_tf'));
      }

      // 2. Quét file Tự Luận (Ép chế độ sa)
      if (fileSA) {
          let htmlSA = await readWordAsync(fileSA);
          finalQuestions = finalQuestions.concat(parseHtmlToQuestions(cleanWordHTML(htmlSA), 'sa'));
      }

      if (finalQuestions.length === 0) return alert("Không nhận diện được câu hỏi nào. Hãy kiểm tra lại file Word!");
      
      dbSubjects[subjectKey].tests.push({ id: "test_" + Date.now(), name: title, time: time, questions: finalQuestions });
      saveSubjectsToStorage(); 
      alert(`Nạp thành công tổng cộng ${finalQuestions.length} câu (Gồm cả 2 phần)!`); 
      closeUploadModal(); showDashboard();

  } catch(error) {
      alert("Lỗi khi đọc file: " + error);
  }
}

// Parser Bất Bại: Tách đôi não để không bị nhầm lẫn
function parseHtmlToQuestions(html, forcedMode) {
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
    
    // Gán type cứng cho từng file
    if (forcedMode === 'sa') { currentSectionType = 'sa'; } 
    else {
        if (textUpper.includes("PHẦN II") || textUpper.includes("ĐÚNG SAI")) currentSectionType = 'tf';
        else if (textUpper.includes("PHẦN I ") || textUpper.includes("NHIỀU PHƯƠNG ÁN")) currentSectionType = 'mcq';
    }

    if (/^Câu\s+\d+[\.\:\-]?/i.test(line)) {
      if (currentQ) questions.push(currentQ);
      currentQ = { text: line, type: currentSectionType, options: {}, items: {}, correct: '', image: null };
    } 
    else if (currentQ) {
      if (line.startsWith("[IMG] ")) { currentQ.image = line.replace("[IMG] ", ""); }
      
      // XỬ LÝ DÀNH RIÊNG CHO TỰ LUẬN (Bỏ qua hoàn toàn A B C D)
      else if (forcedMode === 'sa') {
          if (/^Đáp\s*án/i.test(line)) { currentQ.correct = line.replace(/^Đáp\s*án\s*[\:\.]?/i, '').trim(); } 
          else { currentQ.text += '\n' + line; }
      }
      
      // XỬ LÝ DÀNH RIÊNG CHO TRẮC NGHIỆM / ĐÚNG SAI
      else if (forcedMode === 'mcq_tf') {
          if (line.startsWith("[LI] ")) {
            let val = line.replace("[LI] ", "").trim();
            if (/^[A-D][\.\:\)]/i.test(val)) { currentQ.type = 'mcq'; currentQ.options[val.charAt(0).toUpperCase()] = val.replace(/^[A-D][\.\:\)]\s*/i, '').trim(); } 
            else if (/^[a-d][\)\.]/i.test(val)) { currentQ.type = 'tf'; currentQ.items[val.charAt(0).toLowerCase()] = val.replace(/^[a-d][\)\.]\s*/i, '').trim(); } 
            else {
                if (currentSectionType === 'mcq') { const opts = Object.keys(currentQ.options); if (opts.length < 4) currentQ.options[String.fromCharCode(65 + opts.length)] = val; else currentQ.text += '\n- ' + val; } 
                else if (currentSectionType === 'tf') { const items = Object.keys(currentQ.items); if (items.length < 4) currentQ.items[String.fromCharCode(97 + items.length)] = val; else currentQ.text += '\n- ' + val; } 
                else { currentQ.text += '\n- ' + val; }
            }
          }
          else if (/^[A-D][\.\:\)]/i.test(line)) { currentQ.type = 'mcq'; currentQ.options[line.charAt(0).toUpperCase()] = line.replace(/^[A-D][\.\:\)]\s*/i, '').trim() || "(Trống)"; }
          else if (/^[a-d][\)\.]/i.test(line)) { currentQ.type = 'tf'; currentQ.items[line.charAt(0).toLowerCase()] = line.replace(/^[a-d][\)\.]\s*/i, '').trim() || "(Trống)"; }
          else if (/^Đáp\s*án/i.test(line)) {
            const ansValue = line.replace(/^Đáp\s*án\s*[\:\.]?/i, '').trim();
            if (currentQ.type === 'tf') {
              currentQ.correct = {};
              ansValue.split(',').forEach(part => { const [k, v] = part.split('-').map(s => s.trim()); if(k && v) currentQ.correct[k.toLowerCase()] = v.toUpperCase(); });
            } else { currentQ.correct = ansValue.toUpperCase(); }
          } 
          else { currentQ.text += '\n' + line; }
      }
    }
  });
  if (currentQ) questions.push(currentQ); return questions;
}